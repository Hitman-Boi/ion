import { getCourseHierarchy } from "@/app/actions/course-editor.actions"
import { auth } from "@/auth"
import { CreatorStudio } from "./_components/CreatorStudio"
import { redirect } from "next/navigation"

import { getSkills } from "@/app/actions/skills.actions"

export default async function StudioPage({ params }: { params: { courseId: string } }) {
    const session = await auth()
    if (!session?.user) return redirect("/api/auth/signin")

    const [course, allSkills] = await Promise.all([
        getCourseHierarchy(params.courseId),
        getSkills()
    ])
    if (!course) return <div>Course not found</div>

    return (
        <div className="min-h-screen bg-[#0f1115] text-white">
            <CreatorStudio course={course} allSkills={allSkills} />
        </div>
    )
}
