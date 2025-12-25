import { describe, expect, it, vi, beforeAll, afterAll } from 'vitest';
import { GET } from './route';
import { auth } from '@/auth';
import { NextRequest } from 'next/server';
import fs from 'fs';
import path from 'path';

vi.mock('@/auth', () => ({ auth: vi.fn() }));

describe('GET /api/files/[...path]', () => {
    const uploadDir = path.join(process.cwd(), 'uploads');
    const fileName = 'test-file.png';
    const filePath = path.join(uploadDir, fileName);
    const fileContent = 'A'.repeat(1000);

    beforeAll(() => {
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        fs.writeFileSync(filePath, fileContent);
    });

    afterAll(() => {
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    });

    it('returns 401 if unauthorized', async () => {
        vi.mocked(auth).mockResolvedValue(null as any);
        const req = new NextRequest(`http://localhost/api/files/${fileName}`);
        const res = await GET(req, { params: { path: [fileName] } });
        expect(res.status).toBe(401);
    });

    it('serves file with 200', async () => {
        vi.mocked(auth).mockResolvedValue({ user: { id: 'u1' } } as any);

        const req = new NextRequest(`http://localhost/api/files/${fileName}`);
        const res = await GET(req, { params: { path: [fileName] } });

        expect(res.status).toBe(200);
        expect(res.headers.get('Content-Length')).toBe('1000');
        await res.text(); // Consume stream
    });

    it('serves partial content with 206', async () => {
        vi.mocked(auth).mockResolvedValue({ user: { id: 'u1' } } as any);

        const req = new NextRequest(`http://localhost/api/files/${fileName}`, {
            headers: { 'range': 'bytes=0-499' }
        });
        const res = await GET(req, { params: { path: [fileName] } });

        expect(res.status).toBe(206);
        expect(res.headers.get('Content-Range')).toBe('bytes 0-499/1000');
        await res.text(); // Consume stream
    });

    it('returns 404 if file not found', async () => {
        vi.mocked(auth).mockResolvedValue({ user: { id: 'u1' } } as any);
        const req = new NextRequest('http://localhost/api/files/non-existent.png');
        const res = await GET(req, { params: { path: ['non-existent.png'] } });
        expect(res.status).toBe(404);
    });
});
