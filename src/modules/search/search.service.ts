import { prisma } from '../../shared/prisma.js';
import { redis } from '../../shared/redis.js';
import { SearchQueryInput } from './search.schema.js';

export class SearchService {
    /**
     * Unified Search API (Sprint 5.1)
     */
    static async search(query: SearchQueryInput) {
        if (query.type === 'stay') {
            return await this.searchStays(query);
        } else if (query.type === 'move') {
            return await this.searchDrivers(query);
        }
    }

    /**
     * Search Properties (Stays)
     */
    private static async searchStays(query: SearchQueryInput) {
        const whereClause: any = {
            isActive: true,
            // Implicit: we usually want verified owners, but current schema puts isVerified on User, not Property. 
            // We can filter by owner.isVerified if needed, but let's assume active properties are vetted.
            // Requirement says: "Return properties where isActive: true and isVerified: true" (which likely implies Owner is verified)
            owner: {
                isVerified: true
            }
        };

        if (query.city) {
            whereClause.city = query.city;
        }

        if (query.priceMin !== undefined || query.priceMax !== undefined) {
            whereClause.pricePerNight = {};
            if (query.priceMin !== undefined) whereClause.pricePerNight.gte = query.priceMin;
            if (query.priceMax !== undefined) whereClause.pricePerNight.lte = query.priceMax;
        }

        const properties = await prisma.property.findMany({
            where: whereClause,
            include: {
                owner: {
                    select: {
                        firstName: true,
                        avatarUrl: true,
                        isVerified: true,
                    }
                }
            },
            take: 50, // Limit results
        });

        return properties;
    }

    /**
     * Search Drivers (Move)
     */
    private static async searchDrivers(query: SearchQueryInput) {
        if (!query.lat || !query.lng) {
            throw new Error('Latitude and Longitude are required for searching drivers.');
        }

        // 1. Get Driver IDs from Redis Geospatial Index
        // Note: Upstash/Redis 'georadius' returns members within radius.
        // Input lat/lng, radius in km.
        // Input lat/lng, radius in km.
        // Using any cast to bypass strict typing if method name varies (georadius vs geoRadius)
        const driverIds = await (redis as any).georadius(
            'drivers:locations',
            query.lng,
            query.lat,
            query.radius,
            'km'
        ) as string[];

        if (!driverIds || driverIds.length === 0) {
            return [];
        }

        // 2. Fetch Driver Details from Postgres for these IDs
        // We filter by implicit logic: DriverProfile exists and User is Verified (though Redis should only contain online verified drivers)
        const drivers = await prisma.driverProfile.findMany({
            where: {
                userId: {
                    in: driverIds as string[],
                },
                user: {
                    isVerified: true, // Double check
                },
                isOnline: true // Double check
            },
            include: {
                user: {
                    select: {
                        firstName: true,
                        lastName: true,
                        avatarUrl: true,
                        isVerified: true,
                        // Rating/Reviews would go here
                    }
                }
            }
        });

        return drivers;
    }
}
