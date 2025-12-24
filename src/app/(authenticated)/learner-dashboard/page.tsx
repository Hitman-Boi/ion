import { auth } from "@/auth"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { prisma } from "@/lib/prisma"
import { BookOpen, Clock, Compass } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"
import { JourneyMap } from "@/components/learning-path/journey-map"
import { RolePicker } from "@/components/dashboard/role-picker"
import { GoalCard } from "@/components/dashboard/goal-card"

export default async function DashboardPage() {
    const session = await auth()

    if (!session?.user) {
        redirect("/login")
    }

    const isAdmin = (session.user as any).role === "ADMIN";

    // Fetch User with Target Roles & Progress
    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: {
            targetRoles: {
                include: {
                    skills: true,
                    learningPaths: {
                        include: {
                            items: {
                                orderBy: { orderIndex: 'asc' },
                                include: {
                                    course: {
                                        include: {
                                            chapters: {
                                                include: {
                                                    topics: { select: { id: true } }
                                                }
                                            }
                                        }
                                    },
                                    chapter: {
                                        include: {
                                            topics: { select: { id: true } }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            skills: { include: { skill: true } } // User acquired skills
        }
    })

    // Fetch All Roles for Picker (Show picker if no roles selected, or allow adding more)
    // We want to show RolePicker if user has NO roles, or maybe as an option to "Add Goal"
    // For now, let's pass allRoles to the picker always so we can reuse it, or fetch only if needed.
    // The design says: "Choose multiple career goals". So let's fetch all roles.
    const allRoles = await prisma.jobRole.findMany();
    const userTargetRoleIds = user?.targetRoles.map(r => r.id) || [];

    // Global Acquired Skills
    const acquiredSkillsKeyed = new Set(user?.skills.map(us => us.skill.name) || []);
    const acquiredSkillsList = Array.from(acquiredSkillsKeyed);

    // 3. Fetch User Progress for all topics (needed for path progress)
    const userProgress = await prisma.userProgress.findMany({
        where: {
            userId: session.user.id,
            isTopicComplete: true
        },
        select: { topicId: true }
    });
    const completedTopicIds = new Set(userProgress.map(p => p.topicId));

    // Process each target role to calculate stats
    const activeGoals = user?.targetRoles.map(role => {
        const requiredSkills = role.skills.map(s => s.name);
        const missingSkills = requiredSkills.filter(s => !acquiredSkillsKeyed.has(s));

        // Role Progress
        const progress = requiredSkills.length > 0
            ? Math.round(((requiredSkills.length - missingSkills.length) / requiredSkills.length) * 100)
            : 0;

        // Determine Active Path
        const levels = { BEGINNER: 1, INTERMEDIATE: 2, ADVANCED: 3 };
        const sortedPaths = role.learningPaths.sort((a, b) => (levels[a.level as keyof typeof levels] || 0) - (levels[b.level as keyof typeof levels] || 0));

        let activePath = sortedPaths[0];
        if (sortedPaths.length > 0) {
            for (const path of sortedPaths) {
                const isPathComplete = path.items.every(item => {
                    const topics = item.course
                        ? item.course.chapters.flatMap(c => c.topics)
                        : item.chapter?.topics || [];
                    return topics.length > 0 && topics.every(t => completedTopicIds.has(t.id));
                });

                if (!isPathComplete) {
                    activePath = path;
                    break;
                }
                activePath = path;
            }
        }

        return {
            role,
            progress,
            missingSkills,
            activePath
        };
    }) || [];

    // (teachingCourses fetch logic removed)

    // 2. Fetch Enrolled Courses
    const enrollments = await prisma.enrollment.findMany({
        where: {
            userId: session.user.id,
            role: "STUDENT",
            course: {
                deletedAt: null
            }
        },
        include: {
            course: {
                include: {
                    chapters: {
                        include: {
                            topics: { select: { id: true } }
                        }
                    }
                }
            },
        },
        orderBy: { updatedAt: 'desc' }
    });

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
            <div className="mx-auto max-w-7xl">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        Manage your career goals and track your progress.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* LEFT PANE: My Courses (2/3 width -> col-span-8) */}
                    <section className="lg:col-span-8 space-y-6">

                        {/* Header with Explore Link */}
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-semibold flex items-center gap-2">
                                <BookOpen className="h-5 w-5" />
                                My Courses
                            </h2>
                            <Button variant="ghost" asChild className="text-sm font-medium">
                                <Link href="/courses">Explore More Courses</Link>
                            </Button>
                        </div>

                        {enrollments.length === 0 ? (
                            <div className="flex h-[200px] flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center bg-white dark:bg-gray-800">
                                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                                    <BookOpen className="h-6 w-6 text-gray-500" />
                                </div>
                                <h3 className="mt-4 text-lg font-semibold">No active enrollments</h3>
                                <Button asChild variant="link">
                                    <Link href="/courses">Browse Courses</Link>
                                </Button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

                    {/* RIGHT PANE: Career Paths (1/3 width -> col-span-4) */}
                    <aside className="lg:col-span-4 space-y-8">

                        {/* 1. Career Paths */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-semibold flex items-center gap-2">
                                    <Compass className="h-5 w-5" />
                                    My Career Paths
                                </h2>
                                <Button variant="ghost" asChild className="text-sm font-medium">
                                    <Link href="/learning-paths">Explore More Paths</Link>
                                </Button>
                            </div>

                            {activeGoals.length > 0 ? (
                                <div className="space-y-6">
                                    {activeGoals.map(goal => (
                                        <div key={goal.role.id} className="h-full">
                                            <GoalCard
                                                roleId={goal.role.id}
                                                title={goal.activePath?.title || goal.role.title}
                                                description={goal.activePath?.description || goal.role.description}
                                                progress={goal.progress}
                                                activePath={goal.activePath}
                                                skillAnalysis={{
                                                    acquired: acquiredSkillsList.filter(s => goal.role.skills.some(rs => rs.name === s)),
                                                    missing: goal.missingSkills
                                                }}
                                            />
                                        </div>
                                    ))}

                                    {/* Small add button if they have goals but want more? 
                                        The "Explore More Paths" link is already at the top.
                                        Maybe we don't need the dashed card here if the header link exists.
                                        But keeping it for consistency if they want to 'add' directly.
                                        Let's keep the user's intent: "Explore more... should take user to /learning-paths"
                                        So I'll remove the dashed card and rely on the header link to avoid redundancy.
                                     */}
                                </div>
                            ) : (
                                <div className="p-6 bg-primary/5 rounded-xl border border-primary/10">
                                    <h2 className="text-xl font-semibold mb-2 text-primary">Start Your Journey</h2>
                                    <p className="text-muted-foreground mb-4">Select a career path to get personalized learning recommendations and skill tracking.</p>
                                    <Button asChild className="w-full">
                                        <Link href="/learning-paths">Browse Career Paths</Link>
                                    </Button>
                                </div>
                            )}

                            {/* Role Picker for Quick Add (Optional, but "Explore More" covers it) 
                                Let's remove the inline embedded picker to declutter the right pane 
                                as the user specifically asked for a link to a new page.
                            */}
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    )
}

