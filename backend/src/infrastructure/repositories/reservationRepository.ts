import pool from '../database/postgres';

/**
 * IReservationRow - Kiểu dữ liệu ánh xạ trực tiếp từ bảng `reservations` trong PostgreSQL.
 * Dùng snake_case để khớp chính xác với tên cột trong DB.
 */
export interface IReservationRow {
  id: string;
  user_id: string;
  table_id: string | null;
  reservation_time: Date;
  guest_count: number;
  notes: string | null;
  status: string;
}

/**
 * ICreateReservationData - DTO cho thao tác tạo đặt bàn mới.
 */
export interface ICreateReservationData {
  user_id: string;
  table_id?: string | null;
  reservation_time: string;
  guest_count: number;
  notes?: string | null;
  status?: string;
}

/**
 * IUpdateReservationData - DTO cho thao tác cập nhật đặt bàn.
 */
export interface IUpdateReservationData {
  table_id?: string | null;
  reservation_time?: string;
  guest_count?: number;
  notes?: string | null;
  status?: string;
}

/**
 * Lấy danh sách đặt bàn, hỗ trợ lọc tuỳ chọn theo user_id.
 *
 * Khi `userId` được truyền vào, chỉ trả về các đặt bàn của user đó —
 * dùng cho customer tự xem lịch sử đặt bàn của mình.
 *
 * @param userId - (tuỳ chọn) UUID của user cần lọc
 * @returns Mảng IReservationRow
 */
export const findAll = async (userId?: string): Promise<IReservationRow[]> => {
  if (userId) {
    const result = await pool.query<IReservationRow>(
      `SELECT id, user_id, table_id, reservation_time, guest_count, notes, status
       FROM reservations
       WHERE user_id = $1
       ORDER BY reservation_time DESC`,
      [userId],
    );
    return result.rows;
  }

  const result = await pool.query<IReservationRow>(
    `SELECT id, user_id, table_id, reservation_time, guest_count, notes, status
     FROM reservations
     ORDER BY reservation_time DESC`,
  );
  return result.rows;
};

/**
 * Tìm đặt bàn theo id (UUID).
 * Dùng parameterized query ($1) để ngăn SQL Injection.
 *
 * @returns IReservationRow nếu tìm thấy, null nếu không tồn tại
 */
export const findById = async (id: string): Promise<IReservationRow | null> => {
  const result = await pool.query<IReservationRow>(
    `SELECT id, user_id, table_id, reservation_time, guest_count, notes, status
     FROM reservations
     WHERE id = $1 LIMIT 1`,
    [id],
  );
  return result.rows[0] ?? null;
};

/**
 * Tạo đặt bàn mới và trả về row vừa tạo.
 * RETURNING * để lấy đầy đủ dữ liệu bao gồm id UUID do DB sinh ra.
 *
 * @returns IReservationRow - đặt bàn vừa tạo
 */
export const create = async (data: ICreateReservationData): Promise<IReservationRow> => {
  const { user_id, table_id = null, reservation_time, guest_count, notes = null, status = 'pending' } = data;

  const result = await pool.query<IReservationRow>(
    `INSERT INTO reservations (user_id, table_id, reservation_time, guest_count, notes, status)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [user_id, table_id, reservation_time, guest_count, notes, status],
  );
  return result.rows[0];
};

/**
 * Cập nhật đặt bàn theo id. Chỉ set các cột có giá trị được truyền vào.
 * Dùng RETURNING * để trả về row sau khi cập nhật.
 *
 * @returns IReservationRow sau khi cập nhật, null nếu không tìm thấy
 */
export const update = async (id: string, data: IUpdateReservationData): Promise<IReservationRow | null> => {
  const { table_id, reservation_time, guest_count, notes, status } = data;

  const result = await pool.query<IReservationRow>(
    `UPDATE reservations
     SET table_id         = COALESCE($1, table_id),
         reservation_time = COALESCE($2, reservation_time),
         guest_count      = COALESCE($3, guest_count),
         notes            = COALESCE($4, notes),
         status           = COALESCE($5, status)
     WHERE id = $6
     RETURNING *`,
    [table_id ?? null, reservation_time ?? null, guest_count ?? null, notes ?? null, status ?? null, id],
  );
  return result.rows[0] ?? null;
};

/**
 * Xoá đặt bàn theo id.
 * Dùng RETURNING * để xác nhận bản ghi tồn tại trước khi xoá.
 *
 * @returns IReservationRow vừa bị xoá, null nếu không tìm thấy
 */
export const remove = async (id: string): Promise<IReservationRow | null> => {
  const result = await pool.query<IReservationRow>(
    'DELETE FROM reservations WHERE id = $1 RETURNING *',
    [id],
  );
  return result.rows[0] ?? null;
};
