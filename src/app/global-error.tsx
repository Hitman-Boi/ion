'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error(error)
    }, [error])

    return (
        <html lang="en" className="dark">
            <body className={inter.className}>
                <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
                    <div className="text-center space-y-6 max-w-md mx-auto">
                        <div className="flex justify-center">
                            <div className="bg-red-100 dark:bg-red-900/30 p-4 rounded-full">
                                <AlertCircle className="w-12 h-12 text-red-600 dark:text-red-500" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl text-gray-900 dark:text-gray-100">
                                Something went wrong!
                            </h1>
                            <p className="text-muted-foreground text-gray-500 dark:text-gray-400">
                                A critical system error occurred. We apologize for the inconvenience.
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button
                                onClick={() => reset()}
                                variant="default"
                                className="w-full sm:w-auto"
                            >
                                Try again
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => window.location.href = '/learner-dashboard'}
                                className="w-full sm:w-auto"
                            >
                                Return to Dashboard
                            </Button>
                        </div>

                        {process.env.NODE_ENV === 'development' && (
                            <div className="mt-8 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg text-left overflow-auto max-w-full max-h-64 text-xs font-mono">
                                <p className="font-bold text-red-500 mb-2">Error Details (Dev Only):</p>
                                <p>{error.message}</p>
                                {error.digest && <p className="mt-1 text-gray-500">Digest: {error.digest}</p>}
                            </div>
                        )}
                    </div>
                </div>
            </body>
        </html>
    )
}
