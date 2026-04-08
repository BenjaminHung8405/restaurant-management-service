import { NextFunction, Request, Response } from 'express';
import { UserRole } from '../domain/entities/User';
import AppError from '../utils/AppError';
import { verifyToken } from '../utils/jwtHelper';

/**
 * `protect` - Middleware xác thực (Authentication).
 *
 * Kiểm tra JWT trong header `Authorization: Bearer <token>`.
 * Nếu hợp lệ, gắn payload vào `req.user` và chuyển sang middleware tiếp theo.
 * Nếu thiếu hoặc không hợp lệ, chuyển AppError 401 đến errorHandler.
 */
export const protect = (req: Request, _res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    next(new AppError('Authentication required. Please log in.', 401));
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    // verifyToken đã ném AppError(401) — chuyển thẳng sang errorHandler
    next(err);
  }
};

/**
 * `optionalProtect` - Middleware xác thực tuỳ chọn.
 *
 * Nếu có Bearer token hợp lệ thì gắn payload vào `req.user`.
 * Nếu không có token (hoặc token lỗi), request vẫn tiếp tục như guest.
 */
export const optionalProtect = (req: Request, _res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    next();
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
  } catch (err) {
    console.warn('optionalProtect: invalid token, fallback to guest request');
  }

  next();
};

/**
 * `restrictTo` - Middleware factory phân quyền (Authorization).
 *
 * Trả về một middleware kiểm tra xem role của người dùng đang đăng nhập
 * có nằm trong danh sách `roles` được phép hay không.
 * Phải đặt SAU `protect` trong chuỗi middleware của route.
 *
 * @param roles - Danh sách các role được phép truy cập route
 * @example router.delete('/:id', protect, restrictTo('admin'), deleteUser)
 */
export const restrictTo = (...roles: UserRole[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      next(new AppError('You do not have permission to perform this action', 403));
      return;
    }
    next();
  };
};
