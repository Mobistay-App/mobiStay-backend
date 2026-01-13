import { prisma } from '../../shared/prisma.js';
import { RequestRideInput } from './ride.schema.js';

export class RideService {
    /**
     * Request a Ride (Passenger)
     */
    static async requestRide(passengerId: string, data: RequestRideInput) {
        // 1. Create Ride Record
        const ride = await prisma.ride.create({
            data: {
                passengerId,
                pickupAddress: data.pickupAddress,
                pickupLat: data.pickupLat,
                pickupLng: data.pickupLng,
                dropoffAddress: data.dropoffAddress,
                dropoffLat: data.dropoffLat,
                dropoffLng: data.dropoffLng,
                status: 'REQUESTED'
            }
        });

        // 2. emit event to nearby drivers (Future / Real-time)
        // For now, we just save the record.
        // Conceptually: await redis.geoRadius(..., drivers) -> notify(drivers)

        return ride;
    }

    /**
     * Accept a Ride (Driver)
     */
    static async acceptRide(driverUserId: string, rideId: string) {
        // 1. Check if user is a valid driver
        const driverProfile = await prisma.driverProfile.findUnique({
            where: { userId: driverUserId }
        });

        if (!driverProfile) {
            throw new Error('User is not a registered driver');
        }

        // 2. Transaction to assign ride atomically
        return await prisma.$transaction(async (tx) => {
            const ride = await tx.ride.findUnique({ where: { id: rideId } });

            if (!ride) throw new Error('Ride not found');
            if (ride.status !== 'REQUESTED') throw new Error('Ride is no longer available');

            const updatedRide = await tx.ride.update({
                where: { id: rideId },
                data: {
                    status: 'ACCEPTED',
                    driverId: driverProfile.id // Linking to DriverProfile ID, NOT userId
                }
            });

            return updatedRide;
        });
    }

    /**
     * Update Ride Status (Driver)
     */
    static async updateStatus(driverUserId: string, rideId: string, status: 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED') {
        // Verify driver owns this ride
        const driverProfile = await prisma.driverProfile.findUnique({ where: { userId: driverUserId } });
        if (!driverProfile) throw new Error('Not a driver');

        const ride = await prisma.ride.findUnique({ where: { id: rideId } });
        if (!ride) throw new Error('Ride not found');

        if (ride.driverId !== driverProfile.id) {
            throw new Error('Unauthorized: You are not the driver for this ride');
        }

        // Update
        let updateData: any = { status };

        // If completed, calculate fare (Mock logic for now)
        if (status === 'COMPLETED') {
            // Mock Fare: Base 500 + 100 per unit distance
            const dist = Math.sqrt(
                Math.pow(ride.dropoffLat - ride.pickupLat, 2) +
                Math.pow(ride.dropoffLng - ride.pickupLng, 2)
            ) * 111; // Approx km
            updateData.fare = Math.round(500 + (dist * 100));
        }

        return await prisma.ride.update({
            where: { id: rideId },
            data: updateData
        });
    }

    /**
     * Get Current Ride (Passenger or Driver)
     */
    static async getActiveRide(userId: string, role: string) {
        if (role === 'DRIVER') {
            const driver = await prisma.driverProfile.findUnique({ where: { userId } });
            if (!driver) return null;

            return await prisma.ride.findFirst({
                where: {
                    driverId: driver.id,
                    status: { in: ['ACCEPTED', 'IN_PROGRESS'] }
                },
                include: { passenger: { select: { firstName: true, phone: true } } }
            });
        } else {
            return await prisma.ride.findFirst({
                where: {
                    passengerId: userId,
                    status: { in: ['REQUESTED', 'ACCEPTED', 'IN_PROGRESS'] }
                },
                include: { driver: { include: { user: { select: { firstName: true, phone: true } } } } }
            });
        }
    }
}
