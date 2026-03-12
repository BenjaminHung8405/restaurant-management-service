import { NextFunction, Request, Response } from 'express';
import * as reservationService from '../services/reservationService';
import AppError from '../utils/AppError';

/**
 * GET /api/v1/reservations
 *
 * Admin/staff thấy toàn bộ đặt bàn.
 * Customer chỉ thấy đặt bàn của chính mình (lọc theo req.user.id).
 * @access Private (all authenticated)
 */
export const getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Bảo vệ IDOR: customer không thể xem đặt bàn của người khác
    const userId = req.user!.role === 'customer' ? String(req.user!.id) : undefined;

    const reservations = await reservationService.getAllReservations(userId);

    res.status(200).json({
      success: true,
      message: 'Reservations retrieved successfully',
      data: reservations,
      error: null,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/reservations/:id
 *
 * Lấy đặt bàn theo id.
 * @access Private (all authenticated)
 */
export const getOne = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const reservation = await reservationService.getReservationById(req.params.id as string);

    // Customer chỉ được xem đặt bàn của chính mình
    if (req.user!.role === 'customer' && reservation.user_id !== String(req.user!.id)) {
      next(new AppError('You do not have permission to view this reservation', 403));
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Reservation retrieved successfully',
      data: reservation,
      error: null,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/v1/reservations
 *
 * Customer đặt bàn. user_id lấy từ JWT — không cho phép client tự gửi.
 * table_id bị bỏ qua hoàn toàn; sẽ được admin/staff gán qua PUT /:id/assign.
 * Status mặc định là 'pending'.
 * @access Private (all authenticated)
 */
export const create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Lấy user_id từ JWT payload — không bao giờ tin tưởng giá trị từ body
    const user_id = String(req.user!.id);

    const { reservation_time, guest_count, notes } = req.body as {
      reservation_time: string;
      guest_count: number;
      notes?: string;
    };

    const reservation = await reservationService.createReservation({
      user_id,
      reservation_time,
      guest_count,
      notes,
      // table_id không được customer cung cấp — DB default là null
    });

    res.status(201).json({
      success: true,
      message: 'Reservation created successfully',
      data: reservation,
      error: null,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/v1/reservations/:id/assign
 *
 * Admin/staff gán bàn cho đặt bàn và chuyển status -> 'confirmed'.
 * @access Private (admin, staff)
 */
export const assignTable = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { table_id } = req.body as { table_id: string };

    const reservation = await reservationService.assignTable(req.params.id as string, table_id);

    res.status(200).json({
      success: true,
      message: 'Table assigned and reservation confirmed',
      data: reservation,
      error: null,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/v1/reservations/:id
 *
 * Cập nhật đặt bàn theo id. Dùng bởi admin/staff.
 * @access Private (admin, staff)
 */
export const update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { table_id, reservation_time, guest_count, notes, status } = req.body as {
      table_id?: string;
      reservation_time?: string;
      guest_count?: number;
      notes?: string;
      status?: string;
    };

    const reservation = await reservationService.updateReservation(req.params.id as string, {
      table_id,
      reservation_time,
      guest_count,
      notes,
      status,
    });

    res.status(200).json({
      success: true,
      message: 'Reservation updated successfully',
      data: reservation,
      error: null,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/v1/reservations/:id
 *
 * Xoá đặt bàn theo id. Dùng bởi admin/staff.
 * @access Private (admin, staff)
 */
export const deleteOne = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const reservation = await reservationService.deleteReservation(req.params.id as string);

    res.status(200).json({
      success: true,
      message: 'Reservation deleted successfully',
      data: reservation,
      error: null,
    });
  } catch (err) {
    next(err);
  }
};
