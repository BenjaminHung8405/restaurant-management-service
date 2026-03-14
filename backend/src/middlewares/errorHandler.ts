import { NextFunction, Request, Response } from 'express';
import AppError from '../utils/AppError';

/**
 * Global Error Handling Middleware.
 *
 * Đây là điểm tập trung duy nhất để xử lý tất cả lỗi trong ứng dụng.
 * Đặt ở cuối cùng trong chuỗi middleware của Express để bắt mọi lỗi
 * được ném ra hoặc truyền qua `next(err)` từ các route/middleware phía trên.
 */
const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  // Express requires the 4-argument signature to recognise this as error middleware
  _next: NextFunction
): void => {
  const normalizedError = err instanceof Error ? err : new Error('Unknown error');

  // Log stack trace trong môi trường phát triển để dễ debug
  if (process.env.NODE_ENV !== 'production') {
    console.error('ERROR STACK:', normalizedError.stack);
  }

  // Nếu là lỗi vận hành (AppError), dùng statusCode và message đã định nghĩa sẵn
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      data: null,
      error: process.env.NODE_ENV !== 'production' ? err.stack : null,
    });
    return;
  }

  // Với lỗi lập trình không mong đợi, ẩn chi tiết kỹ thuật khỏi client
  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    data: null,
    error: process.env.NODE_ENV !== 'production' ? normalizedError.stack : null,
  });
};

export default errorHandler;
