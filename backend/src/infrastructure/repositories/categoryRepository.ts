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
  const result = await pool.query<ICategoryRow>(
    'SELECT id, name, description, image_url FROM categories ORDER BY name ASC',
  );
  return result.rows;
};

/**
 * Tìm category theo id (UUID).
 * Dùng parameterized query ($1) để ngăn SQL Injection.
 *
 * @returns ICategoryRow nếu tìm thấy, null nếu không tồn tại
 */
export const findById = async (id: string): Promise<ICategoryRow | null> => {
  const result = await pool.query<ICategoryRow>(
    'SELECT id, name, description, image_url FROM categories WHERE id = $1 LIMIT 1',
    [id],
  );
  return result.rows[0] ?? null;
};

/**
 * Tạo category mới và trả về row vừa tạo.
 * RETURNING * để lấy đầy đủ dữ liệu bao gồm id UUID do DB sinh ra.
 *
 * @returns ICategoryRow - category vừa tạo
 */
export const create = async (data: ICreateCategoryData): Promise<ICategoryRow> => {
  const { name, description = null, image_url = null } = data;

  const result = await pool.query<ICategoryRow>(
    `INSERT INTO categories (name, description, image_url)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [name, description, image_url],
  );
  return result.rows[0];
};

/**
 * Cập nhật category theo id. Chỉ set các cột có giá trị được truyền vào.
 * Dùng RETURNING * để trả về row sau khi cập nhật.
 *
 * @returns ICategoryRow sau khi cập nhật, null nếu không tìm thấy
 */
export const update = async (id: string, data: IUpdateCategoryData): Promise<ICategoryRow | null> => {
  const { name, description, image_url } = data;

  const result = await pool.query<ICategoryRow>(
    `UPDATE categories
     SET name      = COALESCE($1, name),
         description = COALESCE($2, description),
         image_url = COALESCE($3, image_url)
     WHERE id = $4
     RETURNING *`,
    [name ?? null, description ?? null, image_url ?? null, id],
  );
  return result.rows[0] ?? null;
};

/**
 * Xoá category theo id.
 * Dùng RETURNING * để xác nhận bản ghi tồn tại trước khi xoá.
 *
 * @returns ICategoryRow vừa bị xoá, null nếu không tìm thấy
 */
export const remove = async (id: string): Promise<ICategoryRow | null> => {
  const result = await pool.query<ICategoryRow>(
    'DELETE FROM categories WHERE id = $1 RETURNING *',
    [id],
  );
  return result.rows[0] ?? null;
};
