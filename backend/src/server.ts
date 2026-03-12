import 'dotenv/config';
import http from 'http';
import app from './app';

const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

const server = http.createServer(app);

// --- Graceful Shutdown ---

/**
 * Xử lý unhandledRejection (Promise bị reject mà không có .catch() xử lý).
 * Log lỗi, đóng server an toàn rồi mới thoát tiến trình.
 */
process.on('unhandledRejection', (reason: unknown) => {
  console.error('UNHANDLED REJECTION! Shutting down...');
  console.error(reason);
  server.close(() => {
    process.exit(1);
  });
});

/**
 * Xử lý uncaughtException (lỗi đồng bộ không được try-catch bắt).
 * Phải thoát ngay lập tức vì trạng thái ứng dụng có thể không còn nhất quán.
 */
process.on('uncaughtException', (err: Error) => {
  console.error('UNCAUGHT EXCEPTION! Shutting down...');
  console.error(err.name, err.message);
  process.exit(1);
});

// --- Start Server ---
server.listen(PORT, () => {
  console.log(`Server running in ${NODE_ENV} mode on port ${PORT}`);
});
