
import { prisma } from './src/shared/prisma';

async function main() {
    const imagesInUploads = [
        'uploads/1769021891539-8f90e617-1a25-4831-8cc0-4cabf02761d2.jpeg',
        'uploads/1769021891929-08ed7bbe-12c0-4e21-9467-473294062119.jpeg',
        'uploads/1769021892188-dd29ea37-1979-41ee-b499-cbe2394953d0.jpeg',
        'uploads/1768673511538-a5bdf96b-4941-4a2c-a294-1c8c7df8cbae.jpeg'
    ];

    console.log('🔧 Fixing image paths for all properties...');
    const properties = await prisma.property.findMany();

    for (const p of properties) {
        // Assign a subset of valid images to each property so we can test if they show up
        // Cycle through images based on ID or index
        const startIndex = properties.indexOf(p) % imagesInUploads.length;
        // Take 1 or 2 images
        const selectedImages = [
            imagesInUploads[startIndex],
            imagesInUploads[(startIndex + 1) % imagesInUploads.length]
        ];

        await prisma.property.update({
            where: { id: p.id },
            data: {
                images: selectedImages,
                isActive: true
            }
        });
        console.log(`Updated property ${p.title} with images:`, selectedImages);
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
