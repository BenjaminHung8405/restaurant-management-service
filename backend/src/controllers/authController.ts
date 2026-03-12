import { NextFunction, Request, Response } from 'express';
import * as authService from '../services/authService';

/**
 * POST /api/v1/auth/register
 *
 * Đăng ký tài khoản mới. Nhận email, password, fullName (bắt buộc)
 * và phoneNumber, role (tuỳ chọn) từ request body.
 */
export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password, full_name, phone_number, role } = req.body as {
      email: string;
      password: string;
      full_name: string;
      phone_number?: string;
      role?: string;
    };

    const result = await authService.registerUser({ email, password, full_name, phone_number, role: role as authService.IRegisterDto['role'] });

    res.status(201).json({
      success: true,
      message: 'Account registered successfully',
      data: result,
      error: null,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/v1/auth/login
 *
 * Đăng nhập bằng email và password. Trả về JWT token khi thành công.
 */
export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body as { email: string; password: string };

    const result = await authService.loginUser(email, password);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: result,
      error: null,
    });
  } catch (err) {
    next(err);
  }
};
