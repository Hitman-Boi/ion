import { auth } from "@/auth"
import { CreateCourseButton } from "@/components/create-course-button"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { prisma } from "@/lib/prisma"
import { BookOpen, Clock, Users } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"

export default async function DashboardPage() {
    const session = await auth()

    if (!session?.user) {
        redirect("/login")
    }

    const isAdmin = (session.user as any).role === "ADMIN";

    // 1. Fetch Teaching Courses
    const teachingCourses = await prisma.course.findMany({
        where: {
            OR: [
                { instructorId: session.user.id },
                { enrollments: { some: { userId: session.user.id, role: "INSTRUCTOR" } } }
            ],
            deletedAt: null,
        },
        include: {
            _count: {
                select: { enrollments: { where: { role: "STUDENT" } } }
            }
        },
        orderBy: { updatedAt: 'desc' }
    });

    // 2. Fetch Enrolled Courses (Student) with topics and resources for progress
    const enrollments = await prisma.enrollment.findMany({
        where: {
            userId: session.user.id,
            role: "STUDENT",  // Explicitly student enrollments
            course: {
                deletedAt: null
            }
        },
        include: {
            course: {
                include: {
                    chapters: {
                        include: {
                            topics: {
                                select: { id: true }
                            }
                        }
                    }
                }
            },
        },
        orderBy: { updatedAt: 'desc' }
    });

    // 3. Fetch User Progress for all topics
    const userProgress = await prisma.userProgress.findMany({
        where: {
            userId: session.user.id,
            isTopicComplete: true
        },
        select: { topicId: true }
    });

    const completedTopicIds = new Set(userProgress.map(p => p.topicId));

    // Logic to determine if Instructor View should be visible
    const showInstructorView = isAdmin || teachingCourses.length > 0;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
            <div className="mx-auto max-w-7xl">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        Manage your courses and track your progress.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {/* LEFT PANE: My Learning (Subscribed Courses) */}
                    <section className={`${showInstructorView ? 'md:col-span-3' : 'md:col-span-4'}`}>
                        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                            <BookOpen className="h-5 w-5" />
                            My Learning
                        </h2>

                        {enrollments.length === 0 ? (
                            <div className="flex h-[300px] flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center bg-white dark:bg-gray-800">
                                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                                    <BookOpen className="h-6 w-6 text-gray-500" />
                                </div>
                                <h3 className="mt-4 text-lg font-semibold">No active enrollments</h3>
                                <p className="mb-4 mt-2 text-sm text-gray-500">
                                    Browse the catalog to start learning.
                                </p>
                                <Button asChild>
                                    <Link href="/courses">Browse Courses</Link>
                                </Button>
                            </div>
                        ) : (
                            <div className={`grid gap-6 ${showInstructorView ? 'sm:grid-cols-2 lg:grid-cols-3' : 'sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'}`}>
                                {enrollments.map((enrollment) => {
                                    // Flatten all topics from chapters > topics
                                    const allTopics = enrollment.course.chapters.flatMap(ch => ch.topics);

                                    const totalSteps = allTopics.length;
                                    const completedSteps = allTopics.filter(t => completedTopicIds.has(t.id)).length;

                                    const progress = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
                                    const remainingSteps = Math.max(0, totalSteps - completedSteps);

                                    return (
                                        <Card key={enrollment.id} className="flex flex-col">
                                            <CardHeader>
                                                <div className="flex justify-between items-start">
                                                    <CardTitle className="line-clamp-1 text-lg" title={enrollment.course.title}>
                                                        {enrollment.course.title}
                                                    </CardTitle>
                                                    {enrollment.mode === 'verified' && (
                                                        <Badge variant="secondary" className="text-xs">Verified</Badge>
                                                    )}
                                                </div>
                                                <CardDescription className="line-clamp-2 min-h-[40px]">
                                                    {enrollment.course.description || "No description available"}
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent className="flex-1 space-y-4">
                                                <div className="space-y-1">
                                                    <div className="flex justify-between text-xs font-medium">
                                                        <span>{progress}% Complete</span>
                                                        <span>{completedSteps}/{totalSteps} Steps</span>
                                                    </div>
                                                    <Progress value={progress} className="h-2" />
                                                </div>

                                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                    <Clock className="h-3 w-3" />
                                                    <span>
                                                        {remainingSteps === 0
                                                            ? "Completed"
                                                            : `${remainingSteps} lesson${remainingSteps !== 1 ? 's' : ''} remaining`
                                                        }
                                                    </span>
                                                </div>
                                            </CardContent>
                                            <CardFooter>
                                                <Button asChild className="w-full">
                                                    <Link href={`/courses/${enrollment.courseId}`}>
                                                        {progress > 0 ? "Continue Learning" : "Start Course"}
                                                    </Link>
                                                </Button>
                                            </CardFooter>
                                        </Card>
                                    )
                                })}
                            </div>
                        )}
                    </section>

                    {/* RIGHT PANE: Instructor View */}
                    {showInstructorView && (
                        <aside className="md:col-span-1 space-y-6">
                            <div>
                                <div className="mb-4 space-y-4">
                                    <h2 className="text-xl font-semibold flex items-center gap-2">
                                        <Users className="h-5 w-5" />
                                        Instructor View
                                    </h2>
                                    {isAdmin && (
                                        <div className="w-full">
                                            <CreateCourseButton className="w-full" />
                                        </div>
                                    )}
                                </div>

                                {teachingCourses.length === 0 ? (
                                    <Card className="bg-gray-50 border-dashed dark:bg-gray-800/50">
                                        <CardContent className="pt-6 text-center text-sm text-gray-500">
                                            You are not teaching any courses.
                                        </CardContent>
                                        <CardFooter>
                                            <p className="text-xs text-muted-foreground w-full text-center">
                                                {isAdmin ? "Click '+' above to create" : "Contact admin to become an instructor"}
                                            </p>
                                        </CardFooter>
                                    </Card>
                                ) : (
                                    <div className="space-y-4">
                                        {teachingCourses.map(course => (
                                            <Card key={course.id} className="overflow-hidden">
                                                <CardHeader className="p-4 pb-2">
                                                    <CardTitle className="text-base truncate" title={course.title}>
                                                        {course.title}
                                                    </CardTitle>
                                                    <CardDescription className="text-xs">
                                                        {course._count.enrollments} Students
                                                    </CardDescription>
                                                </CardHeader>
                                                <CardFooter className="p-4 pt-2">
                                                    <Button size="sm" variant="secondary" className="w-full" asChild>
                                                        <Link href={`/studio/${course.id}`}>
                                                            Manage
                                                        </Link>
                                                    </Button>
                                                </CardFooter>
                                            </Card>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </aside>
                    )}
                </div>
            </div>
        </div>
    )
}
