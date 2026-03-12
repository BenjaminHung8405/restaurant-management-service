import cors from 'cors';
import express, { Application, NextFunction, Request, Response } from 'express';
import errorHandler from './middlewares/errorHandler';
import authRoutes from './routes/authRoutes';
import categoryRoutes from './routes/categoryRoutes';
import menuItemRoutes from './routes/menuItemRoutes';
import orderRoutes from './routes/orderRoutes';
import reservationRoutes from './routes/reservationRoutes';
import tableRoutes from './routes/tableRoutes';
import AppError from './utils/AppError';

const app: Application = express();

// --- Global Middlewares ---
// Parse incoming JSON request bodies
app.use(express.json());
// Parse URL-encoded request bodies (e.g., HTML form submissions)
app.use(express.urlencoded({ extended: true }));
// Enable Cross-Origin Resource Sharing for all origins
app.use(cors());

// --- Health Check Route ---
app.get('/api/v1/health', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Server is healthy',
    data: null,
    error: null,
  });
});

// --- Application Routes ---
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/menu-items', menuItemRoutes);
app.use('/api/v1/tables', tableRoutes);
app.use('/api/v1/reservations', reservationRoutes);
app.use('/api/v1/orders', orderRoutes);

// --- Unhandled Route Handler (404) ---
// Bắt tất cả các request đến route không tồn tại và chuyển sang errorHandler
app.use((req: Request, _res: Response, next: NextFunction) => {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));
});

// --- Global Error Handling Middleware ---
// CRITICAL: Phải đặt SAU TẤT CẢ các route và middleware khác
app.use(errorHandler);

export default app;
