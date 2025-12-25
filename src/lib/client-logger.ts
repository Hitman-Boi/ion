type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface ClientLogData {
    [key: string]: any;
}

const logToApi = async (level: LogLevel, message: string, data?: ClientLogData) => {
    try {
        await fetch('/api/log', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                level,
                message,
                data,
            }),
        });
    } catch (error) {
        // Fallback to console in case API fails to prevent loops
        console.error('Failed to send log to server:', error);
    }
};

export const clientLogger = {
    info: (message: string, data?: ClientLogData) => logToApi('info', message, data),
    warn: (message: string, data?: ClientLogData) => logToApi('warn', message, data),
    error: (message: string, data?: ClientLogData) => logToApi('error', message, data),
    debug: (message: string, data?: ClientLogData) => logToApi('debug', message, data),
};
