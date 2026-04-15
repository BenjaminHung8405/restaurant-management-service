import pool from '../database/postgres';

/**
 * IReservationRow - Kiểu dữ liệu ánh xạ trực tiếp từ bảng `reservations` trong PostgreSQL.
 * Dùng snake_case để khớp chính xác với tên cột trong DB.
 * 
 * Hỗ trợ Guest Reservations:
 * - user_id: nullable (null = guest reservation, not null = authenticated user)
 * - guest_name: required (tên khách hàng, dùng cho guest hoặc reference tên user)
 * - guest_phone: required (số điện thoại liên hệ)
 */
export interface IReservationRow {
  id: string;
  user_id: string | null;
  table_id: string | null;
  reservation_time: Date;
  guest_count: number;
  guest_name: string;
  guest_phone: string;
  notes: string | null;
  status: string;
}

/**
 * ICreateReservationData - DTO cho thao tác tạo đặt bàn mới.
 * 
 * Hỗ trợ 2 loại đặt bàn:
 * 1. Authenticated User: user_id được set từ JWT, guest_name/phone có thể để trống (lấy từ user account)
 * 2. Guest: user_id = null, guest_name & guest_phone bắt buộc
 */
export interface ICreateReservationData {
  user_id?: string | null;
  table_id?: string | null;
  reservation_time: string;
  guest_count: number;
  guest_name?: string;
  guest_phone?: string;
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
  guest_name?: string;
  guest_phone?: string;
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
    const [rows] = await pool.query<IReservationRow[]>(
      `SELECT id, user_id, table_id, reservation_time, guest_count, guest_name, guest_phone, notes, status
       FROM reservations
       WHERE user_id = ?
       ORDER BY reservation_time DESC`,
      [userId],
    );
    return rows;
  }

  const [rows] = await pool.query<IReservationRow[]>(
    `SELECT id, user_id, table_id, reservation_time, guest_count, guest_name, guest_phone, notes, status
     FROM reservations
     ORDER BY reservation_time DESC`,
  );
  return rows;
};

/**
 * Tìm đặt bàn theo id (UUID).
 * Dùng parameterized query (?) để ngăn SQL Injection.
 *
 * @returns IReservationRow nếu tìm thấy, null nếu không tồn tại
 */
export const findById = async (id: string): Promise<IReservationRow | null> => {
  const [rows] = await pool.query<IReservationRow[]>(
    `SELECT id, user_id, table_id, reservation_time, guest_count, guest_name, guest_phone, notes, status
     FROM reservations
     WHERE id = ? LIMIT 1`,
    [id],
  );
  return rows[0] ?? null;
};

/**
 * Tạo đặt bàn mới và trả về row vừa tạo.
 * MySQL không hỗ trợ RETURNING, nên INSERT rồi SELECT lại.
 * 
 * Hỗ trợ Guest Reservations:
 * - user_id = null: guest reservation (bắt buộc guest_name & guest_phone)
 * - user_id != null: authenticated user reservation (guest_name/phone từ user account)
 *
 * @returns IReservationRow - đặt bàn vừa tạo
 */
export const create = async (data: ICreateReservationData): Promise<IReservationRow> => {
  const { 
    user_id = null, 
    table_id = null, 
    reservation_time, 
    guest_count, 
    guest_name = '', 
    guest_phone = '', 
    notes = null, 
    status = 'pending' 
  } = data;

  const [insertResult] = await pool.query(
    `INSERT INTO reservations (user_id, table_id, reservation_time, guest_count, guest_name, guest_phone, notes, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [user_id, table_id, reservation_time, guest_count, guest_name, guest_phone, notes, status],
  );

  const [rows] = await pool.query<IReservationRow[]>(
    'SELECT * FROM reservations WHERE id = ?',
    [(insertResult as any).insertId],
  );

  return rows[0];
};

/**
 * Cập nhật đặt bàn theo id. Chỉ set các cột có giá trị được truyền vào.
 * MySQL không hỗ trợ RETURNING, nên UPDATE rồi SELECT lại.
 *
 * @returns IReservationRow sau khi cập nhật, null nếu không tìm thấy
 */
export const update = async (id: string, data: IUpdateReservationData): Promise<IReservationRow | null> => {
  const { table_id, reservation_time, guest_count, guest_name, guest_phone, notes, status } = data;

  await pool.query(
    `UPDATE reservations
     SET table_id         = COALESCE(?, table_id),
         reservation_time = COALESCE(?, reservation_time),
         guest_count      = COALESCE(?, guest_count),
         guest_name       = COALESCE(?, guest_name),
         guest_phone      = COALESCE(?, guest_phone),
         notes            = COALESCE(?, notes),
         status           = COALESCE(?, status)
     WHERE id = ?`,
    [table_id ?? null, reservation_time ?? null, guest_count ?? null, guest_name ?? null, guest_phone ?? null, notes ?? null, status ?? null, id],
  );

  const [rows] = await pool.query<IReservationRow[]>(
    'SELECT * FROM reservations WHERE id = ?',
    [id],
  );

  return rows[0] ?? null;
};

/**
 * Xoá đặt bàn theo id.
 * MySQL không hỗ trợ RETURNING, nên SELECT trước rồi DELETE sau.
 *
 * @returns IReservationRow vừa bị xoá, null nếu không tìm thấy
 */
export const remove = async (id: string): Promise<IReservationRow | null> => {
  const [rows] = await pool.query<IReservationRow[]>(
    'SELECT * FROM reservations WHERE id = ?',
    [id],
  );
  const dataToReturn = rows[0];

  await pool.query(
    'DELETE FROM reservations WHERE id = ?',
    [id],
  );

  return dataToReturn ?? null;
};
