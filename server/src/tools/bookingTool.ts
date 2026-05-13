import type { BookingConfirmation } from '@bmw-ai/shared';
import { bookingService } from '../services/bookingService.js';

export const bookingToolDefinition = {
  name: 'book_test_drive',
  description:
    'Book a BMW test drive at an authorized UAE showroom. Collects customer details and preferred vehicle, dealer city, and date. Returns a booking confirmation reference. Use for "Book a test drive for BMW i4", "Schedule test drive BMW X5 Dubai".',
  inputSchema: {
    type: 'object' as const,
    properties: {
      firstName: { type: 'string', description: 'Customer first name' },
      lastName: { type: 'string', description: 'Customer last name' },
      email: { type: 'string', description: 'Customer email address' },
      phone: { type: 'string', description: 'Customer phone number (with country code, e.g. +971-55-123-4567)' },
      vehicleName: {
        type: 'string',
        description: 'BMW model for the test drive (e.g., "BMW i4", "BMW X5", "BMW M4")',
      },
      dealerCity: {
        type: 'string',
        enum: ['Dubai', 'Abu Dhabi', 'Sharjah'],
        description: 'City of the preferred BMW showroom',
      },
      preferredDate: {
        type: 'string',
        description: 'Preferred test drive date in ISO format (e.g., "2025-08-20")',
      },
      notes: {
        type: 'string',
        description: 'Optional additional notes or requests',
      },
    },
    required: ['firstName', 'lastName', 'email', 'phone', 'vehicleName', 'dealerCity', 'preferredDate'],
  },
};

export function formatBookingConfirmation(confirmation: BookingConfirmation): string {
  return [
    `✅ Test Drive Booking Confirmed!`,
    ``,
    `Reference:  ${confirmation.reference}`,
    `Customer:   ${confirmation.firstName} ${confirmation.lastName}`,
    `Vehicle:    ${confirmation.vehicle.name}`,
    `Showroom:   ${confirmation.dealer.name}`,
    `Address:    ${confirmation.dealer.address}`,
    `Date:       ${new Date(confirmation.preferredDate).toLocaleDateString('en-AE', { dateStyle: 'long' })}`,
    `Status:     ${confirmation.status.charAt(0).toUpperCase() + confirmation.status.slice(1)}`,
    ``,
    `A confirmation will be sent to ${confirmation.email}.`,
    `Contact ${confirmation.dealer.phone} if you need to reschedule.`,
  ].join('\n');
}

export async function executeBookingTool(params: {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  vehicleName: string;
  dealerCity: string;
  preferredDate: string;
  notes?: string;
}) {
  const confirmation = await bookingService.create(params);
  const textSummary = formatBookingConfirmation(confirmation);

  return {
    content: [
      { type: 'text' as const, text: textSummary },
      { type: 'text' as const, text: JSON.stringify({ type: 'booking_confirmation', booking: confirmation }) },
    ],
    confirmation,
  };
}
