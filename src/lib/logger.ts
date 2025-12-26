import pino from 'pino';

// Configuration for development environment (pretty printing)
// Don't use pretty printing in test mode as it interferes with JSON parsing in tests
const isDev = process.env.NODE_ENV === 'development' && process.env.VITEST !== 'true';

export const logger = pino({
    level: process.env.LOG_LEVEL || 'info', // Default to 'info' if not set
    base: {
        env: process.env.NODE_ENV,
    },
    transport: isDev
        ? {
            target: 'pino-pretty',
            options: {
                colorize: true,
                ignore: 'pid,hostname', // Clean up dev logs
                translateTime: 'HH:MM:ss Z',
            },
        }
        : undefined,
    redact: {
        paths: [
            'req.headers.authorization',
            'req.headers.cookie',
            'user.password',
            'password',
            '*.password',
            '*.secret',
        ],
        remove: true, // or censor: '[Redacted]'
        censor: '[Redacted]',
    },
    // Ensure timestamps are included in a standard format if needed, but pino defaults are usually fine (epoch)
    timestamp: pino.stdTimeFunctions.isoTime,
});
