"use client"

import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Course } from "@prisma/client"
import { Search } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

type CourseWithEnrollments = Course & {
    enrollments: { role: string }[]
}

interface CoursesListProps {
    courses: CourseWithEnrollments[]
}

export function CoursesList({ courses }: CoursesListProps) {
    const [searchQuery, setSearchQuery] = useState("")

    const filteredCourses = courses.filter((course) =>
        course.title.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="h-full flex flex-col p-6">
            <div className="mb-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-1">
                    <h2 className="text-xl font-bold">Courses</h2>
                    <div className="relative max-w-sm flex-1">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search courses..."
                            className="pl-8"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </div>
            <ScrollArea className="flex-1">
                <div className="space-y-4">
                    {filteredCourses.map((course) => {
                        const studentCount = course.enrollments.filter(e => e.role === "STUDENT").length
                        const instructorCount = course.enrollments.filter(e => e.role === "INSTRUCTOR").length
                        const moderatorCount = course.enrollments.filter(e => e.role === "MODERATOR").length

                        return (
                            <Link
                                key={course.id}
                                href={`/admin/courses/${course.id}`}
                                className="block"
                            >
                                <div className="rounded-lg border p-4 shadow-sm hover:bg-accent/50 transition-colors">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-semibold">{course.title}</h3>
                                            {course.deletedAt ? (
                                                <Badge variant="destructive" className="text-xs px-2 py-0">
                                                    Deleted
                                                </Badge>
                                            ) : (
                                                <Badge variant={course.isPublic ? "default" : "secondary"} className="text-xs px-2 py-0">
                                                    {course.isPublic ? "Public" : "Private"}
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="flex gap-3 text-xs text-muted-foreground">
                                            {studentCount > 0 && <span>{studentCount} Students</span>}
                                            {instructorCount > 0 && <span>{instructorCount} Instructors</span>}
                                            {moderatorCount > 0 && <span>{moderatorCount} Moderators</span>}
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        )
                    })}
                    {filteredCourses.length === 0 && (
                        <div className="text-center text-muted-foreground py-8">
                            No courses found matching &quot;{searchQuery}&quot;
                        </div>
                    )}
                </div>
            </ScrollArea>
        </div>
    )
}
