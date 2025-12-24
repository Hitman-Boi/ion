"use client"

import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription
} from "@/components/ui/sheet"
import { PathBuilder } from "../../_components/path-builder" // Reusing
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { createLearningPath, updateLearningPath } from "@/app/actions/learning-paths.actions"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
interface PathEditorSheetProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    path: any | null
    allCourses: any[]
    onSave: () => void
}

const formSchema = z.object({
    title: z.string().min(2),
    level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"])
})

export function PathEditorSheet({ open, onOpenChange, path, allCourses, onSave }: PathEditorSheetProps) {
    const router = useRouter()
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
            level: "BEGINNER"
        }
    })

    // Reset form when opening
    useEffect(() => {
        if (path) {
            form.reset({
                title: path.title,
                level: path.level || "BEGINNER"
            })
        } else {
            form.reset({ title: "", level: "BEGINNER" })
        }
    }, [path, form])

    const isEditing = !!path;

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            if (isEditing) {
                await updateLearningPath(path.id, values)
                toast.success("Path updated")
            } else {
                await createLearningPath(values)
                toast.success("Path created")
            }
            onSave()
            if (!isEditing) onOpenChange(false) // Close on create, but maybe stay on edit? Or just close.
            router.refresh()
        } catch (error) {
            toast.error("Failed to save path")
        }
    }

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
                <SheetHeader>
                    <SheetTitle>{path ? `Edit Path: ${path.title}` : "Create New Learning Path"}</SheetTitle>
                    <SheetDescription>
                        {path ? "Manage content or update details." : "Define the path details first."}
                    </SheetDescription>
                </SheetHeader>

                {!path ? (
                    <Form {...form}>
                        {/* Create Mode: Just the Form */}
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-6">
                            <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Path Title</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g. React Fundamentals" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="level"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Difficulty Level</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select level" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="BEGINNER">Beginner</SelectItem>
                                                <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                                                <SelectItem value="ADVANCED">Advanced</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" className="w-full">Create & Start Building</Button>
                        </form>
                    </Form>
                ) : (
                    <Tabs defaultValue="content" className="mt-6">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="content">Content Builder</TabsTrigger>
                            <TabsTrigger value="settings">Settings</TabsTrigger>
                        </TabsList>
                        <TabsContent value="content" className="h-[calc(100vh-250px)]">
                            <PathBuilder learningPath={path} allCourses={allCourses} />
                        </TabsContent>
                        <TabsContent value="settings">
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
                                    <FormField
                                        control={form.control}
                                        name="title"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Path Title</FormLabel>
                                                <FormControl>
                                                    <Input {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="level"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Difficulty Level</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select level" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="BEGINNER">Beginner</SelectItem>
                                                        <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                                                        <SelectItem value="ADVANCED">Advanced</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <Button type="submit" className="w-full">Save Changes</Button>
                                </form>
                            </Form>
                        </TabsContent>
                    </Tabs>
                )}
            </SheetContent>
        </Sheet>
    )
}
