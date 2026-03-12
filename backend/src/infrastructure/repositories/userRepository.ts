import { UserRole } from '../../domain/entities/User';
import pool from '../database/postgres';

/**
 * IUserRow - Kiểu dữ liệu ánh xạ trực tiếp từ bảng `users` trong PostgreSQL.
 * Dùng snake_case để khớp chính xác với tên cột trong DB.
 */
export interface IUserRow {
  id: number;
  email: string;
  password_hash: string;
  full_name: string;
  phone_number: string | null;
  role: UserRole;
  created_at: Date;
  updated_at: Date;
}

/**
 * IUserPublic - Kiểu dữ liệu an toàn để trả về cho client.
 * KHÔNG chứa password_hash — tránh lộ thông tin nhạy cảm.
 */
export interface IUserPublic {
  id: number;
  email: string;
  full_name: string;
  role: UserRole;
}

/**
 * ICreateUserData - DTO cho thao tác tạo user mới.
 */
export interface ICreateUserData {
  email: string;
  passwordHash: string;
  full_name: string;
  phone_number?: string;
  role?: UserRole;
}

/**
 * Tìm user theo email. Trả về toàn bộ row (bao gồm password_hash)
 * để Service layer có thể thực hiện so sánh mật khẩu.
 *
 * Dùng parameterized query ($1) để ngăn SQL Injection.
 *
 * @returns IUserRow nếu tìm thấy, null nếu không tồn tại
 */
export const findByEmail = async (email: string): Promise<IUserRow | null> => {
  const result = await pool.query<IUserRow>(
    'SELECT id, email, password_hash, full_name, phone_number, role, created_at, updated_at FROM users WHERE email = $1 LIMIT 1',
    [email],
  );
  return result.rows[0] ?? null;
};

/**
 * Tạo user mới và trả về thông tin công khai (không có password_hash).
 * RETURNING chỉ lấy các cột cần thiết để không bao giờ expose hash.
 *
 * @returns IUserPublic - thông tin user vừa tạo
 */
export const createUser = async (userData: ICreateUserData): Promise<IUserPublic> => {
  const { email, passwordHash, full_name, phone_number = null, role = 'customer' } = userData;

  const result = await pool.query<IUserPublic>(
    `INSERT INTO users (email, password_hash, full_name, phone_number, role)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, email, full_name, role`,
    [email, passwordHash, full_name, phone_number, role],
  );

  return result.rows[0];
};
