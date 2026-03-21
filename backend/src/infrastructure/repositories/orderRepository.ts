import pool from '../database/postgres';

/**
 * IOrderRow - Kiểu dữ liệu ánh xạ từ bảng `orders`.
 */
export interface IOrderRow {
  id: string;
  user_id: string | null;
  table_id: string | null;
  total_amount: number;
  order_status: string;
  payment_status: string;
  created_at: Date;
}

/**
 * IOrderItemRow - Kiểu dữ liệu ánh xạ từ bảng `order_items`.
 */
export interface IOrderItemRow {
  id: string;
  order_id: string;
  menu_item_id: string;
  quantity: number;
  unit_price: number;
  notes: string | null;
}

/**
 * IOrderWithItems - Order kèm theo danh sách items, dùng làm response payload.
 */
export interface IOrderWithItems {
  order: IOrderRow;
  items: IOrderItemRow[];
}

/**
 * ICreateOrderItem - DTO cho từng dòng item khi tạo order.
 */
export interface ICreateOrderItem {
  menu_item_id: string;
  quantity: number;
  unit_price: number;
  notes?: string;
}

/**
 * ICreateOrderData - DTO cho thao tác tạo order mới.
 */
export interface ICreateOrderData {
  user_id: string | null;
  table_id?: string | null;
  total_amount: number;
  order_status?: string;
  payment_status?: string;
}

/**
 * IUpdateOrderData - DTO cho thao tác cập nhật order.
 */
export interface IUpdateOrderData {
  table_id?: string | null;
  order_status?: string;
  payment_status?: string;
}

/**
 * Lấy toàn bộ danh sách orders kèm thông tin cơ bản.
 * Sắp xếp theo thời gian tạo mới nhất trước.
 *
 * @returns Mảng IOrderRow
 */
export const findAll = async (): Promise<IOrderRow[]> => {
  const result = await pool.query<IOrderRow>(
    `SELECT id, user_id, table_id, total_amount, order_status, payment_status, created_at
     FROM orders
     ORDER BY created_at DESC`,
  );
  return result.rows;
};

/**
 * Tìm order theo id, trả về order kèm danh sách items.
 *
 * @returns IOrderWithItems nếu tìm thấy, null nếu không tồn tại
 */
export const findById = async (id: string): Promise<IOrderWithItems | null> => {
  const orderResult = await pool.query<IOrderRow>(
    `SELECT id, user_id, table_id, total_amount, order_status, payment_status, created_at
     FROM orders
     WHERE id = $1 LIMIT 1`,
    [id],
  );

  if (!orderResult.rows[0]) return null;

  const itemsResult = await pool.query<IOrderItemRow>(
    `SELECT id, order_id, menu_item_id, quantity, unit_price, notes
     FROM order_items
     WHERE order_id = $1`,
    [id],
  );

  return { order: orderResult.rows[0], items: itemsResult.rows };
};

/**
 * Tạo order mới cùng với order_items trong một database transaction.
 *
 * Đảm bảo tính toàn vẹn dữ liệu (ACID):
 * - Nếu bất kỳ INSERT nào thất bại → ROLLBACK toàn bộ.
 * - Chỉ COMMIT khi tất cả bước thành công.
 *
 * @throws Ném lại lỗi gốc sau khi ROLLBACK để Service layer xử lý
 */
export const createOrderWithItems = async (
  orderData: ICreateOrderData,
  itemsArray: ICreateOrderItem[],
): Promise<IOrderWithItems> => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Bước 1: Tạo order cha
    const { user_id, table_id = null, total_amount, order_status = 'pending', payment_status = 'unpaid' } = orderData;

    const orderResult = await client.query<IOrderRow>(
      `INSERT INTO orders (user_id, table_id, total_amount, order_status, payment_status)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, user_id, table_id, total_amount, order_status, payment_status, created_at`,
      [user_id, table_id, total_amount, order_status, payment_status],
    );

    const order = orderResult.rows[0];

    // Bước 2: Tạo từng order item con
    const insertedItems: IOrderItemRow[] = [];

    for (const item of itemsArray) {
      const itemResult = await client.query<IOrderItemRow>(
        `INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price, notes)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, order_id, menu_item_id, quantity, unit_price, notes`,
        [order.id, item.menu_item_id, item.quantity, item.unit_price, item.notes ?? null],
      );
      insertedItems.push(itemResult.rows[0]);
    }

    await client.query('COMMIT');

    return { order, items: insertedItems };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

/**
 * Cập nhật order theo id (chỉ các trường trạng thái — không cho sửa items).
 *
 * @returns IOrderRow sau khi cập nhật, null nếu không tìm thấy
 */
export const update = async (id: string, data: IUpdateOrderData): Promise<IOrderRow | null> => {
  const { table_id, order_status, payment_status } = data;

  const result = await pool.query<IOrderRow>(
    `UPDATE orders
     SET table_id       = COALESCE($1, table_id),
         order_status   = COALESCE($2, order_status),
         payment_status = COALESCE($3, payment_status)
     WHERE id = $4
     RETURNING id, user_id, table_id, total_amount, order_status, payment_status, created_at`,
    [table_id ?? null, order_status ?? null, payment_status ?? null, id],
  );
  return result.rows[0] ?? null;
};

/**
 * Xoá order theo id (CASCADE sẽ xoá order_items liên quan nếu được cấu hình trong DB).
 *
 * @returns IOrderRow vừa bị xoá, null nếu không tìm thấy
 */
export const remove = async (id: string): Promise<IOrderRow | null> => {
  const result = await pool.query<IOrderRow>(
    'DELETE FROM orders WHERE id = $1 RETURNING id, user_id, table_id, total_amount, order_status, payment_status, created_at',
    [id],
  );
  return result.rows[0] ?? null;
};
