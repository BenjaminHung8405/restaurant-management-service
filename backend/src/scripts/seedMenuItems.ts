import axios from 'axios';
import pool from '../infrastructure/database/postgres';

/**
 * IMealDBMeal - Kiểu dữ liệu ánh xạ từ response của TheMealDB search API.
 * Chỉ khai báo các trường cần dùng để tránh dùng `any`.
 */
interface IMealDBMeal {
  idMeal: string;
  strMeal: string;
  strCategory: string;
  strArea: string;
  strInstructions: string;
  strMealThumb: string;
}

/**
 * IMealDBSearchResponse - Cấu trúc response từ TheMealDB search endpoint.
 */
interface IMealDBSearchResponse {
  meals: IMealDBMeal[] | null;
}

const SEARCH_LETTERS = ['b', 'c', 's', 'p'];
const THEMEALDB_SEARCH_URL = 'https://www.themealdb.com/api/json/v1/1/search.php';

/**
 * generateRandomPrice - Trả về giá ngẫu nhiên là bội số của 5000,
 * nằm trong khoảng [45000, 250000].
 */
const generateRandomPrice = (): number => {
  const min = 45000 / 5000; // 9
  const max = 250000 / 5000; // 50
  const steps = Math.floor(Math.random() * (max - min + 1)) + min;
  return steps * 5000;
};

/**
 * truncate - Cắt chuỗi văn bản dài xuống còn tối đa `maxLength` ký tự.
 * Thêm '...' nếu chuỗi bị cắt.
 */
const truncate = (text: string, maxLength: number): string => {
  if (!text) return '';
  return text.length <= maxLength ? text : text.slice(0, maxLength).trimEnd() + '...';
};

/**
 * seedMenuItems - Fetch meals từ TheMealDB và insert vào bảng `menu_items`.
 *
 * Quy trình:
 * 1. Build categoryMap từ DB hiện có để tra cứu UUID theo tên category.
 * 2. Gọi TheMealDB search API với nhiều chữ cái để lấy danh sách meals.
 * 3. Với mỗi meal: map sang schema DB, kiểm tra trùng tên, insert nếu chưa có.
 */
const seedMenuItems = async (): Promise<void> => {
  let exitCode = 0;

  try {
    // --- Bước 1: Build categoryMap ---
    console.log('Loading categories from database...');
    const categoryResult = await pool.query<{ id: string; name: string }>(
      'SELECT id, name FROM categories',
    );

    if (categoryResult.rows.length === 0) {
      console.warn('No categories found in database. Please run seedCategories first.');
      return;
    }

    // Map tên category -> UUID để tra cứu O(1)
    const categoryMap: Record<string, string> = {};
    for (const row of categoryResult.rows) {
      categoryMap[row.name] = row.id;
    }
    console.log(`Loaded ${categoryResult.rows.length} categories.`);

    // --- Bước 2: Fetch meals từ TheMealDB ---
    console.log(`Fetching meals for letters: ${SEARCH_LETTERS.join(', ')}...`);

    const allMeals: IMealDBMeal[] = [];

    for (const letter of SEARCH_LETTERS) {
      const response = await axios.get<IMealDBSearchResponse>(THEMEALDB_SEARCH_URL, {
        params: { f: letter },
      });

      if (response.data.meals) {
        allMeals.push(...response.data.meals);
      }
    }

    if (allMeals.length === 0) {
      console.warn('No meals returned from TheMealDB. Aborting seed.');
      return;
    }

    console.log(`Found ${allMeals.length} meals total. Processing inserts...`);

    // --- Bước 3: Process & Insert ---
    let insertedCount = 0;
    let skippedCount = 0;

    for (const meal of allMeals) {
      // Tra cứu category_id; bỏ qua nếu category chưa có trong DB
      const category_id = categoryMap[meal.strCategory];
      if (!category_id) {
        console.warn(`  Skipping "${meal.strMeal}" — category "${meal.strCategory}" not found in DB.`);
        skippedCount++;
        continue;
      }

      // Kiểm tra trùng tên trước để tránh duplicate key error
      const existing = await pool.query<{ id: string }>(
        'SELECT id FROM menu_items WHERE name = $1',
        [meal.strMeal],
      );

      if (existing.rows.length > 0) {
        skippedCount++;
        continue;
      }

      const name       = meal.strMeal;
      const description = truncate(meal.strInstructions, 200);
      const price      = generateRandomPrice();
      // TheMealDB cung cấp thumbnail nhỏ hơn qua đường dẫn /preview
      const image_url  = `${meal.strMealThumb}/preview`;
      const area       = meal.strArea || null;
      const is_available = Math.random() > 0.1;

      await pool.query(
        `INSERT INTO menu_items (category_id, name, description, price, image_url, area, is_available)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [category_id, name, description, price, image_url, area, is_available],
      );

      console.log(`  Inserted meal: ${name}`);
      insertedCount++;
    }

    console.log(`\nSeeding completed. Inserted: ${insertedCount}, Skipped: ${skippedCount}.`);
  } catch (err) {
    // Log full error object — pg errors carry code, detail, hint, stack, etc.
    // err.message có thể là chuỗi rỗng khi lỗi xảy ra ở tầng network/SSL.
    console.error('\nSeeding failed!');
    if (err instanceof Error) {
      const pgErr = err as unknown as Record<string, unknown>;
      console.error('  message :', err.message || '(empty)');
      console.error('  stack   :', err.stack);
      if (pgErr['code'])   console.error('  code    :', pgErr['code']);
      if (pgErr['detail']) console.error('  detail  :', pgErr['detail']);
      if (pgErr['hint'])   console.error('  hint    :', pgErr['hint']);
    } else {
      console.error(err);
    }
    exitCode = 1;
  } finally {
    try {
      await pool.end();
      console.log('Database pool closed.');
    } catch (poolErr) {
      console.error('Failed to close pool:', poolErr);
    }
    process.exit(exitCode);
  }
};

seedMenuItems();
