import { auth } from "@/auth"
import { FocusPlayer } from "./_components/FocusPlayer"
import { prisma as db } from "@/lib/prisma"
import { Topic, TopicResource, UserProgress } from "@prisma/client"
import { redirect } from "next/navigation"

export default async function LearnPage({ params }: { params: { courseId: string, topicId: string } }) {
    const session = await auth()
    if (!session?.user?.id) return redirect("/api/auth/signin")

    // Fetch Course Hierarchy to determine navigation
    const course = await db.course.findUnique({
        where: { id: params.courseId },
        include: {
            modules: {
                orderBy: { sortOrder: 'asc' },
                include: {
                    topics: {
                        orderBy: { sortOrder: 'asc' },
                        include: {
                            resources: true
                        }
                    }
                }
            }
        }
    })

    if (!course) return <div>Course not found</div>

    // Flatten topics to find current, prev, next
    const allTopics = course.modules.flatMap((c) => c.topics) as (Topic & { resources: TopicResource[] })[]
    const currentIndex = allTopics.findIndex((t) => t.id === params.topicId)

    if (currentIndex === -1) return <div>Topic not found</div>

    const currentTopic = allTopics[currentIndex]
    const prevTopicId = currentIndex > 0 ? allTopics[currentIndex - 1].id : undefined
    const nextTopicId = currentIndex < allTopics.length - 1 ? allTopics[currentIndex + 1].id : undefined

    // Fetch User Progress for this Topic - ATOMIC
    // New Schema: one record per topicId + userId
    const progress = await db.userProgress.findUnique({
        where: {
            userId_topicId: {
                userId: session.user.id,
                topicId: params.topicId
            }
        }
    })

    return (
        <FocusPlayer
            topic={currentTopic}
            courseId={params.courseId}
            prevTopicId={prevTopicId}
            nextTopicId={nextTopicId}
            userProgress={progress}
        />
    )
}
