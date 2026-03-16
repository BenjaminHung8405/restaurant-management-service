import pool from '../database/postgres';

/**
 * IMenuItemRow - Kiểu dữ liệu ánh xạ trực tiếp từ bảng `menu_items` trong PostgreSQL.
 * Dùng snake_case để khớp chính xác với tên cột trong DB.
 */
export interface IMenuItemRow {
  id: string;
  category_id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  area: string | null;
  is_available: boolean;
  is_featured: boolean;
}

/**
 * ICreateMenuItemData - DTO cho thao tác tạo menu item mới.
 */
export interface ICreateMenuItemData {
  category_id: string;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  area?: string;
  is_available?: boolean;
  is_featured?: boolean;
}

/**
 * IUpdateMenuItemData - DTO cho thao tác cập nhật menu item.
 */
export interface IUpdateMenuItemData {
  category_id?: string;
  name?: string;
  description?: string;
  price?: number;
  image_url?: string;
  area?: string;
  is_available?: boolean;
  is_featured?: boolean;
}

/**
 * Lấy toàn bộ danh sách menu items, hỗ trợ lọc tuỳ chọn theo category_id và is_featured.
 *
 * Khi `categoryId` và/hoặc `isFeatured` được truyền vào, thêm mệnh đề WHERE để lọc kết quả —
 * tránh lấy dư dữ liệu không cần thiết từ DB.
 *
 * @param categoryId - (tuỳ chọn) UUID của category cần lọc
 * @param isFeatured - (tuỳ chọn) boolean để lọc chỉ các featured items
 * @returns Mảng IMenuItemRow
 */
export const findAll = async (categoryId?: string, isFeatured?: boolean): Promise<IMenuItemRow[]> => {
  // Xây dựng WHERE clauses và params một cách an toàn
  const whereClauses: string[] = [];
  const params: (string | boolean)[] = [];

  if (categoryId) {
    whereClauses.push(`category_id = $${params.length + 1}`);
    params.push(categoryId);
  }

  if (isFeatured !== undefined) {
    whereClauses.push(`is_featured = $${params.length + 1}`);
    params.push(isFeatured);
  }

  // Kết hợp WHERE clause
  const whereClause = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

  const query = `SELECT id, category_id, name, description, price, image_url, area, is_available, is_featured
                 FROM menu_items
                 ${whereClause}
                 ORDER BY name ASC`;

  const result = await pool.query<IMenuItemRow>(query, params);
  return result.rows;
};

/**
 * Tìm menu item theo id (UUID).
 * Dùng parameterized query ($1) để ngăn SQL Injection.
 *
 * @returns IMenuItemRow nếu tìm thấy, null nếu không tồn tại
 */
export const findById = async (id: string): Promise<IMenuItemRow | null> => {
  const result = await pool.query<IMenuItemRow>(
    `SELECT id, category_id, name, description, price, image_url, area, is_available, is_featured
     FROM menu_items
     WHERE id = $1 LIMIT 1`,
    [id],
  );
  return result.rows[0] ?? null;
};

/**
 * Tạo menu item mới và trả về row vừa tạo.
 * RETURNING * để lấy đầy đủ dữ liệu bao gồm id UUID do DB sinh ra.
 *
 * @returns IMenuItemRow - menu item vừa tạo
 */
export const create = async (data: ICreateMenuItemData): Promise<IMenuItemRow> => {
  const {
    category_id,
    name,
    description = null,
    price,
    image_url = null,
    area = null,
    is_available = true,
    is_featured = false,
  } = data;

  const result = await pool.query<IMenuItemRow>(
    `INSERT INTO menu_items (category_id, name, description, price, image_url, area, is_available, is_featured)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [category_id, name, description, price, image_url, area, is_available, is_featured],
  );
  return result.rows[0];
};

/**
 * Cập nhật menu item theo id. Chỉ set các cột có giá trị được truyền vào.
 * Dùng RETURNING * để trả về row sau khi cập nhật.
 *
 * @returns IMenuItemRow sau khi cập nhật, null nếu không tìm thấy
 */
export const update = async (id: string, data: IUpdateMenuItemData): Promise<IMenuItemRow | null> => {
  const { category_id, name, description, price, image_url, area, is_available, is_featured } = data;

  const result = await pool.query<IMenuItemRow>(
    `UPDATE menu_items
     SET category_id  = COALESCE($1, category_id),
         name         = COALESCE($2, name),
         description  = COALESCE($3, description),
         price        = COALESCE($4, price),
         image_url    = COALESCE($5, image_url),
         area         = COALESCE($6, area),
         is_available = COALESCE($7, is_available),
         is_featured  = COALESCE($8, is_featured)
     WHERE id = $9
     RETURNING *`,
    [
      category_id ?? null,
      name ?? null,
      description ?? null,
      price ?? null,
      image_url ?? null,
      area ?? null,
      is_available ?? null,
      is_featured ?? null,
      id,
    ],
  );
  return result.rows[0] ?? null;
};

/**
 * Xoá menu item theo id.
 * Dùng RETURNING * để xác nhận bản ghi tồn tại trước khi xoá.
 *
 * @returns IMenuItemRow vừa bị xoá, null nếu không tìm thấy
 */
export const remove = async (id: string): Promise<IMenuItemRow | null> => {
  const result = await pool.query<IMenuItemRow>(
    'DELETE FROM menu_items WHERE id = $1 RETURNING *',
    [id],
  );
  return result.rows[0] ?? null;
};
