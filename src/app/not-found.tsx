import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
            <h1 className="text-6xl font-bold mb-4">404</h1>
            <h2 className="text-2xl font-semibold mb-2">Page Not Found</h2>
            <p className="text-muted-foreground mb-8 text-center max-w-md">
                The page you&apos;re looking for doesn&apos;t exist or has been moved.
            </p>
            <Button asChild>
                <Link href="/learner-dashboard">Return to Dashboard</Link>
            </Button>
        </div>
    )
}
