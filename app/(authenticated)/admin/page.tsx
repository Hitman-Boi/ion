import { auth } from "@/auth"
import { CreateCourseButton } from "@/components/create-course-button"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { ManageAdminsSheet } from "./manage-admins-sheet"
import { CoursesList } from "./courses-list"
import { getRoles } from "@/app/actions/roles"
import { getSkillGapData, getSkills } from "@/app/actions/skills"
import { ManageRolesSheet } from "./manage-roles-sheet"
import { ManageSkillsSheet } from "./manage-skills-sheet"

export default async function AdminPage() {
    const session = await auth()
    // @ts-ignore
    if (session?.user?.role !== "ADMIN") {
        redirect("/dashboard")
    }

    const [adminUsers, courses, roles, skillGapData, allSkills] = await Promise.all([
        prisma.user.findMany({
            where: { role: "ADMIN" },
            orderBy: { createdAt: "desc" },
        }),
        prisma.course.findMany({
            include: {
                enrollments: {
                    select: { role: true }
                }
            },
            orderBy: { createdAt: "desc" },
        }),
        getRoles(),
        getSkillGapData(),
        getSkills()
    ])

    return (
        <div className="h-screen w-full bg-background flex flex-col p-6">
            <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

            <div className="flex-1 grid grid-cols-[1fr_240px] gap-6 min-h-0">
                {/* Left Pane: Course List */}
                <div className="h-full border rounded-lg bg-card/50 overflow-hidden">
                    <CoursesList courses={courses} />
                </div>

                {/* Right Sidebar: Actions */}
                <div className="flex flex-col gap-4">
                    <CreateCourseButton />
                    <ManageAdminsSheet initialAdmins={adminUsers} />
                    <ManageRolesSheet initialRoles={roles} allSkills={allSkills} />
                    <ManageSkillsSheet initialGapData={skillGapData} allSkills={allSkills} />
                </div>
            </div>
        </div>
    )
}
