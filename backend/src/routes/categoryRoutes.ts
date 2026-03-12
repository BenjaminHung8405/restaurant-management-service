import { Router } from 'express';
import * as categoryController from '../controllers/categoryController';
import { protect, restrictTo } from '../middlewares/authMiddleware';

const router = Router();

/**
 * @route  GET /api/v1/categories
 * @desc   Lấy toàn bộ danh sách categories
 * @access Public
 */
router.get('/', categoryController.getAll);

/**
 * @route  GET /api/v1/categories/:id
 * @desc   Lấy category theo id
 * @access Public
 */
router.get('/:id', categoryController.getOne);

/**
 * @route  POST /api/v1/categories
 * @desc   Tạo category mới
 * @access Private (admin)
 */
router.post('/', protect, restrictTo('admin'), categoryController.create);

/**
 * @route  PUT /api/v1/categories/:id
 * @desc   Cập nhật category theo id
 * @access Private (admin)
 */
router.put('/:id', protect, restrictTo('admin'), categoryController.update);

/**
 * @route  DELETE /api/v1/categories/:id
 * @desc   Xoá category theo id
 * @access Private (admin)
 */
router.delete('/:id', protect, restrictTo('admin'), categoryController.deleteOne);

export default router;
