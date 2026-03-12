import { UserRole } from '../domain/entities/User';
import { createUser, findByEmail, IUserPublic } from '../infrastructure/repositories/userRepository';
import AppError from '../utils/AppError';
import { generateToken, IJwtPayload } from '../utils/jwtHelper';
import { comparePassword, hashPassword } from '../utils/passwordHelper';

/**
 * IRegisterDto - Dữ liệu đầu vào cho luồng đăng ký.
 * Validation (kiểm tra định dạng email, độ dài password...) sẽ được thực hiện
 * ở tầng Controller/Middleware trước khi gọi Service này.
 */
export interface IRegisterDto {
  email: string;
  password: string;
  full_name: string;
  phone_number?: string;
  role?: UserRole;
}

/**
 * IAuthResult - Kết quả trả về cho cả Register và Login.
 */
export interface IAuthResult {
  user: IUserPublic;
  token: string;
}

/**
 * Đăng ký tài khoản mới.
 *
 * 1. Kiểm tra email đã tồn tại chưa — ném 400 nếu đã có.
 * 2. Băm mật khẩu trước khi lưu vào DB.
 * 3. Tạo user mới trong DB.
 * 4. Ký JWT và trả về user + token.
 *
 * @throws {AppError} 400 nếu email đã được đăng ký
 */
export const registerUser = async (data: IRegisterDto): Promise<IAuthResult> => {
  const { email, password, full_name, phone_number, role } = data;

  if (!full_name || full_name.trim() === '') {
    throw new AppError('Full name is required', 400);
  }

  const existingUser = await findByEmail(email);
  if (existingUser) {
    throw new AppError('Email address is already registered', 400);
  }

  const passwordHash = await hashPassword(password);

  const user = await createUser({ email, passwordHash, full_name, phone_number, role });

  const jwtPayload: IJwtPayload = { id: user.id, email: user.email, role: user.role };
  const token = generateToken(jwtPayload);

  return { user, token };
};

/**
 * Đăng nhập bằng email và mật khẩu.
 *
 * 1. Tìm user theo email — ném 401 nếu không tồn tại (cùng thông báo với sai mật khẩu
 *    để tránh User Enumeration Attack).
 * 2. So sánh mật khẩu với hash trong DB — ném 401 nếu không khớp.
 * 3. Ký JWT và trả về user + token.
 *
 * @throws {AppError} 401 nếu email không tồn tại hoặc mật khẩu sai
 */
export const loginUser = async (email: string, password: string): Promise<IAuthResult> => {
  // Lấy đầy đủ row (gồm password_hash) để verify
  const userRow = await findByEmail(email);

  // Dùng cùng thông báo lỗi cho cả "không tồn tại" và "sai mật khẩu"
  // để ngăn kẻ tấn công dò ra email hợp lệ (User Enumeration)
  const INVALID_CREDENTIALS_MSG = 'Invalid email or password';

  if (!userRow) {
    throw new AppError(INVALID_CREDENTIALS_MSG, 401);
  }

  const isPasswordValid = await comparePassword(password, userRow.password_hash);
  if (!isPasswordValid) {
    throw new AppError(INVALID_CREDENTIALS_MSG, 401);
  }

  // Chỉ giữ lại thông tin công khai, không đưa password_hash vào response
  const user: IUserPublic = {
    id: userRow.id,
    email: userRow.email,
    full_name: userRow.full_name,
    role: userRow.role,
  };

  const jwtPayload: IJwtPayload = { id: user.id, email: user.email, role: user.role };
  const token = generateToken(jwtPayload);

  return { user, token };
};
