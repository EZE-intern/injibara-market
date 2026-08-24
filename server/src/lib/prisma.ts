import 'dotenv/config';
import pkg from '@prisma/client';
const { PrismaClient } = pkg;
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

// Create the Prisma 7 MariaDB/MySQL adapter using the DATABASE_URL string
const adapter = new PrismaMariaDb(process.env.DATABASE_URL as string);

// Export the client
export const prisma = new PrismaClient({ adapter });
