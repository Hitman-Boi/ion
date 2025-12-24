import { auth } from "@/auth";
import { getCourseById } from "@/app/actions/get-courses";
import { redirect } from "next/navigation";
import { CourseSidebar } from "./_components/CourseSidebar";

export default async function LearnLayout({
    children,
    params
}: {
    children: React.ReactNode;
    params: { courseId: string };
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

    // Calculate progress
    // Count total topics
    let totalTopics = 0;
    let completedTopics = 0;

    course.chapters.forEach(chapter => {
        chapter.topics.forEach(topic => {
            totalTopics++;
            if (topic.progress && topic.progress.length > 0 && topic.progress[0].isTopicComplete) {
                completedTopics++;
            }
        });
    });

    const progressPercentage = totalTopics === 0 ? 0 : (completedTopics / totalTopics) * 100;

    return (
        <div className="h-full flex overflow-hidden bg-[#0f1115]">
            {/* Sidebar */}
            <CourseSidebar
                course={course}
                progressCount={progressPercentage}
            />

            {/* Main Content */}
            <main className="flex-1 h-full overflow-y-auto">
                {children}
            </main>
        </div>
    );
}
