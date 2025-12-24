import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import RolesPageWrapper from "./_components/roles-page-wrapper"

// This is the Server Component
export default async function AdminRolesPage() {
    const session = await auth()
    if (session?.user?.role !== "ADMIN") {
        redirect("/learner-dashboard")
    }

    const roles = await prisma.jobRole.findMany({
        include: {
            learningPaths: true, // Needed for linking logic
        },
        orderBy: { title: 'asc' }
    })

    const learningPaths = await prisma.learningPath.findMany({
        include: {
            items: true,
            roles: true
        },
        orderBy: { title: 'asc' }
    })

    const allCourses = await prisma.course.findMany({
        where: { deletedAt: null },
        select: {
            id: true,
            title: true,
            modules: {
                select: { id: true, title: true, sortOrder: true },
                orderBy: { sortOrder: 'asc' }
            }
        },
        orderBy: { title: 'asc' }
    })

    return (
        <div className="w-full h-full bg-background">
            {/* Header is handled by layout, but we need title maybe? */}
            <div className="border-b bg-card p-3 md:p-4">
                <h1 className="text-xl md:text-2xl font-bold tracking-tight">Roles &amp; Curriculums</h1>
                <p className="text-xs md:text-sm text-muted-foreground">Manage job roles and design their learning paths.</p>
            </div>

            <RolesPageWrapper
                roles={roles}
                learningPaths={learningPaths}
                allCourses={allCourses}
            />
        </div>
    )
}
