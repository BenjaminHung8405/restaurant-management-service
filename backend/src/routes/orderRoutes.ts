import { Router } from 'express';
import * as orderController from '../controllers/orderController';
import { protect, restrictTo } from '../middlewares/authMiddleware';

const router = Router();

// GET /api/v1/orders — chỉ admin và staff
router.get('/', protect, restrictTo('admin', 'staff'), orderController.getAll);

// GET /api/v1/orders/:id — chỉ admin và staff
router.get('/:id', protect, restrictTo('admin', 'staff'), orderController.getOne);

// POST /api/v1/orders — mọi user đã đăng nhập
router.post('/', protect, orderController.create);

// PUT /api/v1/orders/:id — chỉ admin và staff
router.put('/:id', protect, restrictTo('admin', 'staff'), orderController.update);

// DELETE /api/v1/orders/:id — chỉ admin
router.delete('/:id', protect, restrictTo('admin'), orderController.deleteOne);

export default router;
