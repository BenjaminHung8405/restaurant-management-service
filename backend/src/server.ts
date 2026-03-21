import 'dotenv/config';
import http from 'http';
import app from './app';
import pool, { connectDB } from './infrastructure/database/postgres';

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

// --- Graceful Shutdown Handler ---
/**
 * Xử lý tắt server một cách an toàn (gracefully).
 * Đóng HTTP server trước, sau đó đóng database connection pool.
 * Điều này ngăn chặn "zombie processes" bị kết nối DB giữ sống.
 */
const gracefulShutdown = async (): Promise<void> => {
  console.log('\n🛑 GRACEFUL SHUTDOWN: Process signal received');

  console.log('⏳ Closing HTTP server...');
  server.close(async () => {
    console.log('✅ HTTP server closed');

    console.log('⏳ Closing database connection pool...');
    try {
      await pool.end();
      console.log('✅ Database connection pool closed');
    } catch (err) {
      console.error('❌ Error closing database pool:', err);
    }

    console.log('🎯 Process exiting with exit code 0');
    process.exit(0);
  });

  // If server doesn't close within 5 seconds, force exit
  setTimeout(() => {
    console.error('⚠️ Server did not close gracefully within 5 seconds. Force-exiting...');
    process.exit(1);
  }, 5000);
};

// Listen for termination signals
process.on('SIGINT', gracefulShutdown);  // Ctrl + C
process.on('SIGTERM', gracefulShutdown); // Kill signal

// --- Start Server ---
/**
 * Khởi động server theo thứ tự: kết nối DB trước, sau đó mới mở HTTP server.
 * Nếu DB thất bại, tiến trình dừng hoàn toàn — tránh nhận request khi không có DB.
 */
const startServer = async (): Promise<void> => {
  try {
    await connectDB();
    server.listen(PORT, () => {
      console.log(`Server running in ${NODE_ENV} mode on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to connect to the database. Server will not start.');
    console.error(err);
    process.exit(1);
  }
};

startServer();
