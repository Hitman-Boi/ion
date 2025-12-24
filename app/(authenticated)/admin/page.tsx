import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { UserRoleForm, EnrollmentRoleForm } from "./role-forms"
import { CreateCourseButton } from "./create-course-button"
import { AddAdminButton } from "./add-admin-button"
import { updateUserGlobalRole } from "@/app/actions/admin"
import { X } from "lucide-react"

import { Header } from "@/components/header"

export default async function AdminPage() {
    const session = await auth()
    // @ts-ignore
    if (session?.user?.role !== "ADMIN") {
        redirect("/dashboard")
    }

    const adminUsers = await prisma.user.findMany({
        where: { role: "ADMIN" },
        orderBy: { createdAt: "desc" },
    })

    const courses = await prisma.course.findMany({
        include: {
            enrollments: {
                include: {
                    user: true,
                },
            },
        },
        orderBy: { createdAt: "desc" },
    })

    return (
        <div className="h-screen w-full bg-background flex flex-col">
            <ResizablePanelGroup direction="horizontal" className="flex-1">
                {/* Left Panel: Course Management */}
                <ResizablePanel defaultSize={70} minSize={30}>
                    <div className="h-full flex flex-col p-6">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-xl font-bold">Courses</h2>
                            <CreateCourseButton />
                        </div>
                        <ScrollArea className="flex-1">
                            <div className="space-y-4">
                                {courses.map((course) => (
                                    <div key={course.id} className="rounded-lg border p-4 shadow-sm">
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="font-semibold">{course.title}</h3>
                                            <span className="text-xs text-muted-foreground">
                                                {course.enrollments.length} enrolled
                                            </span>
                                        </div>
                                        <Separator className="my-2" />
                                        <div className="space-y-2">
                                            <h4 className="text-sm font-medium">Enrollments</h4>
                                            {course.enrollments.length === 0 ? (
                                                <p className="text-xs text-muted-foreground">No enrollments</p>
                                            ) : (
                                                course.enrollments.map((enrollment) => (
                                                    <div key={enrollment.id} className="flex items-center justify-between text-sm">
                                                        <div className="flex items-center gap-2">
                                                            <span>{enrollment.user.email}</span>
                                                            <span className="text-xs text-muted-foreground">({enrollment.user.name})</span>
                                                        </div>
                                                        <EnrollmentRoleForm
                                                            courseId={course.id}
                                                            userId={enrollment.userId}
                                                            currentRole={enrollment.role}
                                                        />
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    </div>
                </ResizablePanel>

                <ResizableHandle />

                {/* Right Panel: Admin User Management */}
                <ResizablePanel defaultSize={30} minSize={20}>
                    <div className="h-full flex flex-col p-6">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-xl font-bold">Admins</h2>
                            <AddAdminButton />
                        </div>
                        <ScrollArea className="flex-1">
                            <div className="space-y-4">
                                {adminUsers.map((user) => (
                                    <div key={user.id} className="flex items-center justify-between rounded-lg border p-4 shadow-sm">
                                        <div className="overflow-hidden">
                                            <p className="font-medium truncate">{user.name || "No Name"}</p>
                                            <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                                        </div>
                                        {(user.email !== "admin@example.com" && adminUsers.length > 1) && (
                                            <form action={async () => {
                                                "use server"
                                                await updateUserGlobalRole(user.id, "STUDENT")
                                            }}>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                                                    <X className="h-4 w-4" />
                                                    <span className="sr-only">Remove admin role</span>
                                                </Button>
                                            </form>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    </div>
                </ResizablePanel>
            </ResizablePanelGroup>
        </div>
    )
}
