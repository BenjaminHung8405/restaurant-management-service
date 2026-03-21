import * as orderRepository from '../infrastructure/repositories/orderRepository';
import {
    ICreateOrderItem,
    IOrderRow,
    IOrderWithItems,
    IUpdateOrderData,
} from '../infrastructure/repositories/orderRepository';
import AppError from '../utils/AppError';

/**
 * ICreateOrderInput - DTO đầu vào từ controller khi tạo order mới.
 */
export interface ICreateOrderInput {
  user_id: string | null;
  table_id?: string | null;
  items: ICreateOrderItem[];
}

/**
 * Lấy toàn bộ danh sách orders.
 *
 * @returns Mảng IOrderRow
 */
export const getAllOrders = async (): Promise<IOrderRow[]> => {
  return orderRepository.findAll();
};

/**
 * Lấy order theo id kèm danh sách items.
 *
 * @throws {AppError} 404 nếu order không tồn tại
 */
export const getOrderById = async (id: string): Promise<IOrderWithItems> => {
  const result = await orderRepository.findById(id);
  if (!result) {
    throw new AppError(`Order with id '${id}' not found`, 404);
  }
  return result;
};

/**
 * Tạo order mới.
 *
 * Tính `total_amount` từ itemsArray (quantity × unit_price),
 * sau đó gọi repository để thực thi transaction.
 *
 * @throws {AppError} 400 nếu items rỗng hoặc quantity/unit_price không hợp lệ
 * @throws {AppError} 400 nếu menu_item_id hoặc table_id không tồn tại (FK violation)
 */
export const createOrder = async (input: ICreateOrderInput): Promise<IOrderWithItems> => {
  const { user_id, table_id, items } = input;

  // Validate từng item trước khi tính tổng
  for (const item of items) {
    if (item.quantity <= 0) {
      throw new AppError('Each item quantity must be greater than 0', 400);
    }
    if (item.unit_price < 0) {
      throw new AppError('Each item unit_price must be non-negative', 400);
    }
  }

  // Tính total_amount tại tầng Service — không để DB tự tính
  const total_amount = items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);

  try {
    return await orderRepository.createOrderWithItems(
      { user_id, table_id, total_amount },
      items,
    );
  } catch (err: unknown) {
    if (typeof err === 'object' && err !== null) {
      const pgErr = err as { code?: string; constraint?: string };
      if (pgErr.code === '23503') {
        // FK violation — kiểm tra constraint để báo lỗi chính xác
        if (pgErr.constraint?.includes('table')) {
          throw new AppError(`Table with id '${table_id}' does not exist`, 400);
        }
        throw new AppError('One or more menu items do not exist', 400);
      }
    }
    throw err;
  }
};

/**
 * Cập nhật order_status hoặc payment_status theo id.
 *
 * @throws {AppError} 404 nếu order không tồn tại
 */
export const updateOrder = async (id: string, data: IUpdateOrderData): Promise<IOrderRow> => {
  const updated = await orderRepository.update(id, data);
  if (!updated) {
    throw new AppError(`Order with id '${id}' not found`, 404);
  }
  return updated;
};

/**
 * Xoá order theo id.
 *
 * @throws {AppError} 404 nếu order không tồn tại
 */
export const deleteOrder = async (id: string): Promise<IOrderRow> => {
  const deleted = await orderRepository.remove(id);
  if (!deleted) {
    throw new AppError(`Order with id '${id}' not found`, 404);
  }
  return deleted;
};
