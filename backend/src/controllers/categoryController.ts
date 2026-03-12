import { NextFunction, Request, Response } from 'express';
import * as categoryService from '../services/categoryService';

/**
 * GET /api/v1/categories
 *
 * Lấy toàn bộ danh sách categories.
 * @access Public
 */
export const getAll = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const categories = await categoryService.getAllCategories();

    res.status(200).json({
      success: true,
      message: 'Categories retrieved successfully',
      data: categories,
      error: null,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/categories/:id
 *
 * Lấy category theo id (UUID).
 * @access Public
 */
export const getOne = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const category = await categoryService.getCategoryById(req.params.id as string);

    res.status(200).json({
      success: true,
      message: 'Category retrieved successfully',
      data: category,
      error: null,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/v1/categories
 *
 * Tạo category mới. Yêu cầu role admin.
 * @access Private (admin)
 */
export const create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, description, image_url } = req.body as {
      name: string;
      description?: string;
      image_url?: string;
    };

    const category = await categoryService.createCategory({ name, description, image_url });

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: category,
      error: null,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/v1/categories/:id
 *
 * Cập nhật category theo id. Yêu cầu role admin.
 * @access Private (admin)
 */
export const update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, description, image_url } = req.body as {
      name?: string;
      description?: string;
      image_url?: string;
    };

    const category = await categoryService.updateCategory(req.params.id as string, { name, description, image_url });

    res.status(200).json({
      success: true,
      message: 'Category updated successfully',
      data: category,
      error: null,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/v1/categories/:id
 *
 * Xoá category theo id. Yêu cầu role admin.
 * @access Private (admin)
 */
export const deleteOne = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const category = await categoryService.deleteCategory(req.params.id as string);

    res.status(200).json({
      success: true,
      message: 'Category deleted successfully',
      data: category,
      error: null,
    });
  } catch (err) {
    next(err);
  }
};
