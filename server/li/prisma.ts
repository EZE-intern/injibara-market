import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: ['error', 'warn'],
});

// Test real connection when the server starts
async function testDb() {
  try {
    console.log('🔄 Testing database connection...');
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Database is working:', result);
  } catch (error) {
    console.error('❌ Database connection FAILED:');
    console.error(error);
  }
}

testDb();

export { prisma };
export default prisma;
