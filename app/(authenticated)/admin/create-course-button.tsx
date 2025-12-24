"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createCourse } from "@/app/actions/admin"
import { Button } from "@/components/ui/button"
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"

export function CreateCourseButton() {
    const [open, setOpen] = useState(false)
    const [title, setTitle] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault()
        setIsLoading(true)
        try {
            const courseId = await createCourse(title)
            setOpen(false)
            router.push(`/studio/${courseId}`)
        } catch (error) {
            console.error("Failed to create course", error)
            alert("Failed to create course. Please check the console for details.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button size="sm" variant="outline" className="gap-2">
                    Create Course
                </Button>
            </SheetTrigger>
            <SheetContent>
                <SheetHeader>
                    <SheetTitle>Create New Course</SheetTitle>
                    <SheetDescription>
                        Give your course a title to get started. You can change this later.
                    </SheetDescription>
                </SheetHeader>
                <form onSubmit={onSubmit} className="space-y-4 mt-4">
                    <div className="space-y-2">
                        <label htmlFor="title" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            Course Title
                        </label>
                        <input
                            id="title"
                            autoComplete="off"
                            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g. Introduction to Web Development"
                            required
                        />
                    </div>
                    <div className="flex justify-end">
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? "Creating..." : "Create Course"}
                        </Button>
                    </div>
                </form>
            </SheetContent>
        </Sheet>
    )
}
