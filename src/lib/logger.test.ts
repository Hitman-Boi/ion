import { describe, it, expect, vi, afterEach } from 'vitest';
import { logger } from './logger';

// Mock process.stdout.write to capture logs
const stdoutSpy = vi.spyOn(process.stdout, 'write').mockImplementation(() => true);

describe('Logger', () => {
    afterEach(() => {
        vi.clearAllMocks();
    });

    it('should log info messages and output JSON', () => {
        logger.info('test message');
        expect(stdoutSpy).toHaveBeenCalled();
        const logOutput = JSON.parse(stdoutSpy.mock.calls[0][0] as string);
        expect(logOutput.msg).toBe('test message');
        expect(logOutput.level).toBe(30); // Info level is 30 in Pino
    });

    it('should redact sensitive information', () => {
        const sensitivity = { password: 'secretpassword', user: { password: 'userpassword' } };
        logger.info(sensitivity, 'sensitive data');

        expect(stdoutSpy).toHaveBeenCalled();
        const logOutput = JSON.parse(stdoutSpy.mock.calls[0][0] as string);
        expect(logOutput.password).toBe('[Redacted]');
        expect(logOutput.user.password).toBe('[Redacted]');
    });
});
