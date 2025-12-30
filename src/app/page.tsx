import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { LoginForm } from '@/components/auth/login-form'

export default async function Home({
    searchParams,
}: {
    searchParams: Promise<{ error?: string }>
}) {
    const session = await auth()

    if (session) {
        redirect('/learner-dashboard')
    }

    const { error } = await searchParams

    return (
        <div className="min-h-screen grid lg:grid-cols-2 overflow-hidden relative">
            {/* Abstract Background Shapes - Removed for subtle theme */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none lg:hidden">
                {/* Mobile background only if needed */}
            </div>

            {/* Left Content */}
            <div className="flex flex-col items-center justify-center relative p-8 lg:p-20 z-10">
                <div className="text-center lg:text-left max-w-2xl">
                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-pink-300 via-purple-300 to-indigo-300 drop-shadow-lg">
                        Start learning with <br /> Learning Hub
                    </h1>
                </div>

                <div className="absolute bottom-8 text-black/40 dark:text-white/40 text-sm">
                    © 2025 Learning Hub. All rights reserved.
                </div>
            </div>

            {/* Right Content - Login Form */}
            <div className="flex items-center justify-center bg-gray-50 dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 p-8 lg:p-20 z-10 shadow-inner">
                <LoginForm
                    errorId={error}
                    errorRedirectPath="/"
                />
            </div>
        </div>
    )
}
