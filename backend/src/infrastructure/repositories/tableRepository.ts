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
  const [rows] = await pool.query<ITableRow[]>(
    'SELECT id, table_number, capacity, status FROM tables ORDER BY table_number ASC',
  );
  return rows;
};

/**
 * Tìm bàn theo id (UUID).
 * Dùng parameterized query (?) để ngăn SQL Injection.
 *
 * @returns ITableRow nếu tìm thấy, null nếu không tồn tại
 */
export const findById = async (id: string): Promise<ITableRow | null> => {
  const [rows] = await pool.query<ITableRow[]>(
    'SELECT id, table_number, capacity, status FROM tables WHERE id = ? LIMIT 1',
    [id],
  );
  return rows[0] ?? null;
};

/**
 * Tạo bàn mới và trả về row vừa tạo.
 * MySQL không hỗ trợ RETURNING, nên INSERT rồi SELECT lại.
 *
 * @returns ITableRow - bàn vừa tạo
 */
export const create = async (data: ICreateTableData): Promise<ITableRow> => {
  const { table_number, capacity, status = 'available' } = data;

  const [insertResult] = await pool.query(
    `INSERT INTO tables (table_number, capacity, status)
     VALUES (?, ?, ?)`,
    [table_number, capacity, status],
  );

  const [rows] = await pool.query<ITableRow[]>(
    'SELECT * FROM tables WHERE id = ?',
    [(insertResult as any).insertId],
  );

  return rows[0];
};

/**
 * Cập nhật bàn theo id. Chỉ set các cột có giá trị được truyền vào.
 * MySQL không hỗ trợ RETURNING, nên UPDATE rồi SELECT lại.
 *
 * @returns ITableRow sau khi cập nhật, null nếu không tìm thấy
 */
export const update = async (id: string, data: IUpdateTableData): Promise<ITableRow | null> => {
  const { table_number, capacity, status } = data;

  await pool.query(
    `UPDATE tables
     SET table_number = COALESCE(?, table_number),
         capacity     = COALESCE(?, capacity),
         status       = COALESCE(?, status)
     WHERE id = ?`,
    [table_number ?? null, capacity ?? null, status ?? null, id],
  );

  const [rows] = await pool.query<ITableRow[]>(
    'SELECT * FROM tables WHERE id = ?',
    [id],
  );

  return rows[0] ?? null;
};

/**
 * Xoá bàn theo id.
 * MySQL không hỗ trợ RETURNING, nên SELECT trước rồi DELETE sau.
 *
 * @returns ITableRow vừa bị xoá, null nếu không tìm thấy
 */
export const remove = async (id: string): Promise<ITableRow | null> => {
  const [rows] = await pool.query<ITableRow[]>(
    'SELECT * FROM tables WHERE id = ?',
    [id],
  );
  const dataToReturn = rows[0];

  await pool.query(
    'DELETE FROM tables WHERE id = ?',
    [id],
  );

  return dataToReturn ?? null;
};
