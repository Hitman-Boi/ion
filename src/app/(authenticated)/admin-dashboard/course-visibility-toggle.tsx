"use client"

import { toggleCourseVisibility } from "@/app/actions/admin.actions"
import { Button } from "@/components/ui/button"
import { Globe, Lock } from "lucide-react"

interface CourseVisibilityToggleProps {
    courseId: string
    isPublic: boolean
}

export function CourseVisibilityToggle({ courseId, isPublic }: CourseVisibilityToggleProps) {
    return (
        <form action={async () => {
            await toggleCourseVisibility(courseId, !isPublic)
        }}>
            <Button
                size="sm"
                variant={isPublic ? "outline" : "default"}
                className="gap-2"
            >
                {isPublic ? <Lock className="h-4 w-4" /> : <Globe className="h-4 w-4" />}
                {isPublic ? "Make Private" : "Make Public"}
            </Button>
        </form>
    )
}
