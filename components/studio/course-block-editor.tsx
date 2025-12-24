"use client";

import { useState } from "react";
import { CourseBlock } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateBlock } from "@/app/actions/course";
import { useRouter } from "next/navigation";

interface CourseBlockEditorProps {
    block: CourseBlock;
}

export function CourseBlockEditor({ block }: CourseBlockEditorProps) {
    const [displayName, setDisplayName] = useState(block.displayName);
    const [blockType, setBlockType] = useState(block.blockType);
    const [content, setContent] = useState<any>(block.content || {});
    const [uploading, setUploading] = useState(false);
    const router = useRouter();

    const handleSave = async () => {
        await updateBlock(block.id, {
            displayName,
            blockType,
            content,
        });
        router.refresh();
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append("file", file);
        formData.append("courseId", block.courseId);

        try {
            const res = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });

            if (!res.ok) throw new Error("Upload failed");

            const data = await res.json();
            setContent({
                ...content,
                localPath: data.url,
                mimeType: data.mimeType,
                originalName: data.fileName,
                size: data.size
            });
        } catch (error) {
            console.error(error);
            alert("Upload failed");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="p-6 max-w-2xl mx-auto space-y-6">
            <div className="space-y-2">
                <h2 className="text-2xl font-bold">Edit Block</h2>
                <p className="text-muted-foreground">Configure the content for this learning block.</p>
            </div>

            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="displayName">Display Name</Label>
                    <Input
                        id="displayName"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="blockType">Block Type</Label>
                    <select
                        id="blockType"
                        className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={blockType}
                        onChange={(e) => setBlockType(e.target.value)}
                    >
                        <option value="chapter">Chapter</option>
                        <option value="video">Video</option>
                        <option value="pdf">PDF</option>
                        <option value="quiz">Quiz</option>
                    </select>
                </div>

                {(blockType === "video" || blockType === "pdf") && (
                    <div className="space-y-2">
                        <Label>Content Upload</Label>
                        <div className="border-2 border-dashed rounded-lg p-6 text-center hover:bg-accent/50 transition-colors">
                            <Input
                                type="file"
                                accept={blockType === "video" ? "video/*" : "application/pdf"}
                                onChange={handleFileUpload}
                                disabled={uploading}
                                className="hidden"
                                id="file-upload"
                            />
                            <Label htmlFor="file-upload" className="cursor-pointer block w-full h-full">
                                {uploading ? "Uploading..." : "Click to upload file"}
                            </Label>
                        </div>
                        {content.localPath && (
                            <div className="text-sm text-green-600 mt-2">
                                File uploaded: {content.originalName}
                            </div>
                        )}
                    </div>
                )}

                <Button onClick={handleSave} disabled={uploading}>
                    Save Changes
                </Button>
            </div>
        </div>
    );
}
