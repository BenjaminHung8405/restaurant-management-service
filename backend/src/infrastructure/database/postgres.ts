import { Pool } from 'pg';
import AppError from '../../utils/AppError';

/**
 * Pool instance duy nhất (Singleton) cho toàn bộ ứng dụng.
 * Sử dụng DATABASE_URL từ biến môi trường (chuỗi kết nối Neon Serverless Postgres).
 * SSL bắt buộc vì Neon yêu cầu kết nối mã hoá TLS.
 */
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: true, // Enforce CA verification in production
  },
});

/**
 * Verifies the database connection by executing a lightweight probe query.
 * Should be called once during server startup before accepting any requests.
 *
 * @throws {AppError} Ném lỗi 500 nếu kết nối thất bại, ngăn server khởi động.
 */
export const connectDB = async (): Promise<void> => {
  try {
    await pool.query('SELECT 1');
    console.log('Neon PostgreSQL connected successfully');
  } catch (err) {
    throw new AppError(
      `Database connection failed: ${err instanceof Error ? err.message : String(err)}`,
      500,
    );
  }
};

export default pool;
