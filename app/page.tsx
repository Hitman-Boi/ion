import { auth } from '@/auth'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function Home() {
    const session = await auth()

    if (session) {
        redirect('/dashboard')
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center overflow-hidden relative">
            {/* Abstract Background Shapes - Removed for subtle theme */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                {/* Subtle grid or pattern could go here if needed, but keeping it clean for now */}
            </div>

            <div className="z-10 text-center px-4 max-w-4xl mx-auto">
                <h1 className="text-6xl md:text-8xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-pink-300 via-purple-300 to-indigo-300 drop-shadow-lg">
                    Level Up <br /> Your Skills
                </h1>

                <p className="text-xl md:text-2xl text-gray-200 mb-12 max-w-2xl mx-auto leading-relaxed">
                    Unlock your potential with our curated courses. <br />
                    <span className="font-semibold text-purple-200">Join the community today.</span>
                </p>

                <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                    <Link
                        href="/login"
                        className="group relative px-8 py-4 bg-white text-purple-900 font-bold text-xl rounded-full shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 hover:-translate-y-1 overflow-hidden"
                    >
                        <span className="relative z-10">Get Started Now</span>
                        <div className="absolute inset-0 h-full w-full scale-0 rounded-full transition-all duration-300 group-hover:scale-100 group-hover:bg-purple-100/30"></div>
                    </Link>

                    <Link
                        href="/courses"
                        className="px-8 py-4 bg-transparent border-2 border-white/20 text-white font-semibold text-xl rounded-full hover:bg-white/10 transition-all duration-300 backdrop-blur-sm"
                    >
                        Browse Catalog
                    </Link>
                </div>
            </div>

            {/* Footer-like element */}
            <div className="absolute bottom-8 text-white/40 text-sm">
                © 2024 Learning Hub. All rights reserved.
            </div>
        </div>
    )
}
