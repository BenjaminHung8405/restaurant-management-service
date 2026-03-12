import pool from '../database/postgres';

/**
 * ITableRow - Kiểu dữ liệu ánh xạ trực tiếp từ bảng `tables` trong PostgreSQL.
 * Dùng snake_case để khớp chính xác với tên cột trong DB.
 */
export interface ITableRow {
  id: string;
  table_number: number;
  capacity: number;
  status: string;
}

/**
 * ICreateTableData - DTO cho thao tác tạo bàn mới.
 */
export interface ICreateTableData {
  table_number: number;
  capacity: number;
  status?: string;
}

/**
 * IUpdateTableData - DTO cho thao tác cập nhật thông tin bàn.
 */
export interface IUpdateTableData {
  table_number?: number;
  capacity?: number;
  status?: string;
}

/**
 * Lấy toàn bộ danh sách bàn, sắp xếp theo số bàn tăng dần.
 *
 * @returns Mảng ITableRow
 */
export const findAll = async (): Promise<ITableRow[]> => {
  const result = await pool.query<ITableRow>(
    'SELECT id, table_number, capacity, status FROM tables ORDER BY table_number ASC',
  );
  return result.rows;
};

/**
 * Tìm bàn theo id (UUID).
 * Dùng parameterized query ($1) để ngăn SQL Injection.
 *
 * @returns ITableRow nếu tìm thấy, null nếu không tồn tại
 */
export const findById = async (id: string): Promise<ITableRow | null> => {
  const result = await pool.query<ITableRow>(
    'SELECT id, table_number, capacity, status FROM tables WHERE id = $1 LIMIT 1',
    [id],
  );
  return result.rows[0] ?? null;
};

/**
 * Tạo bàn mới và trả về row vừa tạo.
 * RETURNING * để lấy đầy đủ dữ liệu bao gồm id UUID do DB sinh ra.
 *
 * @returns ITableRow - bàn vừa tạo
 */
export const create = async (data: ICreateTableData): Promise<ITableRow> => {
  const { table_number, capacity, status = 'available' } = data;

  const result = await pool.query<ITableRow>(
    `INSERT INTO tables (table_number, capacity, status)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [table_number, capacity, status],
  );
  return result.rows[0];
};

/**
 * Cập nhật bàn theo id. Chỉ set các cột có giá trị được truyền vào.
 * Dùng RETURNING * để trả về row sau khi cập nhật.
 *
 * @returns ITableRow sau khi cập nhật, null nếu không tìm thấy
 */
export const update = async (id: string, data: IUpdateTableData): Promise<ITableRow | null> => {
  const { table_number, capacity, status } = data;

  const result = await pool.query<ITableRow>(
    `UPDATE tables
     SET table_number = COALESCE($1, table_number),
         capacity     = COALESCE($2, capacity),
         status       = COALESCE($3, status)
     WHERE id = $4
     RETURNING *`,
    [table_number ?? null, capacity ?? null, status ?? null, id],
  );
  return result.rows[0] ?? null;
};

/**
 * Xoá bàn theo id.
 * Dùng RETURNING * để xác nhận bản ghi tồn tại trước khi xoá.
 *
 * @returns ITableRow vừa bị xoá, null nếu không tìm thấy
 */
export const remove = async (id: string): Promise<ITableRow | null> => {
  const result = await pool.query<ITableRow>(
    'DELETE FROM tables WHERE id = $1 RETURNING *',
    [id],
  );
  return result.rows[0] ?? null;
};
