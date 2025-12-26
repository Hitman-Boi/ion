'use client'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ChevronLeft, ChevronRight, Home, Loader2 } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect, useCallback, useMemo } from 'react'
import { TopicResource, UserProgress } from '@prisma/client'
import { ContentFlagButton } from '@/components/player/content-flag-button'
import { CourseCompletionModal } from '@/components/course/course-completion-modal'
import { checkUserCourseCompletion } from '@/app/actions/course-completion.actions'
import { markVideoComplete, markPdfComplete } from '@/app/actions/progress.actions'
import { ResourceRenderer } from './resource-renderer'
import { toast } from 'sonner'

interface FocusPlayerProps {
    topic: {
        id: string
        title: string
        description: string | null
        resources: TopicResource[]
    }
    courseId: string
    nextTopicId?: string
    prevTopicId?: string
    userProgress: UserProgress | null
}

export function FocusPlayer({ topic, courseId, nextTopicId, prevTopicId, userProgress }: FocusPlayerProps) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const isPreview = searchParams.get('preview') === 'true'
    const previewQuery = isPreview ? '?preview=true' : ''

    // Sort resources by sortOrder
    const sortedResources = useMemo(() =>
        [...topic.resources].sort((a, b) => a.sortOrder - b.sortOrder),
        [topic.resources]
    )

    // Determine which resources are completed
    const getResourceCompletionStatus = useCallback((resource: TopicResource): boolean => {
        if (!userProgress) return false
        switch (resource.type) {
            case 'VIDEO': return userProgress.videoCompleted
            case 'PDF': return userProgress.pdfCompleted
            case 'QUIZ': return userProgress.quizPassed
            default: return false
        }
    }, [userProgress])

    // Find the first incomplete resource, or the last resource if all complete
    const findCurrentResourceIndex = useCallback(() => {
        const firstIncompleteIndex = sortedResources.findIndex(r => !getResourceCompletionStatus(r))
        return firstIncompleteIndex === -1 ? sortedResources.length - 1 : firstIncompleteIndex
    }, [sortedResources, getResourceCompletionStatus])

    const [currentResourceIndex, setCurrentResourceIndex] = useState(findCurrentResourceIndex)
    const [isLoading, setIsLoading] = useState(false)

    // Update current index when progress changes
    useEffect(() => {
        setCurrentResourceIndex(findCurrentResourceIndex())
    }, [findCurrentResourceIndex])

    // Current resource
    const currentResource = sortedResources[currentResourceIndex]
    const isCurrentCompleted = currentResource ? getResourceCompletionStatus(currentResource) : false
    const totalResources = sortedResources.length

    // Calculate progress percentage for slider
    const progressPercentage = totalResources > 1
        ? (currentResourceIndex / (totalResources - 1)) * 100
        : 100

    // Course Completion Modal State
    const [showCompletionModal, setShowCompletionModal] = useState(false)
    const [courseTitle, setCourseTitle] = useState("")

    // Check for course completion when topic is fully complete
    useEffect(() => {
        const checkCompletion = async () => {
            if (!userProgress?.isTopicComplete) return

            try {
                const result = await checkUserCourseCompletion(courseId)
                if (result.isComplete && !result.hasReviewed) {
                    setCourseTitle(result.courseTitle || "this course")
                    setShowCompletionModal(true)
                }
            } catch (error) {
                console.error("Failed to check course completion:", error)
            }
        }

        checkCompletion()
    }, [userProgress?.isTopicComplete, courseId])

    // Handle resource completion
    const handleResourceComplete = async () => {
        if (!currentResource) return

        setIsLoading(true)
        try {
            // Mark the resource as complete based on type
            if (currentResource.type === 'VIDEO') {
                await markVideoComplete(topic.id)
            } else if (currentResource.type === 'PDF') {
                await markPdfComplete(topic.id)
            }
            // QUIZ completion is handled by QuizInterface internally

            router.refresh()

            // Auto-advance to next resource after a short delay
            if (currentResourceIndex < totalResources - 1) {
                setTimeout(() => {
                    setCurrentResourceIndex(prev => prev + 1)
                }, 500)
            } else if (nextTopicId) {
                // Redirect to next topic when current topic is complete
                toast.success("Topic completed! Moving to next topic...")
                setTimeout(() => {
                    router.push(`/courses/${courseId}/topic/${nextTopicId}${previewQuery}`)
                }, 5000)
            } else {
                // No more topics - course may be complete
                toast.success("Topic completed!")
            }
        } catch (error) {
            console.error("Failed to mark resource complete:", error)
            toast.error("Failed to save progress")
        } finally {
            setIsLoading(false)
        }
    }

    // Keyboard navigation - only for topics, not resources
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return

            switch (e.key) {
                case '[':
                    if (prevTopicId) router.push(`/courses/${courseId}/topic/${prevTopicId}${previewQuery}`)
                    break
                case ']':
                    if (nextTopicId) router.push(`/courses/${courseId}/topic/${nextTopicId}${previewQuery}`)
                    break
            }
        }

        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [prevTopicId, nextTopicId, courseId, previewQuery, router])

    // No resources state
    if (sortedResources.length === 0) {
        return (
            <div className="h-full w-full flex items-center justify-center bg-[#0f1115] text-white">
                <div className="text-center">
                    <h2 className="text-xl font-semibold mb-2">No content available</h2>
                    <p className="text-gray-500">This topic has no resources yet.</p>
                    <Button variant="ghost" className="mt-4" onClick={() => router.push(`/courses/${courseId}`)}>
                        <Home className="w-4 h-4 mr-2" />
                        Back to Course
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="h-full w-full flex flex-col bg-[#0f1115] text-white overflow-hidden">
            {/* Top Navigation Bar */}
            <header className="h-14 shrink-0 flex items-center justify-between px-4 border-b border-white/10 bg-[#0f1115]">
                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-gray-400 hover:text-white hover:bg-white/10 rounded-full"
                        onClick={() => router.push(`/courses/${courseId}`)}
                    >
                        <Home className="w-5 h-5" />
                    </Button>
                    <h1 className="text-sm font-medium text-white truncate max-w-[300px]">{topic.title}</h1>
                </div>

                <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-400">
                        {currentResourceIndex + 1} / {totalResources}
                    </span>
                    <ContentFlagButton courseId={courseId} />
                </div>
            </header>

            {/* Main Content Area - Fill remaining space */}
            <main className="flex-1 min-h-0 overflow-hidden flex items-center justify-center p-4">
                {isLoading ? (
                    <div className="flex items-center gap-3 text-gray-400">
                        <Loader2 className="w-6 h-6 animate-spin" />
                        Saving progress...
                    </div>
                ) : currentResource ? (
                    <ResourceRenderer
                        resource={currentResource}
                        topicId={topic.id}
                        isCompleted={isCurrentCompleted}
                        onComplete={handleResourceComplete}
                    />
                ) : null}
            </main>

            {/* Bottom Navigation Footer - Single Line */}
            <footer className="shrink-0 border-t border-white/10 bg-[#0f1115] px-6 py-3">
                <div className="flex items-center gap-4">
                    {/* Previous Topic Button with Keyboard Hint */}
                    <div className="flex items-center gap-2 shrink-0">
                        <Button
                            variant="ghost"
                            disabled={!prevTopicId}
                            onClick={() => prevTopicId && router.push(`/courses/${courseId}/topic/${prevTopicId}${previewQuery}`)}
                            className="text-gray-400 hover:text-white"
                        >
                            <ChevronLeft className="w-4 h-4 mr-1" />
                            Previous Topic
                        </Button>
                        <span className="text-xs text-gray-600 flex items-center">
                            <kbd className="px-1.5 py-0.5 bg-white/5 rounded border border-white/10 mr-1">[</kbd>
                        </span>
                    </div>

                    {/* Step Progress Indicator - Circles connected by lines */}
                    <div className="flex-1 flex items-center justify-center mx-4">
                        {sortedResources.map((resource, idx) => {
                            const isCompleted = getResourceCompletionStatus(resource)
                            const isCurrent = idx === currentResourceIndex
                            const isBeforeCurrent = idx < currentResourceIndex

                            // Resource type label
                            const typeLabel = resource.type === 'VIDEO' ? 'Video'
                                : resource.type === 'PDF' ? 'PDF'
                                    : resource.type === 'QUIZ' ? 'Quiz'
                                        : resource.type

                            return (
                                <div key={idx} className="flex items-center">
                                    {/* Connection line (before circle, except first) */}
                                    {idx > 0 && (
                                        <div
                                            className={cn(
                                                "h-0.5 w-8 sm:w-12 md:w-16 transition-colors",
                                                isBeforeCurrent || (isCurrent && isCompleted)
                                                    ? "bg-emerald-500"
                                                    : "bg-gray-500"
                                            )}
                                        />
                                    )}

                                    {/* Step Circle with Label */}
                                    <div className="flex flex-col items-center">
                                        <div
                                            className={cn(
                                                "w-5 h-5 rounded-full flex items-center justify-center transition-all shrink-0",
                                                isCompleted
                                                    ? "bg-emerald-500"
                                                    : isCurrent
                                                        ? "border-2 border-emerald-500 bg-transparent"
                                                        : "bg-gray-500"
                                            )}
                                        >
                                            {isCurrent && !isCompleted && (
                                                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                            )}
                                        </div>
                                        {/* Resource Type Label */}
                                        <span className={cn(
                                            "text-xs mt-1 whitespace-nowrap",
                                            isCurrent ? "text-emerald-400 font-medium" : "text-gray-500"
                                        )}>
                                            {typeLabel}
                                        </span>
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    {/* Next Topic Button with Keyboard Hint */}
                    <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs text-gray-600 flex items-center">
                            <kbd className="px-1.5 py-0.5 bg-white/5 rounded border border-white/10 mr-1">]</kbd>
                        </span>
                        <Button
                            variant="ghost"
                            disabled={!nextTopicId}
                            onClick={() => nextTopicId && router.push(`/courses/${courseId}/topic/${nextTopicId}${previewQuery}`)}
                            className="text-gray-400 hover:text-white"
                        >
                            Next Topic
                            <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                    </div>
                </div>
            </footer>

            {/* Course Completion Modal */}
            <CourseCompletionModal
                isOpen={showCompletionModal}
                onClose={() => setShowCompletionModal(false)}
                courseId={courseId}
                courseTitle={courseTitle}
            />
        </div>
    )
}
