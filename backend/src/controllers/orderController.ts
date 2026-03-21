import { NextFunction, Request, Response } from 'express';
import { ICreateOrderItem } from '../infrastructure/repositories/orderRepository';
import * as orderService from '../services/orderService';
import AppError from '../utils/AppError';

/**
 * GET /api/v1/orders
 * Lấy toàn bộ danh sách orders.
 * Chỉ admin và staff được phép.
 */
export const getAll = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const orders = await orderService.getAllOrders();
    res.status(200).json({
      success: true,
      message: 'Orders fetched successfully',
      data: orders,
      error: null,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/orders/:id
 * Lấy chi tiết 1 order kèm order_items.
 * Chỉ admin và staff được phép.
 */
export const getOne = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const order = await orderService.getOrderById(req.params.id as string);
    res.status(200).json({
      success: true,
      message: 'Order fetched successfully',
      data: order,
      error: null,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/v1/orders
 * Tạo order mới kèm danh sách items trong một transaction.
 * Mọi user đã đăng nhập đều được phép.
 *
 * Body: { table_id?: string, items: ICreateOrderItem[] }
 * user_id lấy từ req.user (JWT) — KHÔNG lấy từ body.
 */
export const create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { table_id, items } = req.body as {
      table_id?: string | null;
      items: ICreateOrderItem[];
    };

    // 📥 Log incoming request
    const timestamp = new Date().toISOString();
    console.log(`[ORDER] 📥 New order request received at ${timestamp}`);
    console.log(`[ORDER] 📥 Table ID: ${table_id || 'GUEST'} | Items in cart: ${items.length}`);

    // Validate items tại tầng Controller trước khi xuống Service
    if (!Array.isArray(items) || items.length === 0) {
      console.warn(`[ORDER] ⚠️ Validation failed: Order must contain at least one item`);
      return next(new AppError('Order must contain at least one item', 400));
    }

    // Safely extract user ID using optional chaining - null for guest orders
    const user_id = req.user?.id ? String(req.user.id) : null;
    console.log(`[ORDER] 👤 User ID: ${user_id || 'GUEST_USER'}`);

    const newOrder = await orderService.createOrder({ user_id, table_id, items });

    // ✅ Log successful order creation
    console.log(`[ORDER] ✅ Order successfully created! Order ID: ${newOrder.order.id}`);
    console.log(`[ORDER] ✅ Total items: ${newOrder.items.length} | Total amount: ${newOrder.order.total_amount}`);

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: newOrder,
      error: null,
    });
  } catch (err) {
    // ❌ Log the exact database or service error for debugging
    console.error(`[ORDER] ❌ Failed to create order:`, err);
    console.error(`[ORDER] ❌ Error stack:`, (err as Error)?.stack || 'No stack trace');
    next(err);
  }
};

/**
 * PUT /api/v1/orders/:id
 * Cập nhật order_status hoặc payment_status.
 * Chỉ admin và staff được phép.
 *
 * Body: { order_status?: string, payment_status?: string }
 */
export const update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { order_status, payment_status } = req.body as {
      order_status?: string;
      payment_status?: string;
    };

    const updatedOrder = await orderService.updateOrder(req.params.id as string, {
      order_status,
      payment_status,
    });

    res.status(200).json({
      success: true,
      message: 'Order updated successfully',
      data: updatedOrder,
      error: null,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/v1/orders/:id
 * Xoá order theo id.
 * Chỉ admin được phép.
 */
export const deleteOne = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const deleted = await orderService.deleteOrder(req.params.id as string);
    res.status(200).json({
      success: true,
      message: 'Order deleted successfully',
      data: deleted,
      error: null,
    });
  } catch (err) {
    next(err);
  }
};
