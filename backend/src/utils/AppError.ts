/**
 * AppError - Custom operational error class for the application.
 *
 * Phân biệt giữa lỗi vận hành (có thể dự đoán, ví dụ: 404 Not Found) và
 * lỗi lập trình (bug không mong đợi) để middleware xử lý lỗi phản hồi đúng cách.
 */
class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number, isOperational: boolean = true) {
    super(message);

    this.statusCode = statusCode;
    this.isOperational = isOperational;

    // Đảm bảo prototype chain hoạt động đúng khi extend built-in class trong TypeScript
    Object.setPrototypeOf(this, new.target.prototype);

    // Gắn stack trace vào instance này, bỏ qua AppError constructor khỏi stack
    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;
