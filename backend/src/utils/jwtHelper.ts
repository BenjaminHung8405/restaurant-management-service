import jwt from 'jsonwebtoken';
import { UserRole } from '../domain/entities/User';
import AppError from './AppError';

/**
 * Payload được nhúng vào JWT.
 * Chỉ chứa thông tin cần thiết để xác định danh tính và quyền —
 * KHÔNG bao gồm password hoặc thông tin nhạy cảm khác.
 */
export interface IJwtPayload {
  id: number | string;
  email: string;
  role: UserRole;
}

/**
 * Lấy JWT_SECRET từ env và ném lỗi 500 nếu chưa cấu hình.
 * Gọi tập trung để tránh lặp code giữa sign và verify.
 */
const getSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new AppError('JWT_SECRET environment variable is not configured', 500);
  }
  return secret;
};

/**
 * Ký một JWT với payload cho trước.
 * Thời gian hết hạn lấy từ JWT_EXPIRES_IN (mặc định '7d' nếu không set).
 *
 * @param payload - Dữ liệu người dùng cần nhúng vào token
 * @returns Chuỗi JWT đã ký
 */
export const generateToken = (payload: IJwtPayload): string => {
  const secret = getSecret();
  const expiresIn = process.env.JWT_EXPIRES_IN ?? '7d';
  // @types/jsonwebtoken v9 sử dụng branded `StringValue` từ ms — ép kiểu an toàn vì
  // biến môi trường JWT_EXPIRES_IN phải là chuỗi hợp lệ theo định dạng ms (e.g. '7d', '1h')
  return jwt.sign(payload, secret, { expiresIn } as jwt.SignOptions);
};

/**
 * Xác thực và giải mã JWT.
 * Ném AppError 401 với mọi trường hợp token không hợp lệ
 * (hết hạn, sai chữ ký, malformed...) để che giấu nguyên nhân cụ thể khỏi client.
 *
 * @param token - Chuỗi JWT cần xác thực
 * @returns Payload đã giải mã nếu hợp lệ
 * @throws {AppError} 401 nếu token không hợp lệ hoặc đã hết hạn
 */
export const verifyToken = (token: string): IJwtPayload => {
  const secret = getSecret();
  try {
    return jwt.verify(token, secret) as IJwtPayload;
  } catch {
    throw new AppError('Invalid or expired token', 401);
  }
};
