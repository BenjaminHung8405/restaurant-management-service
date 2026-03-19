import { Router } from 'express';
import * as tableController from '../controllers/tableController';
import { protect, restrictTo } from '../middlewares/authMiddleware';

const router = Router();

/**
 * @route  GET /api/v1/tables/available
 * @desc   Lấy danh sách bàn có sẵn (cho khách hàng chọn bàn)
 * @access Public
 */
router.get('/available', tableController.getAll);

/**
 * @route  GET /api/v1/tables
 * @desc   Lấy toàn bộ danh sách bàn
 * @access Private (admin, staff)
 */
router.get('/', protect, restrictTo('admin', 'staff'), tableController.getAll);

/**
 * @route  GET /api/v1/tables/:id
 * @desc   Lấy bàn theo id
 * @access Private (admin, staff)
 */
router.get('/:id', protect, restrictTo('admin', 'staff'), tableController.getOne);

/**
 * @route  POST /api/v1/tables
 * @desc   Tạo bàn mới
 * @access Private (admin)
 */
router.post('/', protect, restrictTo('admin'), tableController.create);

/**
 * @route  PUT /api/v1/tables/:id
 * @desc   Cập nhật thông tin bàn theo id
 * @access Private (admin)
 */
router.put('/:id', protect, restrictTo('admin'), tableController.update);

/**
 * @route  DELETE /api/v1/tables/:id
 * @desc   Xoá bàn theo id
 * @access Private (admin)
 */
router.delete('/:id', protect, restrictTo('admin'), tableController.deleteOne);

export default router;
