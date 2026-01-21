
import { prisma } from './src/shared/prisma';

async function main() {
    const imagesInUploads = [
        'uploads/1768464387642-11bc350e-22e5-405f-89d6-7c41fe6219c5.jpeg',
        'uploads/1768472018126-dd3b5e68-6278-4d8e-8574-050ece7eb7f1.png'
    ];

    console.log('🔧 Fixing image paths for all properties...');
    const properties = await prisma.property.findMany();

    for (const p of properties) {
        // Assign one of the valid images to each property so we can test if they show up
        // We pick one based on the property index
        const index = properties.indexOf(p) % imagesInUploads.length;
        const validImage = imagesInUploads[index];

        await prisma.property.update({
            where: { id: p.id },
            data: {
                images: [validImage],
                isActive: true
            }
        });
    }

    console.log('✅ Done! All properties now have valid image paths relative to /uploads/');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
