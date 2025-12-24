'use client'

import { signIn } from 'next-auth/react'

export default function LoginPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
            <div className="w-full max-w-md p-8 space-y-8 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 shadow-xl">
                <div className="text-center">
                    <h2 className="text-3xl font-bold tracking-tight">Welcome Back</h2>
                    <p className="mt-2 text-sm text-gray-400">
                        Sign in to your account to continue
                    </p>
                </div>

                <div className="mt-8 space-y-4">
                    <button
                        onClick={() => signIn('azure-ad', { callbackUrl: '/dashboard' })}
                        className="w-full flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-[#0078D4] hover:bg-[#006cbd] transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0078D4] focus:ring-offset-slate-900"
                    >
                        <svg className="w-5 h-5 mr-3" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M10.5 0L0 0L0 10.5L10.5 10.5L10.5 0Z" fill="#F25022" />
                            <path d="M21 0L10.5 0L10.5 10.5L21 10.5L21 0Z" fill="#7FBA00" />
                            <path d="M10.5 10.5L0 10.5L0 21L10.5 21L10.5 10.5Z" fill="#00A4EF" />
                            <path d="M21 10.5L10.5 10.5L10.5 21L21 21L21 10.5Z" fill="#FFB900" />
                        </svg>
                        Login with Microsoft
                    </button>
                </div>
            </div>
        </div>
    )
}
