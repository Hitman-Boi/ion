import { PrismaClient } from '@prisma/client';

// Test-specific Prisma client
export const testPrisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.TEST_DATABASE_URL,
    },
  },
});