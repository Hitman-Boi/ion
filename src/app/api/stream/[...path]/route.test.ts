import { describe, expect, it, vi, beforeEach, beforeAll, afterAll } from 'vitest';
import { GET } from './route';
import { auth } from '@/auth';
import { NextRequest } from 'next/server';
import fs from 'fs';
import path from 'path';

vi.mock('@/auth', () => ({ auth: vi.fn() }));

describe('GET /api/stream/[...path]', () => {
    // Route uses UPLOAD_DIR or default. 
    // We can assume it uses 'antigravity_data/uploads' relative to cwd if env not set
    // Or set env?
    const uploadDir = path.join(process.cwd(), 'antigravity_data', 'uploads', 'c1');
    const fileName = 'v1.mp4';
    const filePath = path.join(uploadDir, fileName);
    const fileContent = 'A'.repeat(2000);

    beforeAll(() => {
        process.env.UPLOAD_DIR = path.join(process.cwd(), 'antigravity_data', 'uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        fs.writeFileSync(filePath, fileContent);
    });

    afterAll(() => {
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
        // Cleanup dir?
        // fs.rmSync(path.join(process.cwd(), 'antigravity_data'), { recursive: true, force: true });
    });

    it('returns 401 if unauthorized', async () => {
        vi.mocked(auth).mockResolvedValue(null as any);
        const req = new NextRequest(`http://localhost/api/stream/c1/${fileName}`);
        const res = await GET(req, { params: { path: ['c1', fileName] } });
        expect(res.status).toBe(401);
    });

    it('returns 400 for invalid path', async () => {
        vi.mocked(auth).mockResolvedValue({ user: { id: 'u1' } } as any);
        const req = new NextRequest('http://localhost/api/stream/c1');
        const res = await GET(req, { params: { path: ['c1'] } });
        expect(res.status).toBe(400);
    });

    it('serves file if auth', async () => {
        vi.mocked(auth).mockResolvedValue({ user: { id: 'u1' } } as any);

        const req = new NextRequest(`http://localhost/api/stream/c1/${fileName}`);
        const res = await GET(req, { params: { path: ['c1', fileName] } });

        expect(res.status).toBe(200);
        expect(res.headers.get('Content-Length')).toBe('2000');
        await res.text(); // Consume stream
    });

    it('serves 206 for range', async () => {
        vi.mocked(auth).mockResolvedValue({ user: { id: 'u1' } } as any);

        const req = new NextRequest(`http://localhost/api/stream/c1/${fileName}`, {
            headers: { 'range': 'bytes=0-99' }
        });
        const res = await GET(req, { params: { path: ['c1', fileName] } });

        expect(res.status).toBe(206);
        expect(res.headers.get('Content-Range')).toBe('bytes 0-99/2000');
        await res.text(); // Consume stream
    });
});
