require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  try {
    console.log('--- DB Check ---');
    const properties = await prisma.property.findMany({
      include: { owner: true }
    });
    console.log('Count:', properties.length);
    properties.forEach(p => {
      console.log(`- ${p.title} (Active: ${p.isActive}) Images: ${p.images.length}`);
    });
  } catch (e) {
    console.error(e);
  } finally {
    process.exit();
  }
}

check();
