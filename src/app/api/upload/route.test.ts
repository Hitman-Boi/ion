import { describe, expect, it, vi, afterEach } from 'vitest';
import { POST } from './route';
import { auth } from '@/auth';
import { NextRequest } from 'next/server';
import fs from 'fs';
import path from 'path';

vi.mock('@/auth', () => ({ auth: vi.fn() }));
// Don't mock fs/promises or fs.
vi.mock('uuid', () => ({ v4: () => 'test-uuid-123' }));

describe('POST /api/upload', () => {
    const uploadDir = path.join(process.cwd(), 'uploads');
    const filePath = path.join(uploadDir, 'test-uuid-123.png');

    afterEach(() => {
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    });

    it('returns 401 if unauthorized', async () => {
        vi.mocked(auth).mockResolvedValue(null as any);
        const req = new NextRequest('http://localhost:3000/api/upload', {
            method: 'POST',
        });
        const res = await POST(req);
        expect(res.status).toBe(401);
    });

    it('returns 400 if no file', async () => {
        vi.mocked(auth).mockResolvedValue({ user: { id: 'u1' } } as any);
        const req = new NextRequest('http://localhost:3000/api/upload', {
            method: 'POST',
        });

        req.formData = vi.fn().mockResolvedValue({
            get: (key: string) => null
        });

        const res = await POST(req);
        expect(res.status).toBe(400);
    });

    it('uploads file successfully', async () => {
        vi.mocked(auth).mockResolvedValue({ user: { id: 'u1' } } as any);

        const req = new NextRequest('http://localhost:3000/api/upload', {
            method: 'POST',
        });

        const fileContent = 'test-content';
        const file = new File([fileContent], 'test.png', { type: 'image/png' });
        // @ts-ignore
        file.arrayBuffer = vi.fn().mockResolvedValue(Buffer.from(fileContent));

        req.formData = vi.fn().mockResolvedValue({
            get: (key: string) => key === 'file' ? file : null
        });

        const res = await POST(req);
        const json = await res.json();

        expect(res.status).toBe(200);
        expect(json.url).toContain('test-uuid-123.png');

        // Verify real file existence
        expect(fs.existsSync(filePath)).toBe(true);
        expect(fs.readFileSync(filePath, 'utf-8')).toBe(fileContent);
    });
});
