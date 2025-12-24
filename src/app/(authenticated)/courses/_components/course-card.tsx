import { CourseWithDetails } from "@/app/actions/courses.actions";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Users } from "lucide-react";
import Link from "next/link";

interface CourseCardProps {
    course: CourseWithDetails;
}

export const CourseCard = ({ course }: CourseCardProps) => {
    return (
        <Link href={`/courses/${course.id}`} className="block h-full transition-transform hover:scale-[1.02]">
            <Card className="h-full overflow-hidden border-white/10 bg-black/20 backdrop-blur-sm hover:bg-black/30 transition-colors">
                {/* Placeholder for Image - in a real app potentially use a cover image field */}
                <div className="aspect-video w-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center">
                    <BookOpen className="h-12 w-12 text-white/20" />
                </div>

                <CardHeader className="p-4">
                    <CardTitle className="line-clamp-2 text-lg font-semibold text-white">
                        {course.title}
                    </CardTitle>
                    <div className="flex flex-wrap gap-2 mt-2">
                        {course.skills.slice(0, 3).map((skill) => (
                            <Badge key={skill.id} variant="secondary" className="text-xs bg-white/10 text-white/80 hover:bg-white/20 border-0">
                                {skill.name}
                            </Badge>
                        ))}
                        {course.skills.length > 3 && (
                            <Badge variant="secondary" className="text-xs bg-white/10 text-white/80 border-0">
                                +{course.skills.length - 3}
                            </Badge>
                        )}
                    </div>
                </CardHeader>

                <CardContent className="p-4 pt-0">
                    <p className="line-clamp-2 text-sm text-muted-foreground">
                        {course.description || "No description available."}
                    </p>
                </CardContent>

                <CardFooter className="p-4 pt-0 w-full flex items-center justify-between text-xs text-muted-foreground mt-auto">
                    <div className="flex items-center gap-1">
                        <span className="font-medium text-white/70">{course.instructor.name || "Instructor"}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                            <BookOpen className="h-3 w-3" />
                            <span>{course._count?.chapters || 0} Chapters</span>
                        </div>
                        {/* Optional: Add student count if available */}
                        {/* <div className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    <span>{course._count?.enrollments || 0}</span>
                </div> */}
                    </div>
                </CardFooter>
            </Card>
        </Link>
    );
};
