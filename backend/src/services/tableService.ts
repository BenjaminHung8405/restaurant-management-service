import * as tableRepository from '../infrastructure/repositories/tableRepository';
import {
    ICreateTableData,
    ITableRow,
    IUpdateTableData,
} from '../infrastructure/repositories/tableRepository';
import AppError from '../utils/AppError';

/**
 * Lấy toàn bộ danh sách bàn.
 *
 * @returns Mảng ITableRow
 */
export const getAllTables = async (): Promise<ITableRow[]> => {
  return tableRepository.findAll();
};

/**
 * Lấy bàn theo id.
 *
 * @throws {AppError} 404 nếu bàn không tồn tại
 */
export const getTableById = async (id: string): Promise<ITableRow> => {
  const table = await tableRepository.findById(id);
  if (!table) {
    throw new AppError(`Table with id '${id}' not found`, 404);
  }
  return table;
};

/**
 * Tạo bàn mới.
 * Catch lỗi unique violation (23505) khi số bàn bị trùng.
 *
 * @throws {AppError} 400 nếu số bàn đã tồn tại
 */
export const createTable = async (data: ICreateTableData): Promise<ITableRow> => {
  try {
    return await tableRepository.create(data);
  } catch (err: unknown) {
    if (
      typeof err === 'object' &&
      err !== null &&
      (err as { code?: string }).code === '23505'
    ) {
      throw new AppError(`Table number ${data.table_number} already exists`, 400);
    }
    throw err;
  }
};

/**
 * Cập nhật thông tin bàn theo id.
 *
 * @throws {AppError} 404 nếu bàn không tồn tại
 * @throws {AppError} 400 nếu số bàn mới bị trùng với bàn khác
 */
export const updateTable = async (id: string, data: IUpdateTableData): Promise<ITableRow> => {
  try {
    const updated = await tableRepository.update(id, data);
    if (!updated) {
      throw new AppError(`Table with id '${id}' not found`, 404);
    }
    return updated;
  } catch (err: unknown) {
    if (
      typeof err === 'object' &&
      err !== null &&
      (err as { code?: string }).code === '23505'
    ) {
      throw new AppError(`Table number ${data.table_number} already exists`, 400);
    }
    throw err;
  }
};

/**
 * Xoá bàn theo id.
 *
 * @throws {AppError} 404 nếu bàn không tồn tại
 */
export const deleteTable = async (id: string): Promise<ITableRow> => {
  const deleted = await tableRepository.remove(id);
  if (!deleted) {
    throw new AppError(`Table with id '${id}' not found`, 404);
  }
  return deleted;
};
