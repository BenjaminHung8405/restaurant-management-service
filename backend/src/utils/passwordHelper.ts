import bcrypt from 'bcryptjs';

/** Số vòng salt — 12 là cân bằng tốt giữa bảo mật và hiệu năng cho production. */
const SALT_ROUNDS = 12;

/**
 * Băm mật khẩu thô thành chuỗi hash an toàn để lưu xuống database.
 * Sử dụng bcrypt với salt tự động tạo, chống rainbow table attack.
 *
 * @param plainText - Mật khẩu gốc từ người dùng nhập vào
 * @returns Chuỗi hash đã được salt (tự chứa thông tin salt bên trong)
 */
export const hashPassword = async (plainText: string): Promise<string> => {
  return bcrypt.hash(plainText, SALT_ROUNDS);
};

/**
 * So sánh mật khẩu thô với chuỗi hash đã lưu trong database.
 * bcrypt.compare tự trích xuất salt từ hash nên không cần truyền riêng.
 *
 * @param plainText - Mật khẩu gốc do người dùng gửi lên (khi đăng nhập)
 * @param hashed - Chuỗi hash đang lưu trong database
 * @returns `true` nếu khớp, `false` nếu sai mật khẩu
 */
export const comparePassword = async (plainText: string, hashed: string): Promise<boolean> => {
  return bcrypt.compare(plainText, hashed);
};
