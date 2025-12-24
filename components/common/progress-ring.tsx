"use client";

import { cn } from "@/lib/utils";
import { Check, FileText, Play, HelpCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ProgressRingProps {
    videoCompleted: boolean;
    pdfCompleted: boolean;
    quizPassed: boolean;
    className?: string;
}

export function ProgressRing({ videoCompleted, pdfCompleted, quizPassed, className }: ProgressRingProps) {
    // Simple visualization: 3 segments or just a summary icon? 
    // PRD says: "visualize Video, PDF, and Quiz as a unified dashboard" and "Visual Progress Ring... State is derived purely from PostgreSQL data".
    // Let's make a ring with 3 segments.

    const total = 3;
    const completed = (videoCompleted ? 1 : 0) + (pdfCompleted ? 1 : 0) + (quizPassed ? 1 : 0);
    const percentage = (completed / total) * 100;

    // Colors
    const videoColor = videoCompleted ? "text-green-500" : "text-muted-foreground/30";
    const pdfColor = pdfCompleted ? "text-green-500" : "text-muted-foreground/30";
    const quizColor = quizPassed ? "text-green-500" : "text-muted-foreground/30";

    return (
        <div className={cn("flex items-center gap-2", className)}>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <div className="relative flex items-center justify-center w-10 h-10 rounded-full border-2 border-muted">
                            <svg className="absolute w-full h-full -rotate-90" viewBox="0 0 36 36">
                                {/* Background Circle */}
                                <path
                                    className="text-muted/20"
                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="3"
                                />
                                {/* Progress Circle */}
                                <path
                                    className={cn("text-primary transition-all duration-500", completed === 3 && "text-green-500")}
                                    strokeDasharray={`${percentage}, 100`}
                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="3"
                                />
                            </svg>
                            <div className="text-[10px] font-bold">
                                {Math.round(percentage)}%
                            </div>
                        </div>
                    </TooltipTrigger>
                    <TooltipContent>
                        <div className="flex flex-col gap-1 text-xs">
                            <div className="flex items-center gap-2">
                                <Play size={12} className={videoColor} /> Video: {videoCompleted ? "Done" : "Pending"}
                            </div>
                            <div className="flex items-center gap-2">
                                <FileText size={12} className={pdfColor} /> PDF: {pdfCompleted ? "Done" : "Pending"}
                            </div>
                            <div className="flex items-center gap-2">
                                <HelpCircle size={12} className={quizColor} /> Quiz: {quizPassed ? "Passed" : "Pending"}
                            </div>
                        </div>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </div>
    );
}
