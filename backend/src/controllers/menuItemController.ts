import { NextFunction, Request, Response } from 'express';
import * as menuItemService from '../services/menuItemService';
import AppError from '../utils/AppError';

/**
 * GET /api/v1/menu-items
 * GET /api/v1/menu-items?categoryId=<uuid>
 * GET /api/v1/menu-items?isFeatured=true
 * GET /api/v1/menu-items?categoryId=<uuid>&isFeatured=true
 *
 * Lấy toàn bộ danh sách menu items.
 * Hỗ trợ lọc tuỳ chọn qua query params:
 * - `categoryId`: UUID của category cần lọc
 * - `isFeatured`: boolean để lọc chỉ các featured items (default: undefined)
 * @access Public
 */
export const getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Lấy categoryId từ query string; undefined nếu không có
    const categoryId = req.query.categoryId as string | undefined;

    // Lấy isFeatured từ query string; evaluate as boolean nếu có, undefined nếu không
    const isFeatured = req.query.isFeatured === 'true' ? true : req.query.isFeatured === 'false' ? false : undefined;

    const items = await menuItemService.getAllMenuItems(categoryId, isFeatured);

    res.status(200).json({
      success: true,
      message: 'Menu items retrieved successfully',
      data: items,
      error: null,
    });
  } catch (err) {
    // Handle AggregateError from pg-pool connection issues
    if (err instanceof AggregateError) {
      return next(new AppError(
        'Database connection error. Please try again in a moment.',
        503,
      ));
    }
    next(err);
  }
};

/**
 * GET /api/v1/menu-items/:id
 *
 * Lấy menu item theo id (UUID).
 * @access Public
 */
export const getOne = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const item = await menuItemService.getMenuItemById(req.params.id as string);

    res.status(200).json({
      success: true,
      message: 'Menu item retrieved successfully',
      data: item,
      error: null,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/v1/menu-items
 *
 * Tạo menu item mới. Yêu cầu role admin.
 * @access Private (admin)
 */
export const create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { category_id, name, description, price, image_url, area, is_available, is_featured } = req.body as {
      category_id: string;
      name: string;
      description?: string;
      price: number;
      image_url?: string;
      area?: string;
      is_available?: boolean;
      is_featured?: boolean;
    };

    const item = await menuItemService.createMenuItem({
      category_id,
      name,
      description,
      price,
      image_url,
      area,
      is_available,
      is_featured,
    });

    res.status(201).json({
      success: true,
      message: 'Menu item created successfully',
      data: item,
      error: null,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/v1/menu-items/:id
 *
 * Cập nhật menu item theo id. Yêu cầu role admin.
 * @access Private (admin)
 */
export const update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { category_id, name, description, price, image_url, area, is_available, is_featured } = req.body as {
      category_id?: string;
      name?: string;
      description?: string;
      price?: number;
      image_url?: string;
      area?: string;
      is_available?: boolean;
      is_featured?: boolean;
    };

    const item = await menuItemService.updateMenuItem(req.params.id as string, {
      category_id,
      name,
      description,
      price,
      image_url,
      area,
      is_available,
      is_featured,
    });

    res.status(200).json({
      success: true,
      message: 'Menu item updated successfully',
      data: item,
      error: null,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/v1/menu-items/:id
 *
 * Xoá menu item theo id. Yêu cầu role admin.
 * @access Private (admin)
 */
export const deleteOne = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const item = await menuItemService.deleteMenuItem(req.params.id as string);

    res.status(200).json({
      success: true,
      message: 'Menu item deleted successfully',
      data: item,
      error: null,
    });
  } catch (err) {
    next(err);
  }
};
