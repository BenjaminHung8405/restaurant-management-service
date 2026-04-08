import { Router } from 'express';
import { createReservation } from '../controllers/storefrontReservationController';
import { optionalProtect } from '../middlewares/authMiddleware';

const router = Router();

/**
 * @route  POST /api/v1/storefront/reservations
 * @desc   Public reservation endpoint (guest and optionally authenticated users)
 * @access Public
 */
router.post('/reservations', optionalProtect, createReservation);

export default router;
