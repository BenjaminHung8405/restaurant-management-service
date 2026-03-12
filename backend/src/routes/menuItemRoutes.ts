import { Router } from 'express';
import * as menuItemController from '../controllers/menuItemController';
import { protect, restrictTo } from '../middlewares/authMiddleware';

const router = Router();

/**
 * @route  GET /api/v1/menu-items
 * @desc   Lấy toàn bộ danh sách menu items (hỗ trợ ?categoryId=<uuid>)
 * @access Public
 */
router.get('/', menuItemController.getAll);

/**
 * @route  GET /api/v1/menu-items/:id
 * @desc   Lấy menu item theo id
 * @access Public
 */
router.get('/:id', menuItemController.getOne);

/**
 * @route  POST /api/v1/menu-items
 * @desc   Tạo menu item mới
 * @access Private (admin)
 */
router.post('/', protect, restrictTo('admin'), menuItemController.create);

/**
 * @route  PUT /api/v1/menu-items/:id
 * @desc   Cập nhật menu item theo id
 * @access Private (admin)
 */
router.put('/:id', protect, restrictTo('admin'), menuItemController.update);

/**
 * @route  DELETE /api/v1/menu-items/:id
 * @desc   Xoá menu item theo id
 * @access Private (admin)
 */
router.delete('/:id', protect, restrictTo('admin'), menuItemController.deleteOne);

export default router;
