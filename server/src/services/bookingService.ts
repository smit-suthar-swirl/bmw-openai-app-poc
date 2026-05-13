import type { BookingRequest, BookingConfirmation } from '@bmw-ai/shared';
import { bookingRepository } from '../repositories/bookingRepository.js';
import { vehicleRepository } from '../repositories/vehicleRepository.js';
import { dealerRepository } from '../repositories/dealerRepository.js';

export class BookingService {
  async create(req: BookingRequest): Promise<BookingConfirmation> {
    // Resolve vehicle by name
    const vehicle = await vehicleRepository.findByName(req.vehicleName);
    if (!vehicle) {
      throw new Error(
        `Vehicle not found: "${req.vehicleName}". Try "BMW M4", "X5", "i4", or "i7".`
      );
    }

    // Resolve dealer by city (take first match)
    const dealers = await dealerRepository.findByCity(req.dealerCity);
    if (dealers.length === 0) {
      throw new Error(
        `No BMW showroom found in "${req.dealerCity}". Available cities: Dubai, Abu Dhabi, Sharjah.`
      );
    }
    const dealer = dealers[0];

    // Validate preferred date is in the future
    const preferredDate = new Date(req.preferredDate);
    if (isNaN(preferredDate.getTime())) {
      throw new Error('Invalid date format. Please provide a valid date (e.g. "2025-08-15").');
    }
    if (preferredDate < new Date()) {
      throw new Error('Preferred date must be in the future.');
    }

    const { id, reference } = await bookingRepository.create({
      firstName: req.firstName,
      lastName: req.lastName,
      email: req.email,
      phone: req.phone,
      vehicleId: vehicle.id,
      dealerId: dealer.id,
      preferredDate,
      notes: req.notes,
      userId: req.userId,
    });

    return {
      id,
      reference,
      firstName: req.firstName,
      lastName: req.lastName,
      email: req.email,
      phone: req.phone,
      vehicle,
      dealer,
      preferredDate: preferredDate.toISOString(),
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
  }

  async getByEmail(email: string) {
    return bookingRepository.findByEmail(email);
  }
}

export const bookingService = new BookingService();
