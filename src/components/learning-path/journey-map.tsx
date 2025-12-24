"use client"

import { cn } from "@/lib/utils"
import { Check, Lock, Play } from "lucide-react"
import Link from "next/link"

interface JourneyMapProps {
    path: any // LearningPath with items
    completedTopicIds: string[]
}

export function JourneyMap({ path, completedTopicIds }: JourneyMapProps) {
    // Determine status for each item sequentially
    let isLocked = false;

    return (
        <div className="w-full py-8 overflow-x-auto">
            <div className="flex items-center min-w-max px-4">
                {path.items.map((item: any, index: number) => {
                    let allTopics: string[] = []
                    if (item.course) {
                        allTopics = item.course.modules.flatMap((m: any) => m.topics.map((t: any) => t.id))
                    } else if (item.module) {
                        allTopics = item.module.topics.map((t: any) => t.id)
                    }

                    // If no topics (empty course), treat as incomplete or handle gracefully
                    const isComplete = allTopics.length > 0 && allTopics.every(id => completedTopicIds.includes(id));

                    let status = "locked";
                    if (isComplete) {
                        status = "completed"
                    } else if (!isLocked) {
                        status = "active"
                        isLocked = true; // All subsequent items are locked
                    } else {
                        status = "locked"
                    }

                    const isLast = index === path.items.length - 1

                    const linkUrl = item.course
                        ? `/courses/${item.course.id}`
                        : item.module?.courseId
                            ? `/courses/${item.module.courseId}`
                            : "#";

                    const NodeContent = (
                        <div className="flex flex-col items-center gap-2 relative z-10 w-32 cursor-pointer transition-transform hover:scale-105">
                            <div className={cn(
                                "w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all duration-300",
                                status === "completed" && "bg-primary border-primary text-primary-foreground",
                                status === "active" && "bg-background border-primary text-primary shadow-[0_0_15px_rgba(59,130,246,0.5)]",
                                status === "locked" && "bg-muted border-muted-foreground/30 text-muted-foreground"
                            )}>
                                {status === "completed" && <Check className="w-6 h-6" />}
                                {status === "active" && <Play className="w-5 h-5 ml-1" />}
                                {status === "locked" && <Lock className="w-5 h-5" />}
                            </div>

                            <div className="text-center">
                                <p className={cn(
                                    "text-sm font-medium leading-tight",
                                    status === "locked" && "text-muted-foreground"
                                )}>
                                    {item.course?.title || item.module?.title}
                                </p>
                                <p className="text-[10px] text-muted-foreground mt-1">
                                    Step {index + 1}
                                </p>
                            </div>
                        </div>
                    );

                    return (
                        <div key={item.id} className="flex items-center group relative">
                            {/* Node */}
                            {status === "locked" ? (
                                <div>{NodeContent}</div>
                            ) : (
                                <Link href={linkUrl}>
                                    {NodeContent}
                                </Link>
                            )}

                            {/* Connector Line */}
                            {!isLast && (
                                <div className={cn(
                                    "h-1 w-16 -mx-4 -mt-8 z-0",
                                    status === "completed" ? "bg-primary" : "bg-muted-foreground/30"
                                )} />
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
