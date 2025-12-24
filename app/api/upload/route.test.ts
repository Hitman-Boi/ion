import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/upload/route';
import { NextRequest, NextResponse } from 'next/server';
import * as fs from 'fs/promises';

vi.mock('fs/promises', () => ({
    writeFile: vi.fn(),
    mkdir: vi.fn(),
}));

vi.mock('uuid', () => ({
    v4: () => 'mock-uuid',
}));

describe('Upload API', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should upload a file successfully', async () => {
        const formData = new FormData();
        const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });
        formData.append('file', file);
        formData.append('courseId', '1');

        const request = new NextRequest('http://localhost/api/upload', {
            method: 'POST',
            body: formData,
        });

        const response = await POST(request);
        const data = await response.json();

        expect(data.success).toBe(true);
        expect(data.filePath).toBe('/1/mock-uuid.pdf');
        expect(fs.mkdir).toHaveBeenCalled();
        expect(fs.writeFile).toHaveBeenCalled();
    });

    it('should return error if no file uploaded', async () => {
        const formData = new FormData();
        formData.append('courseId', '1');

        const request = new NextRequest('http://localhost/api/upload', {
            method: 'POST',
            body: formData,
        });

        const response = await POST(request);
        expect(response.status).toBe(400);
    });

    it('should return error for unsupported file type', async () => {
        const formData = new FormData();
        const file = new File(['content'], 'test.txt', { type: 'text/plain' });
        formData.append('file', file);
        formData.append('courseId', '1');

        const request = new NextRequest('http://localhost/api/upload', {
            method: 'POST',
            body: formData,
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toContain('Unsupported file type');
    });
});
