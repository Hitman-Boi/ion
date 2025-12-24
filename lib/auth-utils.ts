import { NextResponse } from 'next/server';
import { auth } from '@/auth';

export function withAuth(handler: Function, method: string = 'GET') {
    return async (request: any, context: any) => {
        const session = await auth();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        return handler(request, context);
    };
}
