import { CourseService } from "@/server/services/course-service";
import { Sidebar } from "@/components/studio/sidebar";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";

import { notFound } from "next/navigation";

export default async function StudioLayout({
    children,
    params
}: {
    children: React.ReactNode;
    params: { courseId: string };
}) {
    // Validate UUID to prevent database crash
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(params.courseId)) {
        notFound();
    }
    const blocks = await CourseService.getCourseStructure(params.courseId);

    return (
        <div className="h-screen w-full overflow-hidden bg-background">
            <ResizablePanelGroup direction="horizontal">
                <ResizablePanel defaultSize={20} minSize={15} maxSize={30} className="border-r">
                    <Sidebar blocks={blocks} courseId={params.courseId} />
                </ResizablePanel>
                <ResizableHandle />
                <ResizablePanel defaultSize={80}>
                    {children}
                </ResizablePanel>
            </ResizablePanelGroup>
        </div>
    );
}
