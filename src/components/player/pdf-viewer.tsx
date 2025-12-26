'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { ChevronRight, FileText, CheckCircle, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PdfViewerProps {
    url: string
    onComplete: () => void
    isCompleted?: boolean
}

// Minimum time (in seconds) user must view the PDF before they can continue
const MIN_READING_TIME = 30

export function PdfViewer({ url, onComplete, isCompleted = false }: PdfViewerProps) {
    const [timeViewed, setTimeViewed] = useState(0)
    const [isActive, setIsActive] = useState(true)

    // Track viewing time
    useEffect(() => {
        if (isCompleted) return

        const interval = setInterval(() => {
            if (isActive) {
                setTimeViewed((prev) => prev + 1)
            }
        }, 1000)

        return () => clearInterval(interval)
    }, [isActive, isCompleted])

    // Pause timer when window is not focused
    useEffect(() => {
        const handleVisibilityChange = () => {
            setIsActive(!document.hidden)
        }

        const handleFocus = () => setIsActive(true)
        const handleBlur = () => setIsActive(false)

        document.addEventListener('visibilitychange', handleVisibilityChange)
        window.addEventListener('focus', handleFocus)
        window.addEventListener('blur', handleBlur)

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange)
            window.removeEventListener('focus', handleFocus)
            window.removeEventListener('blur', handleBlur)
        }
    }, [])

    const progress = Math.min((timeViewed / MIN_READING_TIME) * 100, 100)
    const canContinue = timeViewed >= MIN_READING_TIME
    const remainingTime = Math.max(MIN_READING_TIME - timeViewed, 0)

    return (
        <div className="w-full h-full flex flex-col relative">
            {/* Toolbar */}
            <div className="shrink-0 flex items-center justify-between px-4 py-2 bg-white/5 border-b border-white/10 rounded-t-2xl">
                <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-400" />
                    <span className="text-sm text-gray-300">PDF Document</span>
                </div>

                {/* Reading progress indicator */}
                {!isCompleted && !canContinue && (
                    <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span className="text-xs text-gray-500">
                            {remainingTime}s remaining
                        </span>
                    </div>
                )}
            </div>

            {/* PDF Content via iframe */}
            <div className="flex-1 relative bg-gray-900/50">
                <iframe
                    src={`${url}#toolbar=1&navpanes=0&scrollbar=1`}
                    className="w-full h-full border-0"
                    title="PDF Document"
                />
            </div>

            {/* Progress bar at bottom - shows reading progress */}
            {!isCompleted && !canContinue && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-800">
                    <div
                        className="h-full bg-emerald-500 transition-all duration-1000 ease-linear"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            )}

            {/* Continue Button - appears after minimum reading time */}
            <div
                className={cn(
                    "absolute bottom-4 left-1/2 -translate-x-1/2 transition-all duration-300 z-20",
                    canContinue && !isCompleted
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 translate-y-4 pointer-events-none"
                )}
            >
                <Button
                    onClick={onComplete}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 h-auto text-base font-medium shadow-lg shadow-emerald-500/25"
                >
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Continue
                    <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
            </div>
        </div>
    )
}
