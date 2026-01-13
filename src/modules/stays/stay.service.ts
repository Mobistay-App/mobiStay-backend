import { prisma } from '../../shared/prisma.js';
import { CreatePropertyInput, UpdateAvailabilityInput } from './stay.schema.js';

export class StayService {
    /**
     * Create a new property listing
     */
    static async createProperty(ownerId: string, data: CreatePropertyInput) {
        const property = await prisma.property.create({
            data: {
                ownerId,
                title: data.title,
                description: data.description,
                address: data.address,
                city: data.city,
                pricePerNight: data.pricePerNight,
                amenities: data.amenities,
                images: data.images,
                // Default isActive is true
            },
        });

        return property;
    }

    /**
     * Update property availability (blocked dates and active status)
     */
    static async updateAvailability(propertyId: string, ownerId: string, data: UpdateAvailabilityInput) {
        // Verify ownership
        const property = await prisma.property.findUnique({
            where: { id: propertyId },
        });

        if (!property) {
            throw new Error('Property not found');
        }

        if (property.ownerId !== ownerId) {
            throw new Error('Unauthorized: You do not own this property');
        }

        // Prepare update data
        const updateData: any = {};
        if (data.isActive !== undefined) updateData.isActive = data.isActive;
        if (data.blockedDates) {
            updateData.blockedDates = data.blockedDates.map(dateStr => new Date(dateStr));
        }

        const updatedProperty = await prisma.property.update({
            where: { id: propertyId },
            data: updateData,
        });

        return updatedProperty;
    }

    /**
     * Get all properties for an owner
     */
    static async getOwnerProperties(ownerId: string) {
        return await prisma.property.findMany({
            where: { ownerId },
            orderBy: { createdAt: 'desc' },
        });
    }

    /**
     * Get all active properties for travelers
     */
    static async getAllProperties(city?: string) {
        return await prisma.property.findMany({
            where: {
                isActive: true,
                ...(city && { city: city as any }),
            },
            orderBy: { createdAt: 'desc' },
        });
    }
}
