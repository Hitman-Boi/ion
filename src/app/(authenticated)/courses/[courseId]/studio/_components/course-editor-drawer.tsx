'use client'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet"
import { Textarea } from "@/components/ui/textarea"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import { updateCourseDetails } from "@/app/actions/course-editor.actions"

interface CourseEditorDrawerProps {
    courseId: string
    initialTitle: string
    initialDescription: string
    open: boolean
    onOpenChange: (open: boolean) => void
    onDetailsUpdate: (newTitle: string, newDescription: string) => void
}

export function CourseEditorDrawer({
    courseId,
    initialTitle,
    initialDescription,
    open,
    onOpenChange,
    onDetailsUpdate
}: CourseEditorDrawerProps) {
    const [title, setTitle] = useState(initialTitle)
    const [description, setDescription] = useState(initialDescription)
    const [isLoading, setIsLoading] = useState(false)

    // Reset details when drawer opens
    useEffect(() => {
        if (open) {
            setTitle(initialTitle)
            setDescription(initialDescription)
        }
    }, [open, initialTitle, initialDescription])

    const handleSave = async () => {
        if (!title.trim()) {
            toast.error("Course title is required")
            return
        }

        setIsLoading(true)
        try {
            await updateCourseDetails(courseId, { title, description })
            onDetailsUpdate(title, description)
            toast.success("Course details updated")
            onOpenChange(false)
        } catch (error) {
            console.error("Failed to update course details:", error)
            toast.error("Failed to update course details")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent>
                <SheetHeader>
                    <SheetTitle>Edit Course Details</SheetTitle>
                    <SheetDescription>
                        Update the title and description for this course.
                    </SheetDescription>
                </SheetHeader>

                <div className="py-6 space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Course Title</label>
                        <Input
                            placeholder="Data Structures & Algorithms"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Description</label>
                        <Textarea
                            placeholder="Enter course description..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="min-h-[200px]"
                        />
                    </div>
                </div>

                <SheetFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={isLoading}>
                        {isLoading ? "Saving..." : "Save Changes"}
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    )
}
