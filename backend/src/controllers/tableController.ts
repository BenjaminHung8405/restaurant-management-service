import { NextFunction, Request, Response } from 'express';
import * as tableService from '../services/tableService';

/**
 * GET /api/v1/tables
 *
 * Lấy toàn bộ danh sách bàn.
 * @access Private (admin, staff)
 */
export const getAll = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tables = await tableService.getAllTables();

    res.status(200).json({
      success: true,
      message: 'Tables retrieved successfully',
      data: tables,
      error: null,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/tables/:id
 *
 * Lấy bàn theo id (UUID).
 * @access Private (admin, staff)
 */
export const getOne = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const table = await tableService.getTableById(req.params.id as string);

    res.status(200).json({
      success: true,
      message: 'Table retrieved successfully',
      data: table,
      error: null,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/v1/tables
 *
 * Tạo bàn mới. Yêu cầu role admin.
 * @access Private (admin)
 */
export const create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { table_number, capacity, status } = req.body as {
      table_number: number;
      capacity: number;
      status?: string;
    };

    const table = await tableService.createTable({ table_number, capacity, status });

    res.status(201).json({
      success: true,
      message: 'Table created successfully',
      data: table,
      error: null,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/v1/tables/:id
 *
 * Cập nhật thông tin bàn theo id. Yêu cầu role admin.
 * @access Private (admin)
 */
export const update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { table_number, capacity, status } = req.body as {
      table_number?: number;
      capacity?: number;
      status?: string;
    };

    const table = await tableService.updateTable(req.params.id as string, {
      table_number,
      capacity,
      status,
    });

    res.status(200).json({
      success: true,
      message: 'Table updated successfully',
      data: table,
      error: null,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/v1/tables/:id
 *
 * Xoá bàn theo id. Yêu cầu role admin.
 * @access Private (admin)
 */
export const deleteOne = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const table = await tableService.deleteTable(req.params.id as string);

    res.status(200).json({
      success: true,
      message: 'Table deleted successfully',
      data: table,
      error: null,
    });
  } catch (err) {
    next(err);
  }
};
