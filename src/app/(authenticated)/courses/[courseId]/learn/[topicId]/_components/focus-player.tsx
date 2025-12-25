'use client'

import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import { AnalyticsEvents } from "@/lib/analytics-events";
import { ChevronLeft, ChevronRight, FileText, CheckCircle } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { UserProgress } from '@prisma/client'
import { VideoPlayer } from '@/components/player/video-player'
import { QuizInterface } from '@/components/player/quiz-interface'
import { ProgressRing } from '@/components/common/progress-ring'
import { markPdfComplete } from '@/app/actions/progress.actions'
import { toast } from 'sonner'
import { ContentFlagButton } from '@/components/player/content-flag-button'
import { CourseCompletionModal } from '@/components/course/course-completion-modal'
import { checkUserCourseCompletion } from '@/app/actions/course-completion.actions'

interface FocusPlayerProps {
    topic: any // Full topic with resources
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

    // Derived Atoms
    const videoResource = topic.resources.find((r: any) => r.type === 'VIDEO')
    const pdfResource = topic.resources.find((r: any) => r.type === 'PDF')
    const quizResource = topic.resources.find((r: any) => r.type === 'QUIZ')

    // Atomic State
    const videoCompleted = userProgress?.videoCompleted || false
    const pdfCompleted = userProgress?.pdfCompleted || false
    const quizPassed = userProgress?.quizPassed || false

    // Course Completion Modal State
    const [showCompletionModal, setShowCompletionModal] = useState(false)
    const [courseTitle, setCourseTitle] = useState("")

