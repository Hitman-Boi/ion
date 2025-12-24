import { prisma } from "@/lib/prisma";
import { CourseBlockEditor } from "@/components/studio/course-block-editor";
import { notFound } from "next/navigation";

export default async function BlockEditPage({
    params
}: {
    params: { courseId: string; blockId: string }
}) {
    const block = await prisma.courseBlock.findUnique({
        where: { id: params.blockId },
    });

    if (!block || block.courseId !== params.courseId) {
        notFound();
    }

    return <CourseBlockEditor block={block} />;
}
