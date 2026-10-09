import { PrismaTiDBCloud } from '@tidbcloud/prisma-adapter';
import { PrismaClient } from '@prisma/client';

let cachedPrisma: PrismaClient | null = null;
let cachedUrl: string | null = null;

export function getPrisma(databaseUrl: string): PrismaClient {
  if (!cachedPrisma || cachedUrl !== databaseUrl) {
    const adapter = new PrismaTiDBCloud({ url: databaseUrl });
    cachedPrisma = new PrismaClient({ adapter });
    cachedUrl = databaseUrl;
  }
  return cachedPrisma;
}
