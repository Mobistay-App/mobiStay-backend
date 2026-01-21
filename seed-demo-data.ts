
import { prisma } from './src/shared/prisma.js';
import bcrypt from 'bcryptjs';

async function main() {
    console.log('🚀 Starting Database Seeding...');

    // 1. Create a Demo Owner
    const hashedPass = await bcrypt.hash('password123', 10);
    const owner = await prisma.user.upsert({
        where: { email: 'owner@mobistay.com' },
        update: {},
        create: {
            email: 'owner@mobistay.com',
            firstName: 'Mobi',
            lastName: 'Stay',
            password: hashedPass,
            role: 'OWNER',
            isVerified: true,
            idStatus: 'APPROVED'
        }
    });

    console.log(`✅ Owner Created: ${owner.email}`);

    // Create Owner Profile
    await prisma.ownerProfile.upsert({
        where: { userId: owner.id },
        update: {},
        create: {
            userId: owner.id,
            idCardUrl: 'uploads/property-fallback.png'
        }
    });

    // 2. Create Sample Properties
    const properties = [
        {
            title: 'Modern Luxury Apartment',
            description: 'Beautiful 2-bedroom apartment with city views in Bastos.',
            city: 'Yaounde',
            address: 'Rue de Bastos, Yaounde',
            pricePerNight: 45000,
            type: 'APARTMENT',
            isActive: true,
            images: ['uploads/property-fallback.png']
        },
        {
            title: 'Cozy Studio Douala',
            description: 'Perfect for business travelers, located in the heart of Akwa.',
            city: 'Douala',
            address: 'Akwa, Douala',
            pricePerNight: 25000,
            type: 'STUDIO',
            isActive: true,
            images: ['uploads/property-fallback.png']
        },
        {
            title: 'Prime Villa Kribi',
            description: 'Stunning villa just minutes away from the beach.',
            city: 'Kribi',
            address: 'Beachfront Road, Kribi',
            pricePerNight: 75000,
            type: 'VILLA',
            isActive: true,
            images: ['uploads/property-fallback.png']
        }
    ];

    for (const p of properties) {
        await prisma.property.create({
            data: {
                ...p,
                ownerId: owner.id
            }
        });
        console.log(`🏠 Property Created: ${p.title}`);
    }

    console.log('✨ Seeding Completed Successfully!');
}

main()
    .catch(e => {
        console.error('❌ Seeding Failed:', e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
