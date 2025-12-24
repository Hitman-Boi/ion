"use client"

import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { JobRole } from "@prisma/client"
import { Briefcase, Plus } from "lucide-react"

interface RolesListProps {
    roles: JobRole[]
    selectedRole: JobRole | null
    onSelectRole: (role: JobRole) => void
    onCreateRole: () => void
}

export function RolesList({ roles, selectedRole, onSelectRole, onCreateRole }: RolesListProps) {
    return (
        <div className="flex flex-col h-full">
            <div className="p-4 border-b flex items-center justify-between bg-muted/30">
                <h3 className="font-semibold flex items-center gap-2">
                    <Briefcase className="w-4 h-4" />
                    Job Roles
                </h3>
                <Button size="sm" onClick={onCreateRole}>
                    <Plus className="w-4 h-4 mr-1" />
                    New
                </Button>
            </div>
            <ScrollArea className="flex-1">
                <div className="p-4 space-y-3">
                    {roles.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-8">
                            No roles defined yet.
                        </p>
                    )}
                    {roles.map((role) => (
                        <Card
                            key={role.id}
                            className={`cursor-pointer transition-colors hover:bg-muted/50 ${selectedRole?.id === role.id ? 'border-primary ring-1 ring-primary bg-muted/50' : ''}`}
                            onClick={() => onSelectRole(role)}
                        >
                            <CardHeader className="p-4">
                                <CardTitle className="text-sm font-medium">{role.title}</CardTitle>
                                <CardDescription className="line-clamp-2 text-xs mt-1">
                                    {role.description || "No description"}
                                </CardDescription>
                            </CardHeader>
                        </Card>
                    ))}
                </div>
            </ScrollArea>
        </div>
    )
}
