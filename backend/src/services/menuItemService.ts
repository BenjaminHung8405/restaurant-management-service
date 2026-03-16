import * as menuItemRepository from '../infrastructure/repositories/menuItemRepository';
import {
    ICreateMenuItemData,
    IMenuItemRow,
    IUpdateMenuItemData,
} from '../infrastructure/repositories/menuItemRepository';
import AppError from '../utils/AppError';

/**
 * Lấy toàn bộ danh sách menu items, hỗ trợ lọc tuỳ chọn theo category_id và is_featured.
 * Truyền các filter parameters xuống repository để lọc ngay tại tầng DB.
 *
 * @param categoryId - (tuỳ chọn) UUID của category cần lọc
 * @param isFeatured - (tuỳ chọn) boolean để lọc chỉ các featured items
 * @returns Mảng IMenuItemRow
 */
export const getAllMenuItems = async (categoryId?: string, isFeatured?: boolean): Promise<IMenuItemRow[]> => {
  return menuItemRepository.findAll(categoryId, isFeatured);
};

/**
 * Lấy menu item theo id.
 *
 * @throws {AppError} 404 nếu menu item không tồn tại
 */
export const getMenuItemById = async (id: string): Promise<IMenuItemRow> => {
  const item = await menuItemRepository.findById(id);
  if (!item) {
    throw new AppError(`Menu item with id '${id}' not found`, 404);
  }
  return item;
};

/**
 * Tạo menu item mới.
 * Catch lỗi foreign key violation (23503) khi category_id không tồn tại,
 * và unique violation (23505) khi tên bị trùng trong cùng category.
 *
 * @throws {AppError} 400 nếu category_id không hợp lệ hoặc tên đã tồn tại
 */
export const createMenuItem = async (data: ICreateMenuItemData): Promise<IMenuItemRow> => {
  try {
    return await menuItemRepository.create(data);
  } catch (err: unknown) {
    if (typeof err === 'object' && err !== null) {
      const pgErr = err as { code?: string };
      // foreign_key_violation: category_id không tồn tại trong bảng categories
      if (pgErr.code === '23503') {
        throw new AppError(`Category with id '${data.category_id}' does not exist`, 400);
      }
      // unique_violation: tên item trùng
      if (pgErr.code === '23505') {
        throw new AppError(`A menu item with the name '${data.name}' already exists`, 400);
      }
    }
    throw err;
  }
};

/**
 * Cập nhật menu item theo id.
 *
 * @throws {AppError} 404 nếu menu item không tồn tại
 * @throws {AppError} 400 nếu category_id mới không hợp lệ hoặc tên mới bị trùng
 */
export const updateMenuItem = async (id: string, data: IUpdateMenuItemData): Promise<IMenuItemRow> => {
  try {
    const updated = await menuItemRepository.update(id, data);
    if (!updated) {
      throw new AppError(`Menu item with id '${id}' not found`, 404);
    }
    return updated;
  } catch (err: unknown) {
    if (typeof err === 'object' && err !== null) {
      const pgErr = err as { code?: string };
      if (pgErr.code === '23503') {
        throw new AppError(`Category with id '${data.category_id}' does not exist`, 400);
      }
      if (pgErr.code === '23505') {
        throw new AppError(`A menu item with the name '${data.name}' already exists`, 400);
      }
    }
    throw err;
  }
};

/**
 * Xoá menu item theo id.
 *
 * @throws {AppError} 404 nếu menu item không tồn tại
 */
export const deleteMenuItem = async (id: string): Promise<IMenuItemRow> => {
  const deleted = await menuItemRepository.remove(id);
  if (!deleted) {
    throw new AppError(`Menu item with id '${id}' not found`, 404);
  }
  return deleted;
};