    // Check for course completion when progress changes
    useEffect(() => {
        const checkCompletion = async () => {
            // Only check if this topic is now complete
            const isTopicComplete = userProgress?.isTopicComplete
            if (!isTopicComplete) return

            try {
                // Call server action directly
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

    const handleMarkPdfRead = async () => {
        if (!pdfResource) return
        try {
            await markPdfComplete(topic.id)
            router.refresh()
            toast.success("Marked as read")
        } catch (e) {
            console.error(e)
            toast.error("Failed to update progress")
        }
    }

    return (
        <div className="h-[calc(100vh-64px)] w-full flex bg-[#0f1115] text-white overflow-hidden">
            {/* Main Content Area: Split 70/30 */}
            <div className="flex-1 flex flex-col md:flex-row h-full">

                {/* ZONE A: Video Player (Left/Top) */}
                <div className={cn("flex-1 bg-black relative flex flex-col justify-center border-r border-white/10")}>
                    {/* Navigation Overlay (Top Left) */}
                    <div className="absolute top-4 left-4 z-20 flex gap-2">
                        <Button variant="ghost" size="icon" className="bg-black/50 hover:bg-black/70 text-white rounded-full h-10 w-10" onClick={() => router.push(`/courses/${courseId}${previewQuery ? '' : ''}`)}>
                            <ChevronLeft className="w-5 h-5" />
                        </Button>
                    </div>

                    {/* Flag Button (Top Right) */}
                    <div className="absolute top-4 right-4 z-20">
                        <ContentFlagButton courseId={courseId} />
                    </div>

                    {videoResource ? (
                        <div className="w-full h-full flex items-center justify-center bg-black">
                            <VideoPlayer
                                url={videoResource.contentUrl}
                                topicId={topic.id}
                            />
                        </div>
                    ) : (
                        <div className="text-gray-500 h-full flex items-center justify-center">No Video for this topic</div>
                    )}

                    {/* Navigation Bar (Bottom) */}
                    <div className="h-16 flex-shrink-0 bg-[#0f1115] border-t border-white/10 flex items-center justify-between px-6">
                        <Button
                            variant="ghost"
                            disabled={!prevTopicId}
                            onClick={() => prevTopicId && router.push(`/courses/${courseId}/learn/${prevTopicId}${previewQuery}`)}
                            className="text-gray-400 hover:text-white"
                        >
                            <ChevronLeft className="w-4 h-4 mr-2" /> Previous Topic
                        </Button>

                        <div className="flex items-center gap-4">
                            {/* Progress Ring in the Player Control Bar? Or in the Sidebar?
                                PRD: "Visual Progress Ring... The sidebar navigation shows..."
                                But for Focus Mode "Remove top header...".
                                Let's put it in the sidebar header for visibility.
                             */}
                        </div>

                        <Button
                            variant="ghost"
                            disabled={!nextTopicId}
                            onClick={() => nextTopicId && router.push(`/courses/${courseId}/learn/${nextTopicId}${previewQuery}`)}
                            className="text-gray-400 hover:text-white"
                        >
                            Next Topic <ChevronRight className="w-4 h-4 ml-2" />
                        </Button>
                    </div>
                </div>

                {/* ZONE B: Resources / Knowledge Check (Right Side) */}
                <div className="w-full md:w-[450px] flex flex-col bg-[#16181d]">
                    <div className="p-6 border-b border-white/10 bg-[#16181d]">
                        <div className="flex justify-between items-start mb-2">
                            <h2 className="font-bold text-xl leading-tight text-white mb-2">{topic.title}</h2>
                            <ProgressRing
                                videoCompleted={videoCompleted}
                                pdfCompleted={pdfCompleted}
                                quizPassed={quizPassed}
                            />
                        </div>
                        <p className="text-sm text-gray-500 line-clamp-2">{topic.description}</p>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        <Tabs defaultValue="materials" className="w-full">
                            <TabsList className="w-full grid grid-cols-2 bg-transparent border-b border-white/10 rounded-none h-14 p-0">
                                <TabsTrigger
                                    value="materials"
                                    className="h-full rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-white/5 data-[state=active]:text-white text-gray-400"
                                >
                                    Materials
                                </TabsTrigger>
                                <TabsTrigger
                                    value="quiz"
                                    className="h-full rounded-none border-b-2 border-transparent data-[state=active]:border-green-500 data-[state=active]:bg-white/5 data-[state=active]:text-white text-gray-400"
                                >
                                    Quiz
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="materials" className="p-6 space-y-6">
                                {/* PDF Material Card */}
                                {pdfResource ? (
                                    <div className="group relative">
                                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <div className="relative p-5 bg-[#1e2025] rounded-xl border border-white/10 hover:border-white/20 transition-all">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-blue-500/20 rounded-lg">
                                                        <FileText className="w-5 h-5 text-blue-400" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-medium text-white text-sm">Review PDF</h4>
                                                        <p className="text-xs text-gray-500 mt-1">Supplementary Material</p>
                                                    </div>
                                                </div>
                                                {pdfCompleted && <CheckCircle className="w-5 h-5 text-green-500" />}
                                            </div>

                                            <div className="flex gap-3">
                                                <a href={pdfResource.contentUrl} target="_blank" rel="noopener noreferrer" className="flex-1">
                                                    <Button variant="outline" size="sm" className="w-full bg-white/5 border-white/10 hover:bg-white/10 hover:text-white">
                                                        Open Resource
                                                    </Button>
                                                </a>
                                                {!pdfCompleted && (
                                                    <Button size="sm" onClick={handleMarkPdfRead} variant="secondary" className="bg-blue-600 hover:bg-blue-700 text-white border-none">
                                                        Mark Done
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-10 text-gray-500 border border-dashed border-white/10 rounded-xl">
                                        No PDF materials available.
                                    </div>
                                )}
                            </TabsContent>

                            <TabsContent value="quiz" className="p-0">
                                {quizResource ? (
                                    <div className="p-6">
                                        {/* Embed Quiz Interface */}
                                        {/* Assuming quizData has structure questions: [] */}
                                        <QuizInterface
                                            topicId={topic.id}
                                            questions={(quizResource.quizData as any)?.questions || []}
                                        />
                                    </div>
                                ) : (
                                    <div className="p-12 text-center">
                                        <div className="p-4 bg-white/5 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                                            <CheckCircle className="w-8 h-8 text-gray-600" />
                                        </div>
                                        <h3 className="text-lg font-medium text-white mb-2">No Quiz Required</h3>
                                        <p className="text-gray-500 text-sm">You&apos;ve mastered this topic! Continue to the next one.</p>
                                    </div>
                                )}
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </div>

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
