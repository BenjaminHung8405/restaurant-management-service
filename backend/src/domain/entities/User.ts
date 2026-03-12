/**
 * UserRole - Union type đại diện cho các vai trò người dùng trong hệ thống.
 * Dùng union type thay vì enum để tương thích tốt hơn với JSON / database values.
 */
export type UserRole = 'admin' | 'staff' | 'customer';

/**
 * IUser - Domain entity interface đại diện cho một User trong hệ thống.
 *
 * Đây là lớp Domain thuần tuý — không phụ thuộc vào bất kỳ framework
 * hay thư viện nào (pure TypeScript interface).
 */
export interface IUser {
  id: number | string;
  name: string;
  email: string;
  /** Hashed password — không bao giờ trả về raw password ra ngoài API response. */
  password: string;
  role: UserRole;
  createdAt?: Date;
  updatedAt?: Date;
}
