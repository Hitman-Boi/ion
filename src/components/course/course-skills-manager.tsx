"use client";

import { createSkill } from "@/app/actions/skills.actions";
import { updateCourseSkills } from "@/app/actions/course-editor.actions";
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown, Plus, Tag, Trash2, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";

interface CourseSkillsManagerProps {
    courseId: string;
    initialStatus: string[]; // Array of skill IDs
    allSkills: { id: string; name: string }[];
}

export function CourseSkillsManager({ courseId, initialStatus, allSkills }: CourseSkillsManagerProps) {
    const [open, setOpen] = useState(false);
    const [popoverOpen, setPopoverOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [isAdding, setIsAdding] = useState(false);
    const [isRemoving, setIsRemoving] = useState<string | null>(null);
    const [isCreating, setIsCreating] = useState(false);

    // Track selected skills with full objects
    const [selectedSkills, setSelectedSkills] = useState<{ id: string; name: string }[]>(
        allSkills.filter(skill => initialStatus.includes(skill.id))
    );
    const [availableSkills, setAvailableSkills] = useState(allSkills);

    const router = useRouter();

    // Skills not yet selected (for the combobox dropdown)
    const unselectedSkills = useMemo(() => {
        const selectedIds = new Set(selectedSkills.map(s => s.id));
        return availableSkills.filter(skill => !selectedIds.has(skill.id));
    }, [availableSkills, selectedSkills]);

    // Filter unselected skills based on search
    const filteredSkills = useMemo(() => {
        if (!searchQuery.trim()) return unselectedSkills;
        return unselectedSkills.filter(skill =>
            skill.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [unselectedSkills, searchQuery]);

    // Check if query matches any existing skill (for "Create" option visibility)
    const queryMatchesExisting = useMemo(() => {
        if (!searchQuery.trim()) return true;
        return availableSkills.some(
            skill => skill.name.toLowerCase() === searchQuery.toLowerCase()
        );
    }, [searchQuery, availableSkills]);

    const addSkill = async (skill: { id: string; name: string }) => {
        setIsAdding(true);
        const newSkills = [...selectedSkills, skill];
        setSelectedSkills(newSkills);
        setSearchQuery("");
        setPopoverOpen(false);

        try {
            await updateCourseSkills(courseId, newSkills.map(s => s.id));
            router.refresh();
        } catch (error) {
            console.error("Failed to add skill:", error);
            // Rollback on error
            setSelectedSkills(selectedSkills);
        } finally {
            setIsAdding(false);
        }
    };

    const removeSkill = async (skillId: string) => {
        setIsRemoving(skillId);
        const newSkills = selectedSkills.filter(s => s.id !== skillId);
        setSelectedSkills(newSkills);

        try {
            await updateCourseSkills(courseId, newSkills.map(s => s.id));
            router.refresh();
        } catch (error) {
            console.error("Failed to remove skill:", error);
            // Rollback on error
            setSelectedSkills(selectedSkills);
        } finally {
            setIsRemoving(null);
        }
    };

    const handleCreateSkill = async () => {
        if (!searchQuery.trim() || queryMatchesExisting) return;

        setIsCreating(true);
        try {
            const newSkill = await createSkill({ name: searchQuery.trim() });
            setAvailableSkills(prev => [...prev, newSkill].sort((a, b) => a.name.localeCompare(b.name)));
            setSearchQuery("");
            setPopoverOpen(false);

            // Immediately add to course
            const newSkills = [...selectedSkills, newSkill];
            setSelectedSkills(newSkills);
            await updateCourseSkills(courseId, newSkills.map(s => s.id));
            router.refresh();
        } catch (error) {
            console.error("Failed to create skill:", error);
            alert("Failed to create skill");
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="outline" className="gap-2">
                    <Tag className="h-4 w-4" />
                    Manage Skills
                </Button>
            </SheetTrigger>
            <SheetContent className="w-[400px] sm:w-[540px] flex flex-col h-full">
                <SheetHeader>
                    <SheetTitle>Course Skills</SheetTitle>
                    <SheetDescription>
                        Select the skills this course provides to students.
                    </SheetDescription>
                </SheetHeader>

                <div className="flex-1 flex flex-col gap-6 mt-6 overflow-hidden">
                    {/* Add Skill Section */}
                    <div className="space-y-4 border rounded-lg p-4 bg-muted/30">
                        <h3 className="text-sm font-medium flex items-center gap-2">
                            <Sparkles className="h-4 w-4" />
                            Add Skill
                        </h3>
                        <div className="space-y-2 flex flex-col">
                            <label htmlFor="select-skill" className="text-sm font-medium leading-none text-muted-foreground">
                                Search or Create Skill
                            </label>
                            <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                                <PopoverTrigger asChild>
                                    <Button
                                        id="select-skill"
                                        variant="outline"
                                        role="combobox"
                                        aria-expanded={popoverOpen}
                                        className="w-full justify-between"
                                        disabled={isAdding}
                                    >
                                        {isAdding ? "Adding..." : "Select skill..."}
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[350px] sm:w-[480px] p-0 z-[20000]" align="start">
                                    <Command shouldFilter={false}>
                                        <CommandInput
                                            placeholder="Search skills..."
                                            value={searchQuery}
                                            onValueChange={setSearchQuery}
                                        />
                                        <CommandList>
                                            <CommandEmpty>
                                                {searchQuery.trim() ? (
                                                    <span className="text-muted-foreground">
                                                        No skills found.
                                                    </span>
                                                ) : (
                                                    <span className="text-muted-foreground">
                                                        Start typing to search...
                                                    </span>
                                                )}
                                            </CommandEmpty>

                                            {filteredSkills.length > 0 && (
                                                <CommandGroup heading="Available Skills">
                                                    {filteredSkills.map((skill) => (
                                                        <CommandItem
                                                            key={skill.id}
                                                            value={skill.name}
                                                            onSelect={() => addSkill(skill)}
                                                            className="cursor-pointer"
                                                        >
                                                            <Check className="mr-2 h-4 w-4 opacity-0" />
                                                            {skill.name}
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            )}

                                            {searchQuery.trim() && !queryMatchesExisting && (
                                                <>
                                                    <CommandSeparator />
                                                    <CommandGroup>
                                                        <CommandItem
                                                            onSelect={handleCreateSkill}
                                                            className="cursor-pointer text-primary"
                                                            disabled={isCreating}
                                                        >
                                                            <Plus className="mr-2 h-4 w-4" />
                                                            {isCreating ? "Creating..." : `Create "${searchQuery.trim()}"`}
                                                        </CommandItem>
                                                    </CommandGroup>
                                                </>
                                            )}
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>

                    {/* Selected Skills List Section */}
                    <div className="flex-1 flex flex-col min-h-0">
                        <h3 className="text-sm font-medium mb-4">Selected Skills ({selectedSkills.length})</h3>
                        <ScrollArea className="flex-1 -mr-4 pr-4">
                            <div className="space-y-3 pb-6">
                                {selectedSkills.length === 0 ? (
                                    <p className="text-sm text-muted-foreground italic py-4 text-center">
                                        No skills selected. Use the search above to add skills.
                                    </p>
                                ) : (
                                    selectedSkills.map((skill) => (
                                        <div key={skill.id} className="flex items-center justify-between rounded-lg border p-3 shadow-sm bg-card">
                                            <div className="overflow-hidden">
                                                <p className="font-medium truncate text-sm">{skill.name}</p>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                                disabled={isRemoving === skill.id}
                                                onClick={() => removeSkill(skill.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                                <span className="sr-only">Remove skill</span>
                                            </Button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </ScrollArea>
                        <p className="text-[10px] text-muted-foreground mt-2">
                            Students missing these skills will have this course recommended to them.
                        </p>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
