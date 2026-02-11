import { getAdminRolesPageData } from "@/app/actions/dashboard.actions"
import RolesPageWrapper from "./_components/roles-page-wrapper"

// This is the Server Component
export default async function AdminRolesPage() {
    // Skip auth check - directly show admin roles page

    const { roles, learningPaths, allCourses } = await getAdminRolesPageData()


    return (
        <div className="flex flex-col h-full w-full bg-background overflow-hidden">
            {/* Header is handled by layout, but we need title maybe? */}
            <div className="border-b bg-card p-3 md:p-4 flex-none">
                <h1 className="text-xl md:text-2xl font-bold tracking-tight">Roles & Curriculums</h1>
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
