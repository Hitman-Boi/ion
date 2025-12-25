import { auth } from "@/auth";
import { CreateCourseButton } from "@/components/create-course-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { getInstructorDashboardData } from "@/app/actions/dashboard.actions";
import { Users, Plus } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function InstructorDashboardPage() {
    const session = await auth();

    if (!session?.user) {
        redirect("/login");
    }

    const isAdmin = (session.user as any).role === "ADMIN";

    // Fetch Teaching Courses using the action
    const { teachingCourses } = await getInstructorDashboardData(session.user.id);


    // If not admin and no courses, maybe redirect or show empty state?
    // Access control: strictly if they have courses or are admin.
    const isInstructor = isAdmin || teachingCourses.length > 0;

    // Note: The Header link check might let them in, but we can show a friendly empty state.

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
            <div className="mx-auto max-w-7xl">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Instructor Dashboard</h1>
                        <p className="text-gray-500 dark:text-gray-400">
                            Manage your courses and track student progress.
                        </p>
                    </div>
                </div>

                {isInstructor ? (
                    <div className="space-y-8">
                        {/* Actions / Stats could go here */}

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {/* Create New Course Card (Admin only or if we allow instructors to create) */}
                            {isAdmin && (
                                <Card className="border-dashed flex flex-col items-center justify-center p-6 hover:bg-muted/50 transition-colors">
                                    <div className="rounded-full bg-primary/10 p-4 mb-4">
                                        <Plus className="h-6 w-6 text-primary" />
                                    </div>
                                    <h3 className="font-semibold text-lg mb-2">Create New Course</h3>
                                    <p className="text-sm text-muted-foreground text-center mb-6">
                                        Start building a new learning experience.
                                    </p>
                                    <CreateCourseButton />
                                </Card>
                            )}

                            {teachingCourses.map(course => (
                                <Card key={course.id} className="flex flex-col">
                                    <CardHeader>
                                        <CardTitle className="line-clamp-1 text-lg" title={course.title}>
                                            {course.title}
                                        </CardTitle>
                                        <CardDescription className="text-xs">
                                            {course._count.enrollments} Students Enrolled
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="flex-1">
                                        <p className="text-sm text-muted-foreground line-clamp-3">
                                            {course.description || "No description provided."}
                                        </p>
                                    </CardContent>
                                    <CardFooter>
                                        <Button className="w-full" variant="secondary" asChild>
                                            <Link href={`/courses/${course.id}/studio`}>
                                                Manage Course
                                            </Link>
                                        </Button>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    </div>
                ) : (
                    <Card className="max-w-md mx-auto mt-20 text-center">
                        <CardHeader>
                            <div className="mx-auto bg-muted rounded-full p-4 w-fit mb-4">
                                <Users className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <CardTitle>Become an Instructor</CardTitle>
                            <CardDescription>
                                You are not currently listed as an instructor for any courses.
                            </CardDescription>
                        </CardHeader>
                        <CardFooter className="justify-center">
                            <p className="text-xs text-muted-foreground">
                                Contact an administrator to get started.
                            </p>
                        </CardFooter>
                    </Card>
                )}
            </div>
        </div>
    );
}
