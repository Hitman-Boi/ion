import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { level, message, data } = body;

        // Validate level
        const validLevels = ['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'];
        const logLevel = validLevels.includes(level) ? level : 'info';

        // Get requestId from headers if available (passed from middleware? or client?)
        // Middleware passes `x-request-id` in request headers.
        const requestId = req.headers.get('x-request-id');

        const logData = {
            ...data,
            source: 'client',
            requestId,
        };

        // Log using server logger
        // @ts-ignore
        logger[logLevel](logData, message);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to ingest client log", error);
        return NextResponse.json({ success: false }, { status: 500 });
    }
}
