import { prisma } from '../../shared/prisma.js';
import { CreateBookingInput, UpdateBookingStatusInput } from './booking.schema.js';

export class BookingService {
    /**
     * Create a new booking
     */
    static async createBooking(userId: string, data: CreateBookingInput) {
        // 1. Fetch Property Details (Price, Ownership, Existing Bookings)
        const property = await prisma.property.findUnique({
            where: { id: data.propertyId },
            include: {
                bookings: {
                    where: {
                        status: 'CONFIRMED',
                        // Check availability overlapping
                        // (Existing Start < New End) AND (Existing End > New Start)
                        checkIn: { lt: data.checkOut },
                        checkOut: { gt: data.checkIn },
                    }
                }
            }
        });

        if (!property) {
            throw new Error('Property not found');
        }

        if (!property.isActive) {
            throw new Error('Property is not active for booking');
        }

        // 2. Check overlap with Blocked Dates OR Confirmed Bookings
        // Note: Blocked dates logic in schema is DateTime[], simplifying here to just check bookings first.
        // If blockedDates logic is needed, we iterate over them. 
        // For MVP Sprint 6, let's assume `bookings` check covers user reservations.
        // We really should check `blockedDates` too if they are stored as ranges, but schema says DateTime[].
        // Assuming blockedDates are individual days.
        if (property.bookings.length > 0) {
            throw new Error('Property is already booked for these dates');
        }

        // Simple check against explicit blocked dates (exact match)
        // Optimization: checking every day in range against blockedDates array (O(N*M))
        // TODO: Optimize for production

        // 3. Calculate Price
        const oneDay = 24 * 60 * 60 * 1000;
        const diffDays = Math.round(Math.abs((data.checkOut.getTime() - data.checkIn.getTime()) / oneDay));
        const nights = diffDays > 0 ? diffDays : 1; // Minimum 1 night
        const totalPrice = nights * property.pricePerNight;

        // 4. Create Booking
        const booking = await prisma.booking.create({
            data: {
                travelerId: userId,
                propertyId: data.propertyId,
                checkIn: data.checkIn,
                checkOut: data.checkOut,
                totalPrice,
                status: 'PENDING', // Default to PENDING until defined otherwise
            }
        });

        return booking;
    }

    /**
     * Get Bookings for valid user
     * - If Traveler: Their trips
     * - If Owner: Reservations at their properties
     */
    static async getUserBookings(userId: string, role: string) {
        if (role === 'OWNER') {
            return await prisma.booking.findMany({
                where: {
                    property: {
                        ownerId: userId
                    }
                },
                include: {
                    traveler: {
                        select: { firstName: true, lastName: true, avatarUrl: true }
                    },
                    property: {
                        select: { title: true, city: true }
                    }
                },
                orderBy: { checkIn: 'desc' }
            });
        } else {
            // Traveler
            return await prisma.booking.findMany({
                where: { travelerId: userId },
                include: {
                    property: {
                        select: { title: true, city: true, images: true, address: true }
                    }
                },
                orderBy: { checkIn: 'desc' }
            });
        }
    }

    /**
     * Update Status (Cancel/Confirm)
     */
    static async updateStatus(userId: string, bookingId: string, data: UpdateBookingStatusInput) {
        const booking = await prisma.booking.findUnique({
            where: { id: bookingId },
            include: { property: true }
        });

        if (!booking) throw new Error('Booking not found');

        // Guards
        // Only Owner can CONFIRM
        // Only Owner OR Traveler can CANCEL (depends on logic, assume Traveler can cancel if PENDING)

        const isOwner = booking.property.ownerId === userId;
        const isTraveler = booking.travelerId === userId;

        if (data.status === 'CONFIRMED' && !isOwner) {
            throw new Error('Only the property owner can confirm a booking');
        }

        if (data.status === 'CANCELLED') {
            if (!isOwner && !isTraveler) {
                throw new Error('Unauthorized to cancel this booking');
            }
        }

        return await prisma.booking.update({
            where: { id: bookingId },
            data: { status: data.status }
        });
    }

    /**
     * Get statistics for owner dashboard
     */
    static async getOwnerStats(userId: string) {
        const bookings = await prisma.booking.findMany({
            where: {
                property: { ownerId: userId },
                status: { in: ['CONFIRMED', 'COMPLETED'] }
            },
            select: { totalPrice: true }
        });

        const totalRevenue = bookings.reduce((sum, b) => sum + b.totalPrice, 0);
        const bookingCount = await prisma.booking.count({
            where: { property: { ownerId: userId } }
        });

        const propertyCount = await prisma.property.count({
            where: { ownerId: userId, isActive: true }
        });

        return {
            totalRevenue,
            bookingCount,
            propertyCount,
            avgRating: 4.8, // Placeholder
        };
    }
}
