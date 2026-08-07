import {
  communityValues,
  propertyStatusValues,
  propertyTypeValues,
  provinceValues,
} from '../dtos/property.dto';
import {
  amenityValues,
  bookingModalityValues,
  roomStatusValues,
  roomTypeValues,
} from '../dtos/room.dto';
import { reservationStatusValues } from '../dtos/reservation.dto';
import type { AuthenticatedRequest } from '../types/express';
import type { Response } from 'express';

export class CatalogController {
  async list(_req: AuthenticatedRequest, res: Response): Promise<void> {
    res.status(200).json({
      success: true,
      data: {
        provinces: provinceValues,
        communities: communityValues,
        propertyTypes: propertyTypeValues,
        propertyStatuses: propertyStatusValues,
        roomTypes: roomTypeValues,
        roomStatuses: roomStatusValues,
        bookingModalities: bookingModalityValues,
        amenities: amenityValues,
        reservationStatuses: reservationStatusValues,
      },
    });
  }
}

export const catalogController = new CatalogController();
