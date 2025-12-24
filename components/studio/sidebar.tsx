"use client";

import { CourseBlock } from "@prisma/client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createBlock } from "@/app/actions/course";

interface SidebarProps {
    blocks: CourseBlock[];
    courseId: string;
}

export function Sidebar({ blocks, courseId }: SidebarProps) {
    const router = useRouter();
    const [isCreating, setIsCreating] = useState(false);

    const handleAddContent = async () => {
        setIsCreating(true);
        try {
            // Create a new chapter by default at the root level
            const newBlock = await createBlock(courseId, null, "chapter");
            router.push(`/studio/${courseId}/${newBlock.id}`);
        } catch (error) {
            console.error("Failed to create block:", error);
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <div className="h-full flex flex-col">
            <div className="p-4 border-b">
                <h2 className="font-semibold text-lg">Course Outline</h2>
            </div>
            <ScrollArea className="flex-1">
                <div className="p-4 space-y-2">
                    {blocks.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No content yet.</p>
                    ) : (
                        blocks.map((block) => (
                            <div
                                key={block.id}
                                className="p-2 border rounded-md hover:bg-accent cursor-pointer"
                                onClick={() => router.push(`/studio/${courseId}/${block.id}`)}
                            >
                                <div className="font-medium text-sm">{block.displayName}</div>
                                <div className="text-xs text-muted-foreground">{block.blockType}</div>
                            </div>
                        ))
                    )}
                </div>
            </ScrollArea>
            <div className="p-4 border-t">
                <Button
                    className="w-full"
                    variant="outline"
                    onClick={handleAddContent}
                    disabled={isCreating}
                >
                    {isCreating ? "Creating..." : "Add Content"}
                </Button>
            </div>
        </div>
    );
}
