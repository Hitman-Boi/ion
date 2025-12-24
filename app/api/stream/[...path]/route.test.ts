import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from '@/app/api/stream/[...path]/route';
import { NextRequest } from 'next/server';
import * as fsPromises from 'fs/promises';
import * as fs from 'fs';
import { Readable } from 'stream';

vi.mock('fs/promises', () => ({
    stat: vi.fn(),
}));

vi.mock('fs', () => ({
    createReadStream: vi.fn(),
    statSync: vi.fn(),
}));

describe('Stream API', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should stream full file content', async () => {
        (fsPromises.stat as any).mockResolvedValue({ size: 100 });
        (fs.createReadStream as any).mockReturnValue(Readable.from(['content']));

        const request = new NextRequest('http://localhost/api/stream/1/video.mp4');
        const response = await GET(request, { params: { path: ['1', 'video.mp4'] } });

        expect(response.status).toBe(200);
        expect(response.headers.get('Content-Length')).toBe('100');
    });

    it('should handle range requests', async () => {
        (fsPromises.stat as any).mockResolvedValue({ size: 100 });
        (fs.createReadStream as any).mockReturnValue(Readable.from(['partial']));

        const request = new NextRequest('http://localhost/api/stream/1/video.mp4', {
            headers: { Range: 'bytes=0-49' },
        });
        const response = await GET(request, { params: { path: ['1', 'video.mp4'] } });

        expect(response.status).toBe(206);
        expect(response.headers.get('Content-Range')).toBe('bytes 0-49/100');
        expect(response.headers.get('Content-Length')).toBe('50');
    });

    it('should return 404 if file not found', async () => {
        (fsPromises.stat as any).mockRejectedValue(new Error('File not found'));

        const request = new NextRequest('http://localhost/api/stream/1/missing.mp4');
        const response = await GET(request, { params: { path: ['1', 'missing.mp4'] } });

        expect(response.status).toBe(404);
    });
});
