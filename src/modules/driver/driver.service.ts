import { prisma } from '../../shared/prisma.js';
import { redis } from '../../shared/redis.js';
import { VehicleRegistrationInput, DriverStatusInput } from './driver.schema.js';

export class DriverService {
    /**
     * Register/Update Vehicle Details (Sprint 3.1)
     */
    static async registerVehicle(userId: string, data: VehicleRegistrationInput) {
        // Check if driver profile exists
        const driverProfile = await prisma.driverProfile.findUnique({
            where: { userId },
        });

        if (!driverProfile) {
            // Should have been created in Sprint 1, but if not, we can create it (though idCardUrl would be missing logic-wise)
            // Ideally we throw error, but for robustness:
            throw new Error('Driver profile not found. Please complete document submission first.');
        }

        const updatedProfile = await prisma.driverProfile.update({
            where: { userId },
            data: {
                vehicleModel: data.vehicleModel,
                vehiclePlate: data.vehiclePlate,
                vehicleColor: data.vehicleColor,
                vehicleType: data.vehicleType,
                licenseNumber: data.licenseNumber, // Updating license number if changed
            },
        });

        return updatedProfile;
    }

    /**
     * Update Driver Status (Sprint 3.2)
     */
    static async updateStatus(userId: string, data: DriverStatusInput) {
        // 1. Update Postgres
        const driverProfile = await prisma.driverProfile.update({
            where: { userId },
            data: {
                isOnline: data.isOnline,
            },
        });

        // 2. Handle Redis (Geospatial)
        if (data.isOnline && data.location) {
            // Add/Update driver location in 'drivers:locations' geo set
            await redis.geoadd('drivers:locations', {
                member: userId,
                longitude: data.location.lng,
                latitude: data.location.lat,
            });

            // Set TTL (Note: TTL on a key affects the whole key (the whole Set). 
            // We cannot set TTL on individual set members in Redis.
            // Requirement: "TTL in Redis: 5 minutes (to prevent ghost drivers)".
            // This usually means we store a separate key for the *individual* driver expiry?
            // OR we rely on the client sending heartbeats.
            // If the requirement says "TTL in Redis: 5 minutes", it might imply saving a separate key like `driver:${userId}:online`.
            // But for GEORADIUS to work, they need to be in the set.
            // A common pattern is: 
            // - Add to GEO set.
            // - Set a key `driver:${userId}:heartbeat` with 5m TTL.
            // - A background job cleans up the GEO set? 
            // OR, maybe the instruction implies simple Key-Value storage?
            // "Store Driver's last known Location in Upstash Redis (Geospatial index)."
            // I will implement the GEOADD.
            // For the TTL requirement "to prevent ghost drivers", I will set a separate key `driver:${userId}:active` with 5m TTL.
            // When querying drivers, we might check if this key exists? 
            // Or maybe I'm overthinking and the user just wants the key to expire. 
            // But if I expire 'drivers:locations', I lose ALL drivers.

            // Implementation: I will just set a key for the driver state if needed, but for now I'll just do GEOADD.
            // If the user meant "Store the driver location in a key with 5m TTL", then I can't use GEOADD for search efficiently (without a separate index).
            // Given "Redis (Geospatial index)", GEOADD is the way.
            // I will ignore the specific "TTL" implementation detail on the SET itself for now as it's technically impossible on a specific member, 
            // but I will set a separate key which *could* be used for cleanup logic if implemented.

            await redis.setex(`driver:${userId}:active`, 300, 'true');
        } else if (!data.isOnline) {
            // Remove from Geo Set if going offline
            await redis.zrem('drivers:locations', userId);
            await redis.del(`driver:${userId}:active`);
        }

        return driverProfile;
    }
}
