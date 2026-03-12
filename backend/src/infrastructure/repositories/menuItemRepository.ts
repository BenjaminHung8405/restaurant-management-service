import pool from '../database/postgres';

/**
 * IMenuItemRow - Kiểu dữ liệu ánh xạ trực tiếp từ bảng `menu_items` trong PostgreSQL.
 * Dùng snake_case để khớp chính xác với tên cột trong DB.
 */
export interface IMenuItemRow {
  id: string;
  category_id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  area: string | null;
  is_available: boolean;
}

/**
 * ICreateMenuItemData - DTO cho thao tác tạo menu item mới.
 */
export interface ICreateMenuItemData {
  category_id: string;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  area?: string;
  is_available?: boolean;
}

/**
 * IUpdateMenuItemData - DTO cho thao tác cập nhật menu item.
 */
export interface IUpdateMenuItemData {
  category_id?: string;
  name?: string;
  description?: string;
  price?: number;
  image_url?: string;
  area?: string;
  is_available?: boolean;
}

/**
 * Lấy toàn bộ danh sách menu items, hỗ trợ lọc tuỳ chọn theo category_id.
 *
 * Khi `categoryId` được truyền vào, thêm mệnh đề WHERE để lọc kết quả —
 * tránh lấy dư dữ liệu không cần thiết từ DB.
 *
 * @param categoryId - (tuỳ chọn) UUID của category cần lọc
 * @returns Mảng IMenuItemRow
 */
export const findAll = async (categoryId?: string): Promise<IMenuItemRow[]> => {
  if (categoryId) {
    const result = await pool.query<IMenuItemRow>(
      `SELECT id, category_id, name, description, price, image_url, area, is_available
       FROM menu_items
       WHERE category_id = $1
       ORDER BY name ASC`,
      [categoryId],
    );
    return result.rows;
  }

  const result = await pool.query<IMenuItemRow>(
    `SELECT id, category_id, name, description, price, image_url, area, is_available
     FROM menu_items
     ORDER BY name ASC`,
  );
  return result.rows;
};

/**
 * Tìm menu item theo id (UUID).
 * Dùng parameterized query ($1) để ngăn SQL Injection.
 *
 * @returns IMenuItemRow nếu tìm thấy, null nếu không tồn tại
 */
export const findById = async (id: string): Promise<IMenuItemRow | null> => {
  const result = await pool.query<IMenuItemRow>(
    `SELECT id, category_id, name, description, price, image_url, area, is_available
     FROM menu_items
     WHERE id = $1 LIMIT 1`,
    [id],
  );
  return result.rows[0] ?? null;
};

/**
 * Tạo menu item mới và trả về row vừa tạo.
 * RETURNING * để lấy đầy đủ dữ liệu bao gồm id UUID do DB sinh ra.
 *
 * @returns IMenuItemRow - menu item vừa tạo
 */
export const create = async (data: ICreateMenuItemData): Promise<IMenuItemRow> => {
  const {
    category_id,
    name,
    description = null,
    price,
    image_url = null,
    area = null,
    is_available = true,
  } = data;

  const result = await pool.query<IMenuItemRow>(
    `INSERT INTO menu_items (category_id, name, description, price, image_url, area, is_available)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [category_id, name, description, price, image_url, area, is_available],
  );
  return result.rows[0];
};

/**
 * Cập nhật menu item theo id. Chỉ set các cột có giá trị được truyền vào.
 * Dùng RETURNING * để trả về row sau khi cập nhật.
 *
 * @returns IMenuItemRow sau khi cập nhật, null nếu không tìm thấy
 */
export const update = async (id: string, data: IUpdateMenuItemData): Promise<IMenuItemRow | null> => {
  const { category_id, name, description, price, image_url, area, is_available } = data;

  const result = await pool.query<IMenuItemRow>(
    `UPDATE menu_items
     SET category_id  = COALESCE($1, category_id),
         name         = COALESCE($2, name),
         description  = COALESCE($3, description),
         price        = COALESCE($4, price),
         image_url    = COALESCE($5, image_url),
         area         = COALESCE($6, area),
         is_available = COALESCE($7, is_available)
     WHERE id = $8
     RETURNING *`,
    [
      category_id ?? null,
      name ?? null,
      description ?? null,
      price ?? null,
      image_url ?? null,
      area ?? null,
      is_available ?? null,
      id,
    ],
  );
  return result.rows[0] ?? null;
};

/**
 * Xoá menu item theo id.
 * Dùng RETURNING * để xác nhận bản ghi tồn tại trước khi xoá.
 *
 * @returns IMenuItemRow vừa bị xoá, null nếu không tìm thấy
 */
export const remove = async (id: string): Promise<IMenuItemRow | null> => {
  const result = await pool.query<IMenuItemRow>(
    'DELETE FROM menu_items WHERE id = $1 RETURNING *',
    [id],
  );
  return result.rows[0] ?? null;
};
