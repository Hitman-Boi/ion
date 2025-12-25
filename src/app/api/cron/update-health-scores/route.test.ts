import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { POST } from './route';
import { NextRequest } from 'next/server';
import { updateAllCompletionRates, recalculateAllHealthScores, deprecateRottingCourses } from '@/app/actions/health-score.actions';

vi.mock('@/app/actions/health-score.actions', () => ({
    updateAllCompletionRates: vi.fn(),
    recalculateAllHealthScores: vi.fn(),
    deprecateRottingCourses: vi.fn(),
}));

describe('POST /api/cron/update-health-scores', () => {
    const originalEnv = process.env;

    beforeEach(() => {
        vi.clearAllMocks();
        process.env = { ...originalEnv };
        process.env.CRON_SECRET = 'secret123';
    });

    afterEach(() => {
        process.env = originalEnv;
    });

    it('returns 401 if unauthorized', async () => {
        const req = new NextRequest('http://localhost/api/cron', {
            headers: { 'Authorization': 'Bearer wrong' }
        });
        const res = await POST(req);
        expect(res.status).toBe(401);
    });

    it('returns 500 if secret not set', async () => {
        delete process.env.CRON_SECRET;
        const req = new NextRequest('http://localhost/api/cron');
        const res = await POST(req);
        expect(res.status).toBe(500);
    });

    it('runs maintenance tasks', async () => {
        vi.mocked(updateAllCompletionRates).mockResolvedValue({ updated: 1, errors: [] });
        vi.mocked(recalculateAllHealthScores).mockResolvedValue({ updated: 1, errors: [] });
        vi.mocked(deprecateRottingCourses).mockResolvedValue({ deprecated: 0, courseIds: [] });

        const req = new NextRequest('http://localhost/api/cron', {
            headers: { 'Authorization': 'Bearer secret123' }
        });

        const res = await POST(req);
        const json = await res.json();

        expect(res.status).toBe(200);
        expect(json.success).toBe(true);
        expect(updateAllCompletionRates).toHaveBeenCalled();
        expect(recalculateAllHealthScores).toHaveBeenCalled();
        expect(deprecateRottingCourses).toHaveBeenCalled();
    });
});
