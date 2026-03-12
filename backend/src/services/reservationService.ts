import * as reservationRepository from '../infrastructure/repositories/reservationRepository';
import {
    ICreateReservationData,
    IReservationRow,
    IUpdateReservationData,
} from '../infrastructure/repositories/reservationRepository';
import AppError from '../utils/AppError';

/**
 * Lấy danh sách đặt bàn.
 * Truyền `userId` để lọc — customer chỉ thấy đặt bàn của mình.
 *
 * @param userId - (tuỳ chọn) UUID của user cần lọc
 */
export const getAllReservations = async (userId?: string): Promise<IReservationRow[]> => {
  return reservationRepository.findAll(userId);
};

/**
 * Lấy đặt bàn theo id.
 *
 * @throws {AppError} 404 nếu đặt bàn không tồn tại
 */
export const getReservationById = async (id: string): Promise<IReservationRow> => {
  const reservation = await reservationRepository.findById(id);
  if (!reservation) {
    throw new AppError(`Reservation with id '${id}' not found`, 404);
  }
  return reservation;
};

/**
 * Tạo đặt bàn mới.
 * Validate guest_count > 0 trước khi ghi vào DB.
 *
 * @throws {AppError} 400 nếu guest_count không hợp lệ
 * @throws {AppError} 400 nếu table_id không tồn tại (FK violation)
 */
export const createReservation = async (data: ICreateReservationData): Promise<IReservationRow> => {
  if (data.guest_count <= 0) {
    throw new AppError('guest_count must be greater than 0', 400);
  }

  try {
    return await reservationRepository.create(data);
  } catch (err: unknown) {
    if (typeof err === 'object' && err !== null) {
      const pgErr = err as { code?: string };
      // foreign_key_violation: table_id không tồn tại trong bảng tables
      if (pgErr.code === '23503') {
        throw new AppError(`Table with id '${data.table_id}' does not exist`, 400);
      }
    }
    throw err;
  }
};

/**
 * Gán bàn cho đặt bàn và chuyển trạng thái sang 'confirmed'.
 * Dùng cho admin/staff sau khi xem xét lịch đặt bàn.
 *
 * @throws {AppError} 404 nếu đặt bàn không tồn tại
 * @throws {AppError} 400 nếu table_id không tồn tại
 */
export const assignTable = async (id: string, table_id: string): Promise<IReservationRow> => {
  try {
    const updated = await reservationRepository.update(id, { table_id, status: 'confirmed' });
    if (!updated) {
      throw new AppError(`Reservation with id '${id}' not found`, 404);
    }
    return updated;
  } catch (err: unknown) {
    if (typeof err === 'object' && err !== null) {
      const pgErr = err as { code?: string };
      if (pgErr.code === '23503') {
        throw new AppError(`Table with id '${table_id}' does not exist`, 400);
      }
    }
    throw err;
  }
};

/**
 * Cập nhật đặt bàn theo id (general update — dùng bởi admin/staff).
 *
 * @throws {AppError} 404 nếu đặt bàn không tồn tại
 * @throws {AppError} 400 nếu guest_count không hợp lệ
 */
export const updateReservation = async (id: string, data: IUpdateReservationData): Promise<IReservationRow> => {
  if (data.guest_count !== undefined && data.guest_count <= 0) {
    throw new AppError('guest_count must be greater than 0', 400);
  }

  try {
    const updated = await reservationRepository.update(id, data);
    if (!updated) {
      throw new AppError(`Reservation with id '${id}' not found`, 404);
    }
    return updated;
  } catch (err: unknown) {
    if (typeof err === 'object' && err !== null) {
      const pgErr = err as { code?: string };
      if (pgErr.code === '23503') {
        throw new AppError(`Table with id '${data.table_id}' does not exist`, 400);
      }
    }
    throw err;
  }
};

/**
 * Xoá đặt bàn theo id.
 *
 * @throws {AppError} 404 nếu đặt bàn không tồn tại
 */
export const deleteReservation = async (id: string): Promise<IReservationRow> => {
  const deleted = await reservationRepository.remove(id);
  if (!deleted) {
    throw new AppError(`Reservation with id '${id}' not found`, 404);
  }
  return deleted;
};
