import { auth } from "@/auth"
import { Waypoints } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CreateCourseButton } from "@/components/create-course-button"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { ManageAdminsSheet } from "./manage-admins-sheet"
import { CoursesList } from "./courses-list"
import { getRoles } from "@/app/actions/roles.actions"
import { getSkillGapData, getSkills } from "@/app/actions/skills.actions"

import { ManageSkillsSheet } from "./manage-skills-sheet"

export default async function AdminPage() {
    const session = await auth()
    // @ts-ignore
    if (session?.user?.role !== "ADMIN") {
        redirect("/learner-dashboard")
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
                },
                modules: true
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

            <div className="flex-1 flex flex-col md:grid md:grid-cols-[1fr_300px] gap-6 min-h-0">
                {/* Left Pane: Course List */}
                <div className="order-2 md:order-none h-full border rounded-lg bg-card/50 overflow-hidden">
                    <CoursesList courses={courses} />
                </div>

                {/* Right Sidebar: Actions */}
                <div className="order-1 md:order-none flex flex-col gap-4">
                    <CreateCourseButton className="justify-center md:justify-start" />
                    <ManageAdminsSheet initialAdmins={adminUsers} className="justify-center md:justify-start" />
                    <Button asChild variant="outline" className="justify-center md:justify-start">
                        <Link href="/admin-dashboard/roles">
                            <Waypoints className="mr-2 h-4 w-4" />
                            Manage Learning Paths & Roles
                        </Link>
                    </Button>
                    <ManageSkillsSheet initialGapData={skillGapData} allSkills={allSkills} className="justify-center md:justify-start" />
                </div>
            </div>
        </div>
    )
}
