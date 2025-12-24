import { PostHog } from 'posthog-node'

export default function PostHogClient() {
    const posthogClient = new PostHog(
        process.env.NEXT_PUBLIC_POSTHOG_CLIENT_API_KEY!,
        {
            host: process.env.POSTHOG_INTERNAL_API_URL || process.env.NEXT_PUBLIC_POSTHOG_HOST,
            flushAt: 1,
            flushInterval: 0
        }
    )
    return posthogClient
}



// Helper to track server-side if needed (though most will be client-side)
export async function trackServerEvent(userId: string, event: string, properties: any = {}) {
    const client = PostHogClient()
    client.capture({
        distinctId: userId,
        event,
        properties
    })
    await client.shutdown()
}
