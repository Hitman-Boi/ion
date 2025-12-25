"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { LearningPath, PathLevel } from "@prisma/client" // Ensure enums are generated
import { Map, Plus } from "lucide-react"

interface LearningPathsListProps {
    paths: (LearningPath & { items: any[] })[]
    onSelectPath: (path: any) => void
    onCreatePath: () => void
}

// Helper for badge color
const getLevelBadge = (level: PathLevel) => {
    switch (level) {
        case "BEGINNER": return "bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-300"
        case "INTERMEDIATE": return "bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300"
        case "ADVANCED": return "bg-purple-100 text-purple-800 hover:bg-purple-100 dark:bg-purple-900/30 dark:text-purple-300"
        default: return "bg-gray-100 text-gray-800"
    }
}

export function LearningPathsList({ paths, onSelectPath, onCreatePath }: LearningPathsListProps) {
    return (
        <div className="flex flex-col h-full">
            <div className="p-4 border-b flex items-center justify-between bg-muted/30">
                <h3 className="font-semibold flex items-center gap-2">
                    <Map className="w-4 h-4" />
                    Learning Paths
                </h3>
                <Button size="sm" onClick={onCreatePath}>
                    <Plus className="w-4 h-4 mr-1" />
                    New Path
                </Button>
            </div>
            <ScrollArea className="flex-1 bg-muted/10">
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {paths.length === 0 && (
                        <div className="col-span-full text-center py-12 text-muted-foreground text-sm">
                            No learning paths found. Create one to get started.
                        </div>
                    )}
                    {paths.map((path) => (
                        <Card
                            key={path.id}
                            className="cursor-pointer hover:shadow-md transition-all border-dashed border-transparent hover:border-primary/20"
                            onClick={() => onSelectPath(path)}
                        >
                            <CardHeader className="p-4 space-y-2">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                        <CardTitle className="text-sm font-medium">{path.title}</CardTitle>
                                        <Badge variant="secondary" className={`text-[10px] ${getLevelBadge(path.level)}`}>
                                            {path.level}
                                        </Badge>
                                    </div>
                                    <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                                        {path.items.length} steps
                                    </span>
                                </div>
                                <p className="text-xs text-muted-foreground line-clamp-2">
                                    {path.description || "No description provided."}
                                </p>
                            </CardHeader>
                        </Card>
                    ))}
                </div>
            </ScrollArea>
        </div>
    )
}
