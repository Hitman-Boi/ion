import { auth } from "@/auth"
import { JourneyMap } from "@/components/learning-path/journey-map"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { getLearningPathPageData } from "@/app/actions/learning-paths.actions"
import { ArrowLeft, BookOpen, Clock, Play, Lock } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"
import { SubscribeButton } from "./_components/subscribe-button"

export default async function PathPage({ params }: { params: { pathId: string } }) {
    const session = await auth()
    if (!session?.user) redirect("/login")

    const { path, isSubscribed, userProgress } = await getLearningPathPageData(params.pathId, session.user.id)

    if (!path) {
        return (
            <div className="container mx-auto p-8 text-center bg-gray-50 dark:bg-gray-900 min-h-screen">
                <h1 className="text-2xl font-bold mb-4">Path Not Found</h1>
                <Button asChild>
                    <Link href="/learner-dashboard">Return to Dashboard</Link>
                </Button>
            </div>
        )
    }

    const completedTopicIds = new Set(userProgress.map(p => p.topicId))

    // Calculate overall stats
    const allItems = path.items;
    let totalTopics = 0;
    let completedTopics = 0;

    allItems.forEach(item => {
        const topics = item.course
            ? item.course.modules.flatMap(c => c.topics)
            : item.module?.topics || [];

        totalTopics += topics.length;
        completedTopics += topics.filter(t => completedTopicIds.has(t.id)).length;
    })

    const progress = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 border-b">
                <div className="container mx-auto px-4 py-8">
                    <Button variant="ghost" size="sm" asChild className="mb-4 -ml-2 text-muted-foreground">
                        <Link href="/learner-dashboard">
                            <ArrowLeft className="h-4 w-4 mr-1" />
                            Back to Dashboard
                        </Link>
                    </Button>

                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <Badge variant="outline" className="uppercase tracking-widest text-[10px]">Learning Path</Badge>
                                {isSubscribed && progress === 100 && <Badge className="bg-green-500 hover:bg-green-600">Completed</Badge>}
                            </div>
                            <h1 className="text-3xl font-bold tracking-tight mb-2">{path.title}</h1>
                            {path.description && (
                                <p className="text-muted-foreground max-w-2xl text-lg">{path.description}</p>
                            )}
                        </div>

                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                            {isSubscribed ? (
                                <div className="flex items-center gap-4 bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold">{progress}%</div>
                                        <div className="text-xs text-muted-foreground uppercase tracking-wider">Progress</div>
                                    </div>
                                    <div className="h-8 w-px bg-gray-200 dark:bg-gray-700 mx-2"></div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold">{allItems.length}</div>
                                        <div className="text-xs text-muted-foreground uppercase tracking-wider">Milestones</div>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center gap-4 bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold">{allItems.length}</div>
                                        <div className="text-xs text-muted-foreground uppercase tracking-wider">Milestones</div>
                                    </div>
                                </div>
                            )}
                            <SubscribeButton pathId={path.id} isSubscribed={isSubscribed} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8 space-y-8">
                {/* Visual Map */}
                <section>
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <Clock className="h-5 w-5 text-primary" />
                        Your Journey Map
                    </h2>
                    <Card className="border-0 shadow-md overflow-hidden bg-white dark:bg-gray-800">
                        <div className="p-6">
                            <JourneyMap path={path} completedTopicIds={Array.from(completedTopicIds)} />
                        </div>
                    </Card>
                </section>

                {/* Detailed Steps List */}
                <section className="max-w-4xl">
                    <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-primary" />
                        Path Curriculum
                    </h2>

                    <div className="space-y-4">
                        {allItems.map((item, index) => {
                            const topics = item.course
                                ? item.course.modules.flatMap(c => c.topics)
                                : item.module?.topics || [];

                            const itemCompleted = topics.length > 0 && topics.every(t => completedTopicIds.has(t.id));
                            const itemProgress = topics.length > 0
                                ? Math.round((topics.filter(t => completedTopicIds.has(t.id)).length / topics.length) * 100)
                                : 0;

                            return (
                                <Card key={item.id} className={`transition-all ${itemCompleted ? 'border-primary/20 bg-primary/5' : 'hover:border-primary/50'}`}>
                                    <div className="p-6 flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                                        <div className="flex items-center justify-center w-12 h-12 rounded-full font-bold text-lg border-2 shrink-0 bg-background text-muted-foreground border-muted">
                                            {index + 1}
                                        </div>

                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-semibold text-lg">
                                                    {item.course?.title || item.module?.title}
                                                </h3>
                                                {itemCompleted && <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">Done</Badge>}
                                            </div>
                                            <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                                                {item.course?.description || item.module?.description || "No description provided."}
                                            </p>

                                            <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                                                <span>{item.course ? "Course" : "Module"}</span>
                                                <span>•</span>
                                                <span>{topics.length} Topics</span>
                                                <span>•</span>
                                                <span>{itemProgress}% Complete</span>
                                            </div>
                                        </div>

                                        <div className="w-full sm:w-auto mt-2 sm:mt-0">
                                            <Button asChild className="w-full" variant={itemCompleted ? "secondary" : "default"}>
                                                <Link href={item.course ? `/courses/${item.course.id}` : '#'}>
                                                    {itemCompleted ? "Review" : "Start"} <Play className="h-3 w-3 ml-2" />
                                                </Link>
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            )
                        })}
                    </div>
                </section>
            </div>
        </div>
    )
}
