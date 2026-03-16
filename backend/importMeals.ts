import fs from 'fs';
import path from 'path';
import { pool } from '../infrastructure/database/postgres';

async function importVietnameseMeals() {
  try {
    const filePath = path.join(__dirname, '../../meals-vi.json');
    
    // Kiểm tra xem file có tồn tại không
    if (!fs.existsSync(filePath)) {
      console.error("❌ Không tìm thấy file meals-vi.json!");
      return;
    }

    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    console.log(`⏳ Đang cập nhật bản dịch tiếng Việt cho ${data.length} món ăn...`);

    // Chạy vòng lặp cập nhật từng món
    for (const item of data) {
      const updateQuery = `
        UPDATE menu_items 
        SET name = $1, description = $2 
        WHERE id = $3
      `;
      await pool.query(updateQuery, [item.name, item.description, item.id]);
    }

    console.log("🎉 Đã cập nhật xong toàn bộ thực đơn sang tiếng Việt!");
  } catch (error) {
    console.error("❌ Lỗi cập nhật:", error);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

importVietnameseMeals();