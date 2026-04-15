import pool from '../database/postgres';

/**
 * ICategoryRow - Kiểu dữ liệu ánh xạ trực tiếp từ bảng `categories` trong PostgreSQL.
 * Dùng snake_case để khớp chính xác với tên cột trong DB.
 */
export interface ICategoryRow {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
}

/**
 * ICreateCategoryData - DTO cho thao tác tạo category mới.
 */
export interface ICreateCategoryData {
  name: string;
  description?: string;
  image_url?: string;
}

/**
 * IUpdateCategoryData - DTO cho thao tác cập nhật category.
 */
export interface IUpdateCategoryData {
  name?: string;
  description?: string;
  image_url?: string;
}

/**
 * Lấy toàn bộ danh sách categories.
 *
 * @returns Mảng ICategoryRow
 */
export const findAll = async (): Promise<ICategoryRow[]> => {
  const [rows] = await pool.query<ICategoryRow[]>(
    'SELECT id, name, description, image_url FROM categories ORDER BY name ASC',
  );
  return rows;
};

/**
 * Tìm category theo id (UUID).
 * Dùng parameterized query (?) để ngăn SQL Injection.
 *
 * @returns ICategoryRow nếu tìm thấy, null nếu không tồn tại
 */
export const findById = async (id: string): Promise<ICategoryRow | null> => {
  const [rows] = await pool.query<ICategoryRow[]>(
    'SELECT id, name, description, image_url FROM categories WHERE id = ? LIMIT 1',
    [id],
  );
  return rows[0] ?? null;
};

/**
 * Tạo category mới và trả về row vừa tạo.
 * MySQL không hỗ trợ RETURNING, nên INSERT rồi SELECT lại.
 *
 * @returns ICategoryRow - category vừa tạo
 */
export const create = async (data: ICreateCategoryData): Promise<ICategoryRow> => {
  const { name, description = null, image_url = null } = data;

  const [insertResult] = await pool.query(
    `INSERT INTO categories (name, description, image_url)
     VALUES (?, ?, ?)`,
    [name, description, image_url],
  );

  const [rows] = await pool.query<ICategoryRow[]>(
    'SELECT * FROM categories WHERE id = ?',
    [(insertResult as any).insertId],
  );

  return rows[0];
};

/**
 * Cập nhật category theo id. Chỉ set các cột có giá trị được truyền vào.
 * MySQL không hỗ trợ RETURNING, nên UPDATE rồi SELECT lại.
 *
 * @returns ICategoryRow sau khi cập nhật, null nếu không tìm thấy
 */
export const update = async (id: string, data: IUpdateCategoryData): Promise<ICategoryRow | null> => {
  const { name, description, image_url } = data;

  await pool.query(
    `UPDATE categories
     SET name      = COALESCE(?, name),
         description = COALESCE(?, description),
         image_url = COALESCE(?, image_url)
     WHERE id = ?`,
    [name ?? null, description ?? null, image_url ?? null, id],
  );

  const [rows] = await pool.query<ICategoryRow[]>(
    'SELECT * FROM categories WHERE id = ?',
    [id],
  );

  return rows[0] ?? null;
};

/**
 * Xoá category theo id.
 * MySQL không hỗ trợ RETURNING, nên SELECT trước rồi DELETE sau.
 *
 * @returns ICategoryRow vừa bị xoá, null nếu không tìm thấy
 */
export const remove = async (id: string): Promise<ICategoryRow | null> => {
  const [rows] = await pool.query<ICategoryRow[]>(
    'SELECT * FROM categories WHERE id = ?',
    [id],
  );
  const dataToReturn = rows[0];

  await pool.query(
    'DELETE FROM categories WHERE id = ?',
    [id],
  );

  return dataToReturn ?? null;
};
