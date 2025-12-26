import { getCourseHierarchy, getStudioPageData } from "@/app/actions/course-editor.actions"
import { auth } from "@/auth"
import { CreatorStudio } from "./_components/creator-studio"
import { redirect, notFound } from "next/navigation"

import { getSkills } from "@/app/actions/skills.actions"
import { FlagResolutionPanel } from "./_components/flag-resolution-panel"

export default async function StudioPage({ params }: { params: { courseId: string } }) {
    const session = await auth()
    if (!session?.user) return redirect("/api/auth/signin")

    const [course, allSkills, { flags, userInfo, enrollment }] = await Promise.all([
        getCourseHierarchy(params.courseId),
        getSkills(),
        getStudioPageData(params.courseId, session.user.id),
    ])

    if (!course) return notFound()

    const isOwner = course.instructorId === session.user.id
    const isAdmin = userInfo?.role === "ADMIN"
    const isInstructor = userInfo?.role === "INSTRUCTOR" || enrollment?.role === "INSTRUCTOR"

    // Only allow access to admins, course owner, or instructors
    if (!isAdmin && !isOwner && !isInstructor) {
        return redirect(`/courses/${params.courseId}`)
    }

    return (
        <div className="min-h-full bg-[#0f1115] text-white">
            {/* Flag Resolution Panel for owners */}
            {(isOwner || isAdmin) && flags.length > 0 && (
                <div className="px-6 pt-4">
                    <FlagResolutionPanel
                        flags={flags}
                        courseId={params.courseId}
                        isOwner={isOwner}
                        isAdmin={isAdmin}
                    />
                </div>
            )}
            <CreatorStudio course={course} allSkills={allSkills} />
        </div>
    )
}
