"use client"

import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getLearningPaths } from "@/app/actions/learning-paths.actions"
import { getRoles } from "@/app/actions/roles.actions"
import { RolesList } from "./roles-list"
import { LearningPathsList } from "./learning-paths-list"
import { RoleEditorSheet } from "./role-editor-sheet"
import { PathEditorSheet } from "./path-editor-sheet"
import { useEffect, useState } from "react"

export default function RolesPageWrapper({
    roles,
    learningPaths,
    allCourses
}: {
    roles: any[],
    learningPaths: any[],
    allCourses: any[]
}) {
    const [selectedRole, setSelectedRole] = useState<any | null>(null)
    const [selectedPath, setSelectedPath] = useState<any | null>(null)

    const [isRoleSheetOpen, setIsRoleSheetOpen] = useState(false)
    const [isPathSheetOpen, setIsPathSheetOpen] = useState(false)

    const handleCreateRole = () => {
        setSelectedRole(null)
        setIsRoleSheetOpen(true)
    }

    const handleEditRole = (role: any) => {
        setSelectedRole(role)
        setIsRoleSheetOpen(true)
    }

    const handleCreatePath = () => {
        setSelectedPath(null)
        setIsPathSheetOpen(true)
    }

    const handleEditPath = (path: any) => {
        setSelectedPath(path)
        setIsPathSheetOpen(true)
    }

    const refreshData = () => {
        // In a real app with server components, we rely on router.refresh() which is triggered by actions.
        // But we need to ensure local state reflects it?
        // Actions call revalidatePath, which updates the props passed from Server Component.
        // So components will re-render with new props.
    }

    return (
        <>
            {/* Mobile View: Tabs */}
            <div className="md:hidden h-full flex flex-col min-h-0">
                <Tabs defaultValue="roles" className="h-full flex flex-col">
                    <TabsList className="w-full grid grid-cols-2 rounded-none border-b shrink-0">
                        <TabsTrigger value="roles">Job Roles</TabsTrigger>
                        <TabsTrigger value="paths">Learning Paths</TabsTrigger>
                    </TabsList>
                    <TabsContent value="roles" className="flex-1 m-0 overflow-hidden">
                        <RolesList
                            roles={roles}
                            selectedRole={selectedRole}
                            onSelectRole={handleEditRole}
                            onCreateRole={handleCreateRole}
                        />
                    </TabsContent>
                    <TabsContent value="paths" className="flex-1 m-0 overflow-hidden">
                        <LearningPathsList
                            paths={learningPaths}
                            onSelectPath={handleEditPath}
                            onCreatePath={handleCreatePath}
                        />
                    </TabsContent>
                </Tabs>
            </div>

            {/* Desktop View: Side by Side */}
            <div className="hidden md:flex flex-1 min-h-0 overflow-hidden">
                {/* Left Pane: Roles */}
                <div className="w-1/3 min-w-[300px] border-r h-full">
                    <RolesList
                        roles={roles}
                        selectedRole={selectedRole}
                        onSelectRole={handleEditRole}
                        onCreateRole={handleCreateRole}
                    />
                </div>

                {/* Right Pane: Learning Paths */}
                <div className="flex-1 min-w-[400px] h-full">
                    <LearningPathsList
                        paths={learningPaths}
                        onSelectPath={handleEditPath}
                        onCreatePath={handleCreatePath}
                    />
                </div>
            </div>

            {/* Sheets */}
            <RoleEditorSheet
                open={isRoleSheetOpen}
                onOpenChange={setIsRoleSheetOpen}
                role={selectedRole}
                learningPaths={learningPaths}
                onSave={refreshData}
            />

            <PathEditorSheet
                open={isPathSheetOpen}
                onOpenChange={setIsPathSheetOpen}
                path={selectedPath}
                allCourses={allCourses}
                onSave={refreshData}
            />
        </>
    )
}
