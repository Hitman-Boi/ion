/** @type {import('next').NextConfig} */
const nextConfig = {
    // Only use standalone output for Docker production builds
    // For E2E testing and local dev, use the regular Next.js server
    ...(process.env.BUILD_STANDALONE === 'true' && { output: 'standalone' }),
    async rewrites() {
        // Use internal Docker URL by default if not specified
        const POSTHOG_HOST = process.env.POSTHOG_INTERNAL_API_URL || "http://posthog:8000";

        return [
            {
                source: "/ingest/:path*",
                destination: `${POSTHOG_HOST}/:path*`,
            },
            {
                source: "/ingest/static/:path*",
                destination: `${POSTHOG_HOST}/static/:path*`,
            },
        ];
    },
};

module.exports = nextConfig;
