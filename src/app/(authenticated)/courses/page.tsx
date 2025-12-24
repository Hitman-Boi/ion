import { getCourses } from "@/app/actions/courses.actions";
import { prisma as db } from "@/lib/prisma";
import { SearchInput } from "./_components/search-input";
import { TagFilter } from "./_components/tag-filter";
import { CourseCard } from "./_components/course-card";
import { BookDashed } from "lucide-react";

interface CoursesPageProps {
    searchParams: {
        term?: string;
        tag?: string;
    };
}

// Ensure this page is dynamic if needed (searchParams usually force dynamic rendering)
export const dynamic = "force-dynamic";

export default async function CoursesPage({
    searchParams,
}: CoursesPageProps) {
    // Fetch courses based on params
    const courses = await getCourses(searchParams);

    // Fetch all skills for the tag filter (could also optimize to only show used skills, 
    // but showing all available skills is good for discovery)
    const skills = await db.skill.findMany({
        orderBy: {
            name: "asc",
        },
        // select: { id: true, name: true } // optimization
    });

    return (
        <div className="p-6 md:p-8 space-y-8 min-h-screen bg-[#0f1115] text-white">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight mb-2">Browse Courses</h1>
                    <p className="text-muted-foreground">
                        Discover new skills and advance your career.
                    </p>
                </div>
                <SearchInput />
            </div>

            {/* Filters */}
            <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                    Filter by Topic
                </h3>
                <TagFilter items={skills} />
            </div>

            {/* Course Grid */}
            {courses.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                    <BookDashed className="h-14 w-14 mb-4 opacity-20" />
                    <p className="text-lg font-medium">No courses found</p>
                    <p className="text-sm">Try adjusting your search or filters.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {courses.map((course) => (
                        <CourseCard key={course.id} course={course} />
                    ))}
                </div>
            )}
        </div>
    );
}
