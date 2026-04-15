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
  const [rows] = await pool.query<IOrderRow[]>(
    `SELECT id, user_id, table_id, total_amount, order_status, payment_status, created_at
     FROM orders
     ORDER BY created_at DESC`,
  );
  return rows;
};

/**
 * Tìm order theo id, trả về order kèm danh sách items.
 *
 * @returns IOrderWithItems nếu tìm thấy, null nếu không tồn tại
 */
export const findById = async (id: string): Promise<IOrderWithItems | null> => {
  const [orderRows] = await pool.query<IOrderRow[]>(
    `SELECT id, user_id, table_id, total_amount, order_status, payment_status, created_at
     FROM orders
     WHERE id = ? LIMIT 1`,
    [id],
  );

  if (!orderRows[0]) return null;

  const [itemRows] = await pool.query<IOrderItemRow[]>(
    `SELECT id, order_id, menu_item_id, quantity, unit_price, notes
     FROM order_items
     WHERE order_id = ?`,
    [id],
  );

  return { order: orderRows[0], items: itemRows };
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
  const connection = await (pool as any).getConnection();

  try {
    await connection.beginTransaction();

    // Bước 1: Tạo order cha
    const { user_id, table_id = null, total_amount, order_status = 'pending', payment_status = 'unpaid' } = orderData;

    const [orderInsertResult] = await connection.query(
      `INSERT INTO orders (user_id, table_id, total_amount, order_status, payment_status)
       VALUES (?, ?, ?, ?, ?)`,
      [user_id, table_id, total_amount, order_status, payment_status],
    );

    // Get lại order cha vừa tạo
    const [orderRows] = await connection.query<IOrderRow[]>(
      `SELECT id, user_id, table_id, total_amount, order_status, payment_status, created_at
       FROM orders WHERE id = ?`,
      [(orderInsertResult as any).insertId],
    );
    const order = orderRows[0];

    // Bước 2: Tạo từng order item con
    const insertedItems: IOrderItemRow[] = [];

    for (const item of itemsArray) {
      const [itemInsertResult] = await connection.query(
        `INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price, notes)
         VALUES (?, ?, ?, ?, ?)`,
        [order.id, item.menu_item_id, item.quantity, item.unit_price, item.notes ?? null],
      );

      const [itemRows] = await connection.query<IOrderItemRow[]>(
        `SELECT id, order_id, menu_item_id, quantity, unit_price, notes
         FROM order_items WHERE id = ?`,
        [(itemInsertResult as any).insertId],
      );
      insertedItems.push(itemRows[0]);
    }

    await connection.commit();

    return { order, items: insertedItems };
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    await connection.release();
  }
};

/**
 * Cập nhật order theo id (chỉ các trường trạng thái — không cho sửa items).
 *
 * @returns IOrderRow sau khi cập nhật, null nếu không tìm thấy
 */
export const update = async (id: string, data: IUpdateOrderData): Promise<IOrderRow | null> => {
  const { table_id, order_status, payment_status } = data;

  await pool.query(
    `UPDATE orders
     SET table_id       = COALESCE(?, table_id),
         order_status   = COALESCE(?, order_status),
         payment_status = COALESCE(?, payment_status)
     WHERE id = ?`,
    [table_id ?? null, order_status ?? null, payment_status ?? null, id],
  );

  const [rows] = await pool.query<IOrderRow[]>(
    `SELECT id, user_id, table_id, total_amount, order_status, payment_status, created_at FROM orders WHERE id = ?`,
    [id],
  );

  return rows[0] ?? null;
};

/**
 * Xoá order theo id (CASCADE sẽ xoá order_items liên quan nếu được cấu hình trong DB).
 *
 * @returns IOrderRow vừa bị xoá, null nếu không tìm thấy
 */
export const remove = async (id: string): Promise<IOrderRow | null> => {
  const [rows] = await pool.query<IOrderRow[]>(
    'SELECT id, user_id, table_id, total_amount, order_status, payment_status, created_at FROM orders WHERE id = ?',
    [id],
  );
  const dataToReturn = rows[0];

  await pool.query(
    'DELETE FROM orders WHERE id = ?',
    [id],
  );

  return dataToReturn ?? null;
};
