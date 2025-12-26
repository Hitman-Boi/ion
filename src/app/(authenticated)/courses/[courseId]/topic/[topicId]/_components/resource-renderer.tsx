'use client'

import { Button } from '@/components/ui/button'
import { VideoPlayer } from '@/components/player/video-player'
import { PdfViewer } from '@/components/player/pdf-viewer'
import { QuizInterface } from '@/components/player/quiz-interface'
import { FileText, CheckCircle, ExternalLink } from 'lucide-react'
import { TopicResource } from '@prisma/client'

interface ResourceRendererProps {
    resource: TopicResource & { quizData?: { questions: unknown[] } | null }
    topicId: string
    isCompleted: boolean
    onComplete: () => void
}

export function ResourceRenderer({ resource, topicId, isCompleted, onComplete }: ResourceRendererProps) {
    // Common wrapper that fills the space uniformly
    const Wrapper = ({ children, maxWidth = "max-w-5xl" }: { children: React.ReactNode; maxWidth?: string }) => (
        <div className={`w-full h-full flex items-center justify-center ${maxWidth} mx-auto`}>
            {children}
        </div>
    )

    switch (resource.type) {
        case 'VIDEO':
            return (
                <Wrapper>
                    <div className="w-full max-h-full relative backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
                        <VideoPlayer
                            url={resource.contentUrl || ''}
                            topicId={topicId}
                            onComplete={onComplete}
                        />
                        {isCompleted && (
                            <div className="absolute top-4 right-4 flex items-center gap-2 bg-emerald-500/20 text-emerald-400 px-3 py-1.5 rounded-full text-sm font-medium">
                                <CheckCircle className="w-4 h-4" />
                                Completed
                            </div>
                        )}
                    </div>
                </Wrapper>
            )

        case 'PDF':
            return (
                <Wrapper maxWidth="max-w-4xl">
                    <div className="w-full h-full max-h-[calc(100vh-200px)] relative backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
                        {/* Gradient glow effect */}
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-purple-500/10 rounded-2xl opacity-50 pointer-events-none z-0" />

                        {isCompleted && (
                            <div className="absolute top-4 right-4 flex items-center gap-2 bg-emerald-500/20 text-emerald-400 px-3 py-1.5 rounded-full text-sm font-medium z-10">
                                <CheckCircle className="w-4 h-4" />
                                Read
                            </div>
                        )}

                        <div className="relative z-5 h-full">
                            <PdfViewer
                                url={resource.contentUrl || ''}
                                onComplete={onComplete}
                                isCompleted={isCompleted}
                            />
                        </div>
                    </div>
                </Wrapper>
            )

        case 'QUIZ':
            return (
                <Wrapper maxWidth="max-w-3xl">
                    <div className="w-full relative backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-6 shadow-2xl overflow-y-auto max-h-full">
                        {isCompleted && (
                            <div className="absolute top-4 right-4 flex items-center gap-2 bg-emerald-500/20 text-emerald-400 px-3 py-1.5 rounded-full text-sm font-medium z-10">
                                <CheckCircle className="w-4 h-4" />
                                Passed
                            </div>
                        )}
                        <QuizInterface
                            topicId={topicId}
                            questions={(resource.quizData as { questions: { id: string; text: string; options?: { id: string; text: string }[]; correctOptionId?: string }[] } | null)?.questions || []}
                            onComplete={onComplete}
                        />
                    </div>
                </Wrapper>
            )

        default:
            return (
                <Wrapper>
                    <div className="text-center text-gray-500 p-12">
                        Unknown resource type
                    </div>
                </Wrapper>
            )
    }
}
