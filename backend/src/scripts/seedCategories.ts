import axios from 'axios';
import pool from '../infrastructure/database/postgres';

/**
 * IMealDBCategory - Kiểu dữ liệu ánh xạ từ response của TheMealDB API.
 * Chỉ khai báo các trường cần dùng để tránh dùng `any`.
 */
interface IMealDBCategory {
  idCategory: string;
  strCategory: string;
  strCategoryThumb: string;
  strCategoryDescription: string;
}

/**
 * IMealDBCategoriesResponse - Cấu trúc toàn bộ response từ TheMealDB.
 */
interface IMealDBCategoriesResponse {
  categories: IMealDBCategory[];
}

const THEMEALDB_CATEGORIES_URL = 'https://www.themealdb.com/api/json/v1/1/categories.php';

/**
 * seedCategories - Fetch categories từ TheMealDB và insert vào bảng `categories`.
 *
 * Sử dụng ON CONFLICT (name) DO NOTHING để script có thể chạy nhiều lần
 * mà không gây lỗi duplicate key — idempotent by design.
 */
const seedCategories = async (): Promise<void> => {
  try {
    console.log('Fetching categories from TheMealDB...');

    const response = await axios.get<IMealDBCategoriesResponse>(THEMEALDB_CATEGORIES_URL);
    const categories = response.data.categories;

    if (!categories || categories.length === 0) {
      console.warn('No categories returned from TheMealDB. Aborting seed.');
      return;
    }

    console.log(`Found ${categories.length} categories. Inserting into database...`);

    for (const category of categories) {
      const { strCategory: name, strCategoryDescription: description, strCategoryThumb: image_url } = category;

      await pool.query(
        'INSERT INTO categories (name, description, image_url) VALUES ($1, $2, $3) ON CONFLICT (name) DO NOTHING',
        [name, description, image_url],
      );

      console.log(`Inserted category: ${name}`);
    }

    console.log('Seeding completed successfully.');
  } catch (err) {
    console.error(
      'Seeding failed:',
      err instanceof Error ? err.message : String(err),
    );
    process.exit(1);
  } finally {
    await pool.end();
    console.log('Database pool closed.');
    process.exit(0);
  }
};

seedCategories();
