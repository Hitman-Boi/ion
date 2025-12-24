"use client"

import { RoleForm } from "./_components/role-form"
import { RolePathEditor } from "./_components/role-path-editor"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { JobRole } from "@prisma/client"
import { Briefcase } from "lucide-react"
import { useState } from "react"

interface ManageRolesSheetProps {
    initialRoles: JobRole[]
    allSkills: any[]
}

export function ManageRolesSheet({ initialRoles, allSkills }: ManageRolesSheetProps) {
    const [open, setOpen] = useState(false)

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="outline" className="gap-2">
                    <Briefcase className="h-4 w-4" />
                    Manage Roles
                </Button>
            </SheetTrigger>
            <SheetContent className="w-[400px] sm:w-[640px] flex flex-col h-full sm:max-w-[640px]">
                <SheetHeader>
                    <SheetTitle>Job Roles & Paths</SheetTitle>
                    <SheetDescription>
                        Define career paths and role requirements.
                    </SheetDescription>
                </SheetHeader>

                <div className="flex-1 flex flex-col gap-6 mt-6 overflow-hidden">
                    {/* Actions */}
                    <div className="flex justify-end">
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button size="sm">Create New Role</Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Create New Role</DialogTitle>
                                </DialogHeader>
                                <RoleForm onSuccess={() => { }} allSkills={allSkills} />
                            </DialogContent>
                        </Dialog>
                    </div>

                    {/* Roles List */}
                    <ScrollArea className="flex-1 -mr-4 pr-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            {initialRoles.map((role: any) => (
                                <Card key={role.id} className="bg-muted/10">
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4">
                                        <CardTitle className="text-sm font-medium">
                                            {role.title}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-4 pt-0">
                                        <p className="text-xs text-muted-foreground mb-4 line-clamp-2 min-h-[2.5em]">
                                            {role.description || "No description"}
                                        </p>

                                        <Separator className="my-2" />

                                        <div className="space-y-2">
                                            <h4 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Career Paths (Incoming)</h4>
                                            {role.paths.length === 0 ? (
                                                <p className="text-xs text-muted-foreground italic">No paths defined</p>
                                            ) : (
                                                <ul className="text-xs space-y-1">
                                                    {role.paths.map((path: any) => (
                                                        <li key={path.id} className="flex items-center gap-1">
                                                            <span className="text-muted-foreground">from</span>
                                                            <span className="font-medium">
                                                                {/* @ts-ignore - Prisma include relation */}
                                                                {path.sourceRoleId ? initialRoles.find((r: any) => r.id === path.sourceRoleId)?.title : "Entry Level"}
                                                            </span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}

                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <Button variant="ghost" size="sm" className="w-full mt-2 h-7 text-xs border-dashed border">
                                                        + Connect Path
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent>
                                                    <DialogHeader>
                                                        <DialogTitle>Add Path to {role.title}</DialogTitle>
                                                    </DialogHeader>
                                                    <RolePathEditor roles={initialRoles} targetRole={role} />
                                                </DialogContent>
                                            </Dialog>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </ScrollArea>
                </div>
            </SheetContent>
        </Sheet>
    )
}
