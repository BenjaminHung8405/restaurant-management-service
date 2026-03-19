import 'dotenv/config';
import { Pool } from 'pg';

const testConnection = async () => {
  console.log('Testing database connection...\n');
  console.log(`DATABASE_URL: ${process.env.DATABASE_URL?.substring(0, 50)}...`);
  console.log(`NODE_ENV: ${process.env.NODE_ENV}\n`);

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? {
      rejectUnauthorized: true,
    } : {
      rejectUnauthorized: false,
    },
    max: 10,
    min: 2,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  });

  pool.on('error', (err) => {
    console.error('Pool error:', err);
  });

  try {
    const client = await pool.connect();
    console.log('✓ Connected to database');

    const result = await client.query('SELECT NOW()');
    console.log('✓ Query executed successfully');
    console.log('✓ Current database time:', result.rows[0].now);

    const menuItemCount = await client.query('SELECT COUNT(*) FROM menu_items');
    console.log('✓ Menu items count:', menuItemCount.rows[0].count);

    client.release();
    console.log('\n✓ All tests passed!');
  } catch (err) {
    console.error('✗ Connection failed:');
    console.error(err instanceof Error ? err.message : err);
  } finally {
    await pool.end();
  }
};

testConnection();
