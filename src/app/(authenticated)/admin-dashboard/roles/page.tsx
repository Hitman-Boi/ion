import { auth } from "@/auth"
import { getAdminRolesPageData } from "@/app/actions/dashboard.actions"
import { redirect } from "next/navigation"
import RolesPageWrapper from "./_components/roles-page-wrapper"

// This is the Server Component
export default async function AdminRolesPage() {
    const session = await auth()
    if (session?.user?.role !== "ADMIN") {
        redirect("/learner-dashboard")
    }

    const { roles, learningPaths, allCourses } = await getAdminRolesPageData()


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
