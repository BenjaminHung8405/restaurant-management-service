import mysql from 'mysql2/promise';
import AppError from '../../utils/AppError';

/**
 * Pool instance duy nhất (Singleton) cho toàn bộ ứng dụng.
 * Sử dụng DATABASE_URL hoặc các biến môi trường riêng cho Vertigo MySQL.
 * 
 * Hỗ trợ kết nối qua DATABASE_URL (format: mysql://user:password@host:port/database)
 * hoặc các biến môi trường riêng lẻ: DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT
 */
const getPoolConfig = () => {
  if (process.env.DATABASE_URL) {
    // Parse DATABASE_URL nếu được cung cấp
    // Format: mysql://user:password@host:port/database
    return {
      uri: process.env.DATABASE_URL,
    };
  }

  // Fallback to environment variables
  return {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'restaurant_db',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelayMs: 0,
  };
};

const pool = mysql.createPool(getPoolConfig());

/**
 * Verifies the database connection by executing a lightweight probe query.
 * Should be called once during server startup before accepting any requests.
 *
 * @throws {AppError} Ném lỗi 500 nếu kết nối thất bại, ngăn server khởi động.
 */
export const connectDB = async (): Promise<void> => {
  let connection = null;
  try {
    connection = await pool.getConnection();
    await connection.ping();
    console.log('Vertigo MySQL connected successfully');
  } catch (err) {
    throw new AppError(
      `Database connection failed: ${err instanceof Error ? err.message : String(err)}`,
      500,
    );
  } finally {
    if (connection) {
      await connection.release();
    }
  }
};

export default pool;
