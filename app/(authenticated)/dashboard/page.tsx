import { auth } from "@/auth"
import { logout } from "@/app/actions/auth"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { redirect } from "next/navigation"

import { Header } from "@/components/header"

export default async function DashboardPage() {
    const session = await auth()

    if (!session?.user) {
        redirect("/login")
    }

    const enrollments = await prisma.enrollment.findMany({
        where: {
            userId: session.user.id,
        },
        include: {
            course: true,
        },
    })

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <main className="container p-4 md:p-6">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold tracking-tight">My Learning</h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        Continue where you left off
                    </p>
                </div>

                {enrollments.length === 0 ? (
                    <div className="flex h-[400px] flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center animate-in fade-in-50">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                            <svg
                                className="h-6 w-6 text-gray-500 dark:text-gray-400"
                                fill="none"
                                height="24"
                                stroke="currentColor"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                                width="24"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                            </svg>
                        </div>
                        <h3 className="mt-4 text-lg font-semibold">No courses yet</h3>
                        <p className="mb-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                            You haven&apos;t enrolled in any courses yet.
                        </p>
                        <Button>Browse Courses</Button>
                    </div>
                ) : (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {enrollments.map((enrollment) => (
                            <Card key={enrollment.id} className="flex flex-col">
                                <CardHeader>
                                    <CardTitle>{enrollment.course.title}</CardTitle>
                                    <CardDescription className="line-clamp-2">
                                        {enrollment.course.description || "No description available"}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="flex-1">
                                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                        <span className="capitalize">{enrollment.role.toLowerCase()}</span>
                                        <span>•</span>
                                        <span className="capitalize">{enrollment.mode}</span>
                                    </div>
                                </CardContent>
                                <CardFooter className="flex justify-between">
                                    <Button asChild className="w-full">
                                        <Link href={`/courses/${enrollment.courseId}`}>
                                            Continue Learning
                                        </Link>
                                    </Button>
                                    {enrollment.role === "INSTRUCTOR" && (
                                        <Button asChild variant="outline" className="ml-2">
                                            <Link href={`/studio/${enrollment.courseId}`}>
                                                Studio
                                            </Link>
                                        </Button>
                                    )}
                                    <form action={async () => {
                                        "use server";
                                        await import("@/app/actions/enrollment").then(m => m.completeCourse(enrollment.courseId));
                                    }}>
                                        <Button variant="secondary" size="sm" className="ml-2">
                                            Complete (Demo)
                                        </Button>
                                    </form>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                )}
            </main>
        </div>
    )
}
