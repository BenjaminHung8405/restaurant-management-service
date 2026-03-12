import fs from 'fs';
import path from 'path';
import pool from '../infrastructure/database/postgres';

async function exportMealsToJSON() {
  try {
    console.log('⏳ Đang trích xuất dữ liệu món ăn...');

    // Chỉ lấy 3 cột cần dịch thuật
    const { rows } = await pool.query<{ id: string; name: string; description: string | null }>(
      'SELECT id, name, description FROM menu_items',
    );

    if (rows.length === 0) {
      console.log('⚠️ Không có món ăn nào trong Database!');
      return;
    }

    // Ghi ra file meals-en.json ở thư mục gốc của backend
    const filePath = path.join(__dirname, '../../meals-en.json');
    fs.writeFileSync(filePath, JSON.stringify(rows, null, 2), 'utf8');

    console.log(`✅ Đã xuất thành công ${rows.length} món ăn ra file: ${filePath}`);
  } catch (error) {
    console.error('❌ Lỗi trích xuất:', error);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

exportMealsToJSON();
