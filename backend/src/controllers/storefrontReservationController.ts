import { Request, Response } from 'express';
import * as reservationService from '../services/reservationService';
import AppError from '../utils/AppError';

interface IStorefrontReservationBody {
  guest_name?: string;
  guest_phone?: string;
  reservation_date?: string;
  reservation_time?: string;
  datetime?: string;
  party_size?: number;
  notes?: string;
}

const buildReservationDateTime = (
  reservationDate: string,
  reservationTime?: string,
  datetime?: string,
): string => {
  if (datetime && datetime.trim() !== '') {
    return datetime;
  }

  if (reservationTime && reservationTime.trim() !== '') {
    // Support plain HH:mm[:ss] input by combining with reservation_date.
    return `${reservationDate}T${reservationTime}`;
  }

  // Default to start of day when only date is provided.
  return `${reservationDate}T00:00:00`;
};

/**
 * Public storefront reservation endpoint.
 * Supports both guest booking and logged-in booking (if optional token is provided).
 */
export const createReservation = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      guest_name,
      guest_phone,
      reservation_date,
      reservation_time,
      datetime,
      party_size,
      notes,
    } = req.body as IStorefrontReservationBody;

    console.log(`[RESERVATION] 📥 New booking request from: ${guest_name ?? ''} - Phone: ${guest_phone ?? ''}`);

    if (!guest_name || !guest_phone || !reservation_date || party_size === undefined || party_size === null) {
      throw new AppError(
        'Missing required fields: guest_name, guest_phone, reservation_date, and party_size are required',
        400,
      );
    }

    const reservationDateTime = buildReservationDateTime(reservation_date, reservation_time, datetime);
    const parsedDate = new Date(reservationDateTime);
    if (Number.isNaN(parsedDate.getTime())) {
      throw new AppError('Invalid reservation date/time format', 400);
    }

    const parsedPartySize = Number(party_size);
    if (Number.isNaN(parsedPartySize) || parsedPartySize <= 0) {
      throw new AppError('party_size must be a positive number', 400);
    }

    // If optional auth token exists and is valid, this will be a logged-in reservation.
    const userId = req.user?.id ? String(req.user.id) : null;

    const savedReservation = await reservationService.createReservation({
      user_id: userId,
      reservation_time: reservationDateTime,
      guest_count: parsedPartySize,
      guest_name,
      guest_phone,
      notes: notes ?? null,
    });

    res.status(201).json({
      success: true,
      message: 'Reservation created successfully',
      data: savedReservation,
      error: null,
    });
  } catch (err) {
    if (err instanceof AppError && err.statusCode === 400) {
      res.status(400).json({
        success: false,
        message: err.message,
        data: null,
        error: err.message,
      });
      return;
    }

    console.error('Error creating storefront reservation:', err);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      data: null,
      error: 'Failed to create reservation',
    });
  }
};
