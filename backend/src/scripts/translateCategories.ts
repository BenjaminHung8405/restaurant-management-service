import pool from '../infrastructure/database/postgres';

const categoryTranslations = [
  {
    enName: 'Beef',
    viName: 'Thịt Bò Thượng Hạng',
    viDesc:
      'Tuyển tập các món bò nội mọng nước, từ nướng xém cạnh đến hầm rục tủy xương, đánh thức mọi giác quan.',
  },
  {
    enName: 'Chicken',
    viName: 'Thịt Gà Đặc Sản',
    viDesc:
      'Những thớ thịt gà thả vườn săn chắc, tẩm ướp đậm đà gia vị thảo mộc và chế biến bằng sự đam mê.',
  },
  {
    enName: 'Dessert',
    viName: 'Tráng Miệng Lãng Mạn',
    viDesc:
      'Bản giao hưởng ngọt ngào của bánh ngọt, kem tươi và trái cây, khép lại bữa tiệc một cách hoàn mỹ.',
  },
  {
    enName: 'Lamb',
    viName: 'Cừu Non Đút Lò',
    viDesc:
      'Thịt cừu non tơ ngấm đẫm hương thảo mộc, nướng chậm mềm tan không lưu lại chút hậu vị ngái.',
  },
  {
    enName: 'Miscellaneous',
    viName: 'Biến Tấu Độc Bản',
    viDesc:
      'Những tuyệt tác ẩm thực phá cách, kết hợp nguyên liệu độc đáo không theo bất kỳ khuôn mẫu nào.',
  },
  {
    enName: 'Pasta',
    viName: 'Mì Ý Hảo Hạng',
    viDesc:
      'Tinh hoa ẩm thực Địa Trung Hải với sợi mì luộc Al Dente dòn dai quyện trong làn nước xốt sánh mịn.',
  },
  {
    enName: 'Pork',
    viName: 'Thịt Lợn Tinh Tuyển',
    viDesc:
      'Từng dải ba chỉ tươm mỡ hay sườn non nướng cháy cạnh, mang đến sự no đủ và thỏa mãn tuyệt đối.',
  },
  {
    enName: 'Seafood',
    viName: 'Hải Sản Đại Dương',
    viDesc:
      'Trọn vẹn hơi thở biển khơi tươi mát từ tôm, cua, cá, mực được đánh bắt và chế biến ngay trong ngày.',
  },
  {
    enName: 'Side',
    viName: 'Món Ăn Kèm Thanh Tao',
    viDesc:
      'Những bản phối rau củ và tinh bột nhẹ nhàng, giúp làm sạch vòm miệng và tôn vinh vương vị món chính.',
  },
  {
    enName: 'Starter',
    viName: 'Khai Vị Kích Thích',
    viDesc:
      'Bước dạo đầu đầy tinh tế với những hương vị chua cay mặn ngọt dôn dốt, khơi mào cho yến tiệc.',
  },
  {
    enName: 'Vegan',
    viName: 'Thuần Chay Tự Nhiên',
    viDesc:
      'Nét đẹp nguyên bản của thực vật, không bơ sữa, mang lại sự thanh tịnh và an lành cho cơ thể.',
  },
  {
    enName: 'Vegetarian',
    viName: 'Ẩm Thực Chay',
    viDesc:
      'Sự kết hợp phong phú giữa rau củ tươi mướt, nấm rừng và phô mai béo ngậy đầy dinh dưỡng.',
  },
  {
    enName: 'Breakfast',
    viName: 'Điểm Tâm Sáng',
    viDesc: 'Khởi đầu ngày mới rực rỡ với những món ăn nóng hổi, tiếp thêm nguồn năng lượng dồi dào.',
  },
  {
    enName: 'Goat',
    viName: 'Thịt Dê Núi Đậm Vị',
    viDesc:
      'Đặc sản dê núi săn chắc, tẩm ướp bí truyền khử sạch mùi hôi, mang lại trải nghiệm thăng hoa.',
  },
];

async function translateCategories() {
  try {
    console.log('⏳ Đang cập nhật Danh mục sang tiếng Việt...');

    for (const cat of categoryTranslations) {
      // Tìm theo tên tiếng Anh và cập nhật sang tiếng Việt
      const result = await pool.query(
        'UPDATE categories SET name = $1, description = $2 WHERE name = $3',
        [cat.viName, cat.viDesc, cat.enName],
      );

      if (result.rowCount && result.rowCount > 0) {
        console.log(`✅ Đã dịch: ${cat.enName} -> ${cat.viName}`);
      }
    }

    console.log('🎉 Hoàn tất Việt hóa toàn bộ Danh mục!');
  } catch (error) {
    console.error('❌ Lỗi khi dịch Danh mục:', error);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

translateCategories();
