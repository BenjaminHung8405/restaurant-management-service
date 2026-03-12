import { Router } from 'express';
import * as reservationController from '../controllers/reservationController';
import { protect, restrictTo } from '../middlewares/authMiddleware';

const router = Router();

/**
 * @route  GET /api/v1/reservations
 * @desc   Lấy danh sách đặt bàn (customer thấy của mình, admin/staff thấy tất cả)
 * @access Private (all authenticated)
 */
router.get('/', protect, reservationController.getAll);

/**
 * @route  GET /api/v1/reservations/:id
 * @desc   Lấy đặt bàn theo id
 * @access Private (all authenticated)
 */
router.get('/:id', protect, reservationController.getOne);

/**
 * @route  POST /api/v1/reservations
 * @desc   Tạo đặt bàn mới (customer tự đặt, user_id lấy từ JWT)
 * @access Private (all authenticated)
 */
router.post('/', protect, reservationController.create);

/**
 * @route  PUT /api/v1/reservations/:id/assign
 * @desc   Gán bàn cho đặt bàn và chuyển status -> 'confirmed'
 * @access Private (admin, staff)
 */
router.put('/:id/assign', protect, restrictTo('admin', 'staff'), reservationController.assignTable);

/**
 * @route  PUT /api/v1/reservations/:id
 * @desc   Cập nhật thông tin đặt bàn
 * @access Private (admin, staff)
 */
router.put('/:id', protect, restrictTo('admin', 'staff'), reservationController.update);

/**
 * @route  DELETE /api/v1/reservations/:id
 * @desc   Xoá đặt bàn theo id
 * @access Private (admin, staff)
 */
router.delete('/:id', protect, restrictTo('admin', 'staff'), reservationController.deleteOne);

export default router;
