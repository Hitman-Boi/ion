import { auth } from "@/auth";
import { getCourseById } from "@/app/actions/get-courses";
import { redirect } from "next/navigation";
import { EnrollButton } from "./_components/enroll-button";
import { CheckCircle, PlayCircle, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default async function CourseIdPage({
    params
}: {
    params: { courseId: string }
}) {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
        return redirect("/login");
    }

    const course = await getCourseById(params.courseId, userId);

    if (!course) {
        return redirect("/courses");
    }

    const isEnrolled = course.enrollments && course.enrollments.length > 0;

    // Find first incomplete topic for "Continue Learning"
    let nextTopicId = null;
    let firstTopicId = null;

    if (course.chapters.length > 0 && course.chapters[0].topics.length > 0) {
        firstTopicId = course.chapters[0].topics[0].id;

        if (isEnrolled) {
            // Flatten topics to search easily
            const allTopics = course.chapters.flatMap(c => c.topics);
            const incompleteTopic = allTopics.find(t =>
                !t.progress || t.progress.length === 0 || !t.progress[0].isTopicComplete
            );
            nextTopicId = incompleteTopic ? incompleteTopic.id : allTopics[allTopics.length - 1].id;
        }
    }

    return (
        <div className="flex flex-col min-h-screen bg-[#0f1115] text-white">
            {/* Hero Section */}
            <div className="relative bg-gradient-to-b from-indigo-900/20 to-[#0f1115] pt-10 pb-10 px-6 md:px-10 border-b border-white/5">
                <div className="max-w-5xl mx-auto space-y-6">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            {course.skills.map((skill) => (
                                <Badge key={skill.id} variant="secondary" className="bg-white/10 text-white/80 border-0">
                                    {skill.name}
                                </Badge>
                            ))}
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white">{course.title}</h1>
                        <p className="text-xl text-muted-foreground max-w-3xl leading-relaxed">
                            {course.description}
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-4">
                        <div className="flex items-center gap-3 mr-6">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-sm font-bold">
                                {course.instructor.name?.[0] || "I"}
                            </div>
                            <div>
                                <p className="text-sm font-medium text-white">Instructor</p>
                                <p className="text-sm text-muted-foreground">{course.instructor.name}</p>
                            </div>
                        </div>

                        {isEnrolled ? (
                            <Button asChild size="lg" className="w-full sm:w-auto bg-white text-black hover:bg-white/90 font-semibold gap-2">
                                <Link href={`/courses/${course.id}/learn/${nextTopicId || firstTopicId}`}>
                                    <PlayCircle className="w-5 h-5" />
                                    {nextTopicId ? "Continue Learning" : "Start Learning"}
                                </Link>
                            </Button>
                        ) : (
                            <EnrollButton courseId={course.id} />
                        )}
                    </div>
                </div>
            </div>

            {/* Course Content */}
            <div className="flex-1 px-6 md:px-10 py-10">
                <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-10">
                    <div className="col-span-1 lg:col-span-2 space-y-8">
                        <div>
                            <h2 className="text-2xl font-bold mb-6">Course Content</h2>
                            <div className="space-y-4">
                                {course.chapters.map((chapter) => (
                                    <div key={chapter.id} className="border border-white/10 rounded-lg overflow-hidden bg-white/5">
                                        <div className="px-4 py-3 bg-white/5 border-b border-white/5 flex items-center justify-between">
                                            <h3 className="font-medium text-white">{chapter.title}</h3>
                                            <span className="text-xs text-muted-foreground">{chapter.topics.length} topics</span>
                                        </div>
                                        <div>
                                            {chapter.topics.map((topic) => {
                                                const isCompleted = isEnrolled && topic.progress && topic.progress.length > 0 && topic.progress[0].isTopicComplete;

                                                return (
                                                    <div
                                                        key={topic.id}
                                                        className={cn(
                                                            "flex items-center gap-3 px-4 py-3 border-b border-white/5 last:border-0 transition-colors",
                                                            isEnrolled ? "hover:bg-white/5 cursor-pointer" : "opacity-70"
                                                        )}
                                                    >
                                                        {isEnrolled ? (
                                                            isCompleted ? (
                                                                <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
                                                            ) : (
                                                                <PlayCircle className="w-5 h-5 text-muted-foreground shrink-0" />
                                                            )
                                                        ) : (
                                                            <Lock className="w-4 h-4 text-muted-foreground shrink-0" />
                                                        )}

                                                        {isEnrolled ? (
                                                            <Link href={`/courses/${course.id}/learn/${topic.id}`} className="flex-1 text-sm text-white/90 hover:text-white">
                                                                {topic.title}
                                                            </Link>
                                                        ) : (
                                                            <span className="flex-1 text-sm text-white/90">{topic.title}</span>
                                                        )}

                                                        {/* Optional: Show duration or resource types */}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="col-span-1 space-y-6">
                        {/* Sidebar for stats or other info */}
                        <div className="p-6 rounded-xl border border-white/10 bg-white/5 space-y-4">
                            <h3 className="font-semibold text-white">Course Features</h3>
                            <ul className="space-y-3 text-sm text-muted-foreground">
                                <li className="flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 text-indigo-400" />
                                    <span>{course.chapters.reduce((acc, c) => acc + c.topics.length, 0)} bite-sized lessons</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 text-indigo-400" />
                                    <span>Self-paced learning</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 text-indigo-400" />
                                    <span>Progress tracking</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

