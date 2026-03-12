import { IJwtPayload } from '../../utils/jwtHelper';

/**
 * Mở rộng Express Request interface để thêm thuộc tính `user`.
 * File này được TypeScript tự động nạp vì nằm trong `src/**` (theo tsconfig).
 *
 * Sau khi middleware `protect` chạy thành công, `req.user` sẽ chứa
 * JWT payload đã được giải mã và xác thực, sẵn sàng dùng trong các handler tiếp theo.
 */
declare global {
  namespace Express {
    interface Request {
      user?: IJwtPayload;
    }
  }
}
