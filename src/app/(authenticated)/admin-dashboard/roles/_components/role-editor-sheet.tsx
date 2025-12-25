"use client"

import { Button } from "@/components/ui/button"
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useEffect } from "react"
import { createRole, updateRole, updateRoleLinkPath } from "@/app/actions/roles.actions"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const formSchema = z.object({
    title: z.string().min(2, "Title must be at least 2 characters."),
    description: z.string().optional(),
})

interface RoleEditorSheetProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    role: any | null // If null, create mode
    onSave: () => void
    learningPaths: any[] // For linking
}

export function RoleEditorSheet({ open, onOpenChange, role, onSave, learningPaths }: RoleEditorSheetProps) {
    const router = useRouter()
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
            description: "",
        },
    })

    useEffect(() => {
        if (role) {
            form.reset({
                title: role.title,
                description: role.description || "",
            })
        } else {
            form.reset({ title: "", description: "" })
        }
    }, [role, form])

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            if (role) {
                await updateRole(role.id, values)
                toast.success("Role updated")
            } else {
                await createRole(values)
                toast.success("Role created")
            }
            onSave()
            onOpenChange(false)
            router.refresh()
        } catch (error) {
            toast.error("Failed to save role")
        }
    }

    // Role Linking Logic (Only visible in Edit Mode)
    const handleLinkPath = async (level: string, pathId: string) => {
        if (!role) return
        try {
            await updateRoleLinkPath(role.id, level, pathId)
            toast.success(`${level} path linked Updated`)
            router.refresh()
            onSave() // Trigger parent refresh if needed
        } catch (error) {
            toast.error("Failed to link path")
        }
    }

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="sm:max-w-md overflow-y-auto">
                <SheetHeader>
                    <SheetTitle>{role ? "Edit Job Role" : "Create Job Role"}</SheetTitle>
                    <SheetDescription>
                        Define the role and link learning paths.
                    </SheetDescription>
                </SheetHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Title</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. Senior Frontend Engineer" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Role responsibilities..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        {!role && (
                            <Button type="submit" className="w-full">Create Role</Button>
                        )}
                    </form>
                </Form>

                {role && (
                    <div className="mt-8 space-y-4 border-t pt-4">
                        <h4 className="font-medium text-sm">Learning Path Links</h4>
                        {/* 
                            For MVP, we just show 3 slots: Beginner, Intermediate, Advanced.
                            Admin selects a path for each.
                        */}
                        {["BEGINNER", "INTERMEDIATE", "ADVANCED"].map(level => {
                            // Find current path for this level? 
                            // Schema: Role <-> LearningPath (many-to-many implicit or explicit?)
                            // Schema: `roles JobRole[]` on LearningPath.
                            // Schema: `learningPaths LearningPath[]` on JobRole.
                            // We need to filter `role.learningPaths` by level.
                            const currentPath = role.learningPaths?.find((p: any) => p.level === level);

                            return (
                                <div key={level} className="space-y-1">
                                    <Label className="text-xs text-muted-foreground capitalize">{level.toLowerCase()}</Label>
                                    <Select defaultValue={currentPath?.id} onValueChange={(val) => handleLinkPath(level, val)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Path" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {learningPaths.filter(p => p.level === level).map(p => (
                                                <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )
                        })}
                    </div>
                )}

            </SheetContent>
        </Sheet>
    )
}
