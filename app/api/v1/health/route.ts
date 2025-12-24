import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Database connection check
    await prisma.$queryRaw`SELECT 1`;

    return NextResponse.json({
      status: 'healthy',
      checks: {
        database: true,
      },
      timestamp: new Date()
    });
  } catch (error) {
    return NextResponse.json({
      status: 'unhealthy',
      error: 'database_connection_failed',
      detail: 'Failed to connect to database'
    }, { status: 503 });
  }
}