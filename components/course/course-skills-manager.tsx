"use client";

import { updateCourseSkills } from "@/app/actions/course-editor.actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Check, Tag } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface CourseSkillsManagerProps {
    courseId: string;
    initialStatus: string[]; // Array of skill IDs
    allSkills: { id: string; name: string }[];
}

export function CourseSkillsManager({ courseId, initialStatus, allSkills }: CourseSkillsManagerProps) {
    const [selectedSkillIds, setSelectedSkillIds] = useState<string[]>(initialStatus);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const router = useRouter();

    const toggleSkill = (skillId: string) => {
        setSelectedSkillIds(prev =>
            prev.includes(skillId)
                ? prev.filter(id => id !== skillId)
                : [...prev, skillId]
        );
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            await updateCourseSkills(courseId, selectedSkillIds);
            router.refresh();
            setOpen(false);
        } catch (error) {
            console.error("Failed to update course skills:", error);
            alert("Failed to update skills");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                    <Tag className="h-4 w-4" />
                    Manage Skills
                </Button>
            </SheetTrigger>
            <SheetContent className="w-[400px] sm:w-[540px]">
                <SheetHeader>
                    <SheetTitle>Course Skills</SheetTitle>
                    <SheetDescription>
                        Select the skills that this course provides to students.
                    </SheetDescription>
                </SheetHeader>
                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <Label>Skills Provided</Label>
                        <div className="border rounded-md p-3 max-h-[60vh] overflow-y-auto">
                            <div className="flex flex-wrap gap-2">
                                {allSkills.map((skill) => {
                                    const isSelected = selectedSkillIds.includes(skill.id);
                                    return (
                                        <Badge
                                            key={skill.id}
                                            variant={isSelected ? "default" : "outline"}
                                            className="cursor-pointer hover:bg-primary/90 transition-colors"
                                            onClick={() => toggleSkill(skill.id)}
                                        >
                                            {skill.name}
                                            {isSelected ? <Check className="ml-1 h-3 w-3" /> : <span className="ml-1 opacity-0 w-3 inline-block" />}
                                        </Badge>
                                    );
                                })}
                                {allSkills.length === 0 && (
                                    <p className="text-xs text-muted-foreground italic">No skills defined in the system.</p>
                                )}
                            </div>
                        </div>
                        <p className="text-[10px] text-muted-foreground">Students missing these skills will have this course recommended to them.</p>
                    </div>
                </div>
                <div className="flex justify-end mt-4">
                    <Button onClick={handleSave} disabled={loading}>
                        {loading ? "Saving..." : "Save Changes"}
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    );
}
