"use client";

import { cn } from "@/lib/utils";
import { Module, Course, Topic, UserProgress } from "@prisma/client";
import { CheckCircle, ChevronLeft, ChevronRight, Lock, PlayCircle, Menu } from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"

interface CourseSidebarProps {
    course: Course & {
        modules: (Module & {
            topics: (Topic & {
                progress: UserProgress[];
            })[];
        })[];
    };
    progressCount: number; // Percentage or count
}

export const CourseSidebar = ({
    course,
    progressCount
}: CourseSidebarProps) => {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const isPreview = searchParams.get('preview') === 'true';
    const [isCollapsed, setIsCollapsed] = useState(false);

    // Keyboard shortcut Cmd+B
    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "b" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setIsCollapsed((prev) => !prev);
            }
        };
        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, []);

    if (isPreview) return null;

    // Auto-collapse logic handled by initial state = true.
    const toggleSidebar = () => setIsCollapsed(!isCollapsed);

    return (
        <div
            className={cn(
                "h-full flex flex-col border-r border-white/10 bg-[#0f1115] transition-all duration-300 ease-in-out relative",
                isCollapsed ? "w-[60px]" : "w-80"
            )}
        >
            {/* Header / Toggle */}
            <div className="h-14 flex items-center justify-between px-3 border-b border-white/10 shrink-0">
                {!isCollapsed && (
                    <h2 className="font-semibold text-white truncate max-w-[200px]" title={course.title}>
                        {course.title}
                    </h2>
                )}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleSidebar}
                    className="text-muted-foreground hover:text-white ml-auto"
                >
                    {isCollapsed ? <Menu className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
                </Button>
            </div>

            {/* Progress Block (Only shown when expanded) */}
            {!isCollapsed && (
                <div className="p-4 border-b border-white/10">
                    <div className="flex items-center justify-between mb-2 text-sm">
                        <span className="text-muted-foreground">Course Progress</span>
                        <span className="text-white font-medium">{Math.round(progressCount)}%</span>
                    </div>
                    <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-indigo-500 transition-all duration-500"
                            style={{ width: `${progressCount}%` }}
                        />
                    </div>
                </div>
            )}

            {/* Navigation Links */}
            <ScrollArea className="flex-1">
                <div className="flex flex-col gap-y-2 p-3">
                    {course.modules.map((module) => (
                        <div key={module.id} className="mb-4">
                            {!isCollapsed && (
                                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-2">
                                    {module.title}
                                </h3>
                            )}
                            <div className="space-y-1">
                                {module.topics.map((topic) => {
                                    const isActive = pathname?.includes(topic.id);
                                    const isCompleted = topic.progress?.[0]?.isTopicComplete;
                                    const isLocked = false; // Add specific lock logic if needed, e.g. previous lesson not complete

                                    return (
                                        <TooltipProvider key={topic.id} delayDuration={0}>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Link
                                                        href={`/courses/${course.id}/topic/${topic.id}`}
                                                        className={cn(
                                                            "flex items-center gap-x-2 text-sm font-medium px-2 py-2 rounded-md transition-colors group",
                                                            isActive
                                                                ? "bg-indigo-500/10 text-indigo-400"
                                                                : "text-slate-400 hover:text-white hover:bg-white/5",
                                                            isCollapsed && "justify-center px-0"
                                                        )}
                                                    >
                                                        <div className="shrink-0">
                                                            {isCompleted ? (
                                                                <CheckCircle
                                                                    className={cn(
                                                                        "w-4 h-4",
                                                                        isActive ? "text-indigo-400" : "text-emerald-500"
                                                                    )}
                                                                />
                                                            ) : isActive ? (
                                                                <PlayCircle className="w-4 h-4 text-indigo-400" />
                                                            ) : isLocked ? (
                                                                <Lock className="w-4 h-4 text-slate-500" />
                                                            ) : (
                                                                <div className="w-4 h-4 rounded-full border border-slate-600 group-hover:border-slate-400 transition-colors" />
                                                            )}
                                                        </div>
                                                        {!isCollapsed && (
                                                            <span className="truncate">{topic.title}</span>
                                                        )}
                                                    </Link>
                                                </TooltipTrigger>
                                                {isCollapsed && (
                                                    <TooltipContent side="right" className="bg-slate-900 border-slate-700 text-white">
                                                        <p>{topic.title}</p>
                                                    </TooltipContent>
                                                )}
                                            </Tooltip>
                                        </TooltipProvider>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </ScrollArea>
        </div>
    );
};
