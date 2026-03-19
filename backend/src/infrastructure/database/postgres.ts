import { Pool, PoolClient } from 'pg';
import AppError from '../../utils/AppError';

/**
 * Pool instance duy nhất (Singleton) cho toàn bộ ứng dụng.
 * Sử dụng DATABASE_URL từ biến môi trường (chuỗi kết nối Neon Serverless Postgres).
 * SSL bắt buộc vì Neon yêu cầu kết nối mã hoá TLS.
 */
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: true, // Enforce CA verification in production
  } : {
    rejectUnauthorized: false, // Allow self-signed certs in dev
  },
  // Pool configuration tuned for Neon serverless
  max: 10, // Maximum number of clients in the pool
  min: 2, // Minimum number of clients to keep in pool
  idleTimeoutMillis: 30000, // How long a client can sit idle before being removed
  connectionTimeoutMillis: 10000, // How long to wait when acquiring a client
});

/**
 * Error handling for pool-level errors
 */
pool.on('error', (err: Error) => {
  console.error('Unexpected error on idle client in pool:', err);
  process.exit(-1);
});

pool.on('connect', () => {
  console.debug('New client connected to pool');
});

pool.on('remove', () => {
  console.debug('Client removed from pool');
});

/**
 * Verifies the database connection by executing a lightweight probe query.
 * Should be called once during server startup before accepting any requests.
 *
 * @throws {AppError} Ném lỗi 500 nếu kết nối thất bại, ngăn server khởi động.
 */
export const connectDB = async (): Promise<void> => {
  let client: PoolClient | null = null;
  try {
    client = await pool.connect();
    await client.query('SELECT NOW()');
    console.log('Neon PostgreSQL connected successfully');
  } catch (err) {
    throw new AppError(
      `Database connection failed: ${err instanceof Error ? err.message : String(err)}`,
      500,
    );
  } finally {
    if (client) {
      client.release();
    }
  }
};

export default pool;
