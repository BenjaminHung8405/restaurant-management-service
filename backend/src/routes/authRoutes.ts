import { Router } from 'express';
import * as authController from '../controllers/authController';

const router = Router();

/**
 * @route  POST /api/v1/auth/register
 * @desc   Đăng ký tài khoản mới
 * @access Public
 */
router.post('/register', authController.register);

/**
 * @route  POST /api/v1/auth/login
 * @desc   Đăng nhập, nhận JWT token
 * @access Public
 */
router.post('/login', authController.login);

export default router;
