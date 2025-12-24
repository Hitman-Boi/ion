import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"

import { removeUserFromCourse, restoreCourse } from "@/app/actions/admin"
import { getSkills } from "@/app/actions/skills"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { ScrollArea } from "@/components/ui/scroll-area"
import { CourseRole } from "@prisma/client"
import { RotateCcw, X } from "lucide-react"
import { AddEnrollmentButton } from "../../add-enrollment-button"
import { CourseVisibilityToggle } from "../../course-visibility-toggle"
import { DeleteCourseButton } from "./delete-course-button"
import { CourseSkillsManager } from "@/components/course/course-skills-manager"

export default async function CourseAdminPage({ params }: { params: { courseId: string } }) {
    const session = await auth()
    // @ts-ignore
    if (session?.user?.role !== "ADMIN") {
        redirect("/dashboard")
    }

    const [course, allSkills] = await Promise.all([
        prisma.course.findUnique({
            where: { id: params.courseId },
            include: {
                enrollments: {
                    include: { user: true },
                    orderBy: { user: { name: 'asc' } }
                },
                skills: true
            }
        }),
        getSkills()
    ])

    if (!course) {
        return <div className="p-8">Course not found</div>
    }

    const students = course.enrollments.filter(e => e.role === CourseRole.STUDENT)
    const instructors = course.enrollments.filter(e => e.role === CourseRole.INSTRUCTOR)
    const moderators = course.enrollments.filter(e => e.role === CourseRole.MODERATOR)

    const renderUserList = (enrollments: typeof course.enrollments, title: string, role: CourseRole, colorClass: string = "") => (
        <div className="h-full flex flex-col p-6">
            <div className="mb-4 flex items-center justify-between">
                <h2 className={`text-xl font-bold ${colorClass}`}>{title} ({enrollments.length})</h2>
                {!course.deletedAt && <AddEnrollmentButton courseId={course.id} role={role} />}
            </div>
            <ScrollArea className="flex-1">
                <div className="space-y-2">
                    {enrollments.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No {title.toLowerCase()} found.</p>
                    ) : (
                        enrollments.map((e) => (
                            <div key={e.id} className="flex items-center justify-between border p-3 rounded-md bg-card shadow-sm">
                                <div className="text-sm overflow-hidden mr-4">
                                    <div className="font-medium truncate">{e.user.name ?? "Unnamed"}</div>
                                    <div className="text-muted-foreground truncate">{e.user.email}</div>
                                </div>
                                <form action={async () => {
                                    "use server"
                                    await removeUserFromCourse(course.id, e.userId)
                                }}>
                                    <button className="text-muted-foreground hover:text-destructive transition-colors p-1" title="Remove user from course">
                                        <X className="w-4 h-4" />
                                    </button>
                                </form>
                            </div>
                        ))
                    )}
                </div>
            </ScrollArea>
        </div>
    )

    return (
        <div className="h-[calc(100vh-4rem)] w-full bg-background flex flex-col">
            <div className="p-6 pb-2 border-b shrink-0 flex justify-between items-start">
                <div>
                    <div className="flex items-center gap-2">
                        <Badge variant={course.deletedAt ? "destructive" : (course.isPublic ? "default" : "secondary")}>
                            {course.deletedAt ? "Deleted" : (course.isPublic ? "Public" : "Private")}
                        </Badge>
                        <h1 className="text-2xl font-bold">{course.title}</h1>
                    </div>
                    {/* Skills Display */}
                    <div className="flex flex-wrap gap-1 mt-2">
                        {course.skills.map(skill => (
                            <Badge key={skill.id} variant="outline" className="text-[10px] px-1 py-0 h-4">{skill.name}</Badge>
                        ))}
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {!course.deletedAt && (
                        <>
                            <CourseSkillsManager
                                courseId={course.id}
                                initialStatus={course.skills.map(s => s.id)}
                                allSkills={allSkills}
                            />
                            <CourseVisibilityToggle courseId={course.id} isPublic={course.isPublic} />
                        </>
                    )}
                    {course.deletedAt ? (
                        <form action={async () => {
                            "use server"
                            await restoreCourse(course.id)
                        }}>
                            <Button variant="outline" size="icon" title="Restore Course">
                                <RotateCcw className="h-4 w-4" />
                            </Button>
                        </form>
                    ) : (
                        <DeleteCourseButton courseId={course.id} />
                    )}
                </div>
            </div>

            <ResizablePanelGroup direction="horizontal" className="flex-1 min-h-0">
                {/* Left Panel: Students */}
                <ResizablePanel defaultSize={50} minSize={30}>
                    {renderUserList(students, "Students", CourseRole.STUDENT)}
                </ResizablePanel>

                <ResizableHandle />

                {/* Right Panel: Instructors and Moderators */}
                <ResizablePanel defaultSize={50} minSize={30}>
                    <ResizablePanelGroup direction="vertical">
                        {/* Top Right: Instructors */}
                        <ResizablePanel defaultSize={50} minSize={20}>
                            {renderUserList(instructors, "Instructors", CourseRole.INSTRUCTOR, "text-blue-600")}
                        </ResizablePanel>

                        <ResizableHandle />

                        {/* Bottom Right: Moderators */}
                        <ResizablePanel defaultSize={50} minSize={20}>
                            {renderUserList(moderators, "Moderators", CourseRole.MODERATOR, "text-green-600")}
                        </ResizablePanel>
                    </ResizablePanelGroup>
                </ResizablePanel>
            </ResizablePanelGroup>
        </div>
    )
}
