import { CourseBlock } from "@prisma/client";
import { VideoPlayer } from "./blocks/video-player";
import { SanitizedHtml } from "./blocks/sanitized-html";
import { AssessmentBlock } from "./blocks/assessment-block";

export function BlockRenderer({ block }: { block: CourseBlock }) {
    const content = block.content as any;

    switch (block.blockType) {
        case 'video':
            if (content.localPath) {
                return (
                    <div className="aspect-video w-full bg-black rounded-lg overflow-hidden">
                        <video
                            src={content.localPath}
                            controls
                            controlsList="nodownload"
                            className="w-full h-full"
                            onContextMenu={(e) => e.preventDefault()}
                        />
                    </div>
                );
            }
            return <VideoPlayer playbackId={content.playbackId} />;
        case 'pdf':
            return (
                <div className="w-full h-[800px] border rounded-lg overflow-hidden">
                    <iframe
                        src={`${content.localPath}#toolbar=0`}
                        className="w-full h-full"
                    />
                </div>
            );
        case 'html':
        case 'chapter': // Chapter might just render children or a header, for now treat as HTML or nothing
            return <SanitizedHtml content={content.html || ''} />;
        case 'problem':
        case 'quiz':
            return <AssessmentBlock block={block} />;
        default:
            return (
                <div className="p-4 border border-dashed rounded text-muted-foreground">
                    Unknown block type: {block.blockType}
                </div>
            );
    }
}
