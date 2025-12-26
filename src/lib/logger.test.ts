import { describe, it, expect } from 'vitest';
import pino from 'pino';
import { PassThrough } from 'stream';

describe('Logger', () => {
    it('should log info messages and output JSON', async () => {
        // Create a writable stream to capture output
        const stream = new PassThrough();
        const chunks: Buffer[] = [];
        stream.on('data', (chunk) => chunks.push(chunk));

        // Create a test logger instance that writes to our stream
        const testLogger = pino({
            level: 'info',
        }, stream);

        testLogger.info('test message');

        // Wait for stream to flush
        await new Promise((resolve) => setTimeout(resolve, 50));

        const output = Buffer.concat(chunks).toString();
        const logOutput = JSON.parse(output);

        expect(logOutput.msg).toBe('test message');
        expect(logOutput.level).toBe(30); // Info level is 30 in Pino
    });

    it('should redact sensitive information when configured', async () => {
        // Create a writable stream to capture output
        const stream = new PassThrough();
        const chunks: Buffer[] = [];
        stream.on('data', (chunk) => chunks.push(chunk));

        // Create a test logger with redaction config
        const testLogger = pino({
            level: 'info',
            redact: {
                paths: ['password', 'user.password', '*.password'],
                censor: '[Redacted]',
            },
        }, stream);

        const sensitivity = { password: 'secretpassword', user: { password: 'userpassword' } };
        testLogger.info(sensitivity, 'sensitive data');

        // Wait for stream to flush
        await new Promise((resolve) => setTimeout(resolve, 50));

        const output = Buffer.concat(chunks).toString();
        const logOutput = JSON.parse(output);

        expect(logOutput.password).toBe('[Redacted]');
        expect(logOutput.user.password).toBe('[Redacted]');
    });
});
