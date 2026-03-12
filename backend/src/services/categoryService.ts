import * as categoryRepository from '../infrastructure/repositories/categoryRepository';
import {
    ICategoryRow,
    ICreateCategoryData,
    IUpdateCategoryData,
} from '../infrastructure/repositories/categoryRepository';
import AppError from '../utils/AppError';

/**
 * Lấy toàn bộ danh sách categories.
 *
 * @returns Mảng ICategoryRow
 */
export const getAllCategories = async (): Promise<ICategoryRow[]> => {
  return categoryRepository.findAll();
};

/**
 * Lấy category theo id.
 *
 * @throws {AppError} 404 nếu category không tồn tại
 */
export const getCategoryById = async (id: string): Promise<ICategoryRow> => {
  const category = await categoryRepository.findById(id);
  if (!category) {
    throw new AppError(`Category with id '${id}' not found`, 404);
  }
  return category;
};

/**
 * Tạo category mới.
 * Kiểm tra trùng tên trước khi insert để trả về lỗi rõ ràng.
 *
 * @throws {AppError} 400 nếu tên category đã tồn tại
 */
export const createCategory = async (data: ICreateCategoryData): Promise<ICategoryRow> => {
  try {
    return await categoryRepository.create(data);
  } catch (err: unknown) {
    // unique_violation: PostgreSQL error code 23505
    if (
      typeof err === 'object' &&
      err !== null &&
      (err as { code?: string }).code === '23505'
    ) {
      throw new AppError(`A category with the name '${data.name}' already exists`, 400);
    }
    throw err;
  }
};

/**
 * Cập nhật category theo id.
 *
 * @throws {AppError} 404 nếu category không tồn tại
 * @throws {AppError} 400 nếu tên mới bị trùng với category khác
 */
export const updateCategory = async (id: string, data: IUpdateCategoryData): Promise<ICategoryRow> => {
  try {
    const updated = await categoryRepository.update(id, data);
    if (!updated) {
      throw new AppError(`Category with id '${id}' not found`, 404);
    }
    return updated;
  } catch (err: unknown) {
    if (
      typeof err === 'object' &&
      err !== null &&
      (err as { code?: string }).code === '23505'
    ) {
      throw new AppError(`A category with the name '${data.name}' already exists`, 400);
    }
    throw err;
  }
};

/**
 * Xoá category theo id.
 *
 * @throws {AppError} 404 nếu category không tồn tại
 */
export const deleteCategory = async (id: string): Promise<ICategoryRow> => {
  const deleted = await categoryRepository.remove(id);
  if (!deleted) {
    throw new AppError(`Category with id '${id}' not found`, 404);
  }
  return deleted;
};
