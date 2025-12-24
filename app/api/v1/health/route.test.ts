import { describe, it, expect, vi } from 'vitest';
import { GET } from '@/app/api/v1/health/route';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

vi.mock('@/lib/prisma', () => ({
    prisma: {
        $queryRaw: vi.fn(),
    },
}));

describe('GET /api/v1/health', () => {
    it('should return healthy status when database is connected', async () => {
        (prisma.$queryRaw as any).mockResolvedValue([1]);

        const response = await GET();
        const data = await response.json();

        expect(data.status).toBe('healthy');
        expect(data.checks.database).toBe(true);
    });

    it('should return unhealthy status when database connection fails', async () => {
        (prisma.$queryRaw as any).mockRejectedValue(new Error('DB Error'));

        const response = await GET();
        const data = await response.json();

        expect(response.status).toBe(503);
        expect(data.status).toBe('unhealthy');
        expect(data.error).toBe('database_connection_failed');
    });
});
