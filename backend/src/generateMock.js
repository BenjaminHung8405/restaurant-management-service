const axios = require('axios');
const fs = require('fs');
const path = require('path');

const generateRandomPrice = () => {
  const min = 9; // 45,000
  const max = 50; // 250,000
  return (Math.floor(Math.random() * (max - min + 1)) + min) * 5000;
};

const truncateDescription = (text, maxLength = 100) => {
  if (!text) return "Món ăn ngon tuyệt hảo, đậm đà hương vị truyền thống.";
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
};

async function generateTypeScriptMockData() {
  try {
    console.log("🚀 Đang cào dữ liệu từ TheMealDB...\n");

    // 1. LẤY DANH MỤC
    console.log("📦 Đang lấy danh mục...");
    const catResponse = await axios.get('https://www.themealdb.com/api/json/v1/1/categories.php');
    const categoriesData = catResponse.data.categories.slice(0, 6); // Lấy 6 danh mục
    
    const dbCategories = categoriesData.map((cat, index) => ({
      id: index + 1,
      name: cat.strCategory,
      description: truncateDescription(cat.strCategoryDescription, 80)
    }));

    // 2. LẤY MÓN ĂN (Gọi nhiều chữ cái để đủ 20-30 món)
    console.log("🍔 Đang lấy danh sách món ăn...");
    const lettersToFetch = ['b', 'c', 'p', 's']; // Beef, Chicken, Pork, Seafood...
    let rawMeals = [];

    for (const letter of lettersToFetch) {
      const response = await axios.get(`https://www.themealdb.com/api/json/v1/1/search.php?f=${letter}`);
      if (response.data.meals) {
        rawMeals = [...rawMeals, ...response.data.meals];
      }
    }

    // Lọc lấy khoảng 30 món đầu tiên cho gọn nhẹ
    rawMeals = rawMeals.slice(0, 30);

    const dbMenuItems = rawMeals.map((meal, index) => {
      const category = dbCategories.find(c => c.name === meal.strCategory);
      // Nếu món ăn không thuộc 6 category đầu, gán random vào 1 category để test UI
      const categoryId = category ? category.id : (Math.floor(Math.random() * 6) + 1);

      // Lưu ý: Đổi tên biến sang camelCase (categoryId, imageUrl) để chuẩn TypeScript Frontend
      return {
        id: index + 1,
        categoryId: categoryId,
        name: meal.strMeal,
        description: truncateDescription(meal.strInstructions),
        price: generateRandomPrice(),
        imageUrl: meal.strMealThumb + '/preview', 
        // Random 10% cơ hội món ăn bị hết hàng (false) để test UI nút "Hết hàng"
        isAvailable: Math.random() > 0.1 
      };
    });

    console.log(`✅ Đã cào thành công ${dbCategories.length} danh mục và ${dbMenuItems.length} món ăn.\n`);

    // 3. XUẤT RA FILE TYPESCRIPT
    console.log("✍️ Đang ghi ra file mockData.ts...");
    
    const tsContent = `// Tự động sinh bởi generateMock.js

export interface Category {
  id: number;
  name: string;
  description: string;
}

export interface MenuItem {
  id: number;
  categoryId: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  isAvailable: boolean;
}

export const mockCategories: Category[] = ${JSON.stringify(dbCategories, null, 2)};

export const mockMenuItems: MenuItem[] = ${JSON.stringify(dbMenuItems, null, 2)};
`;

    // Ghi file vào thư mục hiện tại
    const filePath = path.join(__dirname, 'mockData.ts');
    fs.writeFileSync(filePath, tsContent, 'utf8');

    console.log(`🎉 HOÀN TẤT! File đã được lưu tại: ${filePath}`);
    console.log(`Hãy copy file này vào thư mục 'src/lib/' của Frontend nhé!`);

  } catch (error) {
    console.error("❌ Lỗi:", error.message);
  }
}

generateTypeScriptMockData();