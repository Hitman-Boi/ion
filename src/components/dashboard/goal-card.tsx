"use client"

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Compass, Trophy, AlertCircle, CheckCircle2, X } from "lucide-react"
import Link from "next/link"
import { removeTargetRole } from "@/app/actions/user-goals.actions"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface GoalCardProps {
    roleId: string
    title: string
    description?: string | null
    progress: number
    activePath?: {
        id: string
        title: string
    }
    skillAnalysis: {
        acquired: string[]
        missing: string[]
    }
}

export function GoalCard({ roleId, title, description, progress, activePath, skillAnalysis }: GoalCardProps) {
    const router = useRouter()

    const handleRemoveGoal = async () => {
        try {
            await removeTargetRole(roleId)
            toast.success("Goal removed")
            router.refresh()
        } catch (error) {
            toast.error("Failed to remove goal")
        }
    }

    return (
        <Card className="flex flex-col h-full relative group">
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive" onClick={handleRemoveGoal}>
                    <X className="h-4 w-4" />
                </Button>
            </div>
            <CardHeader className="pb-3">
                <div className="flex items-center gap-2 mb-1">
                    <Compass className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">{title}</CardTitle>
                </div>
                {description && <p className="text-sm text-muted-foreground line-clamp-1">{description}</p>}
            </CardHeader>
            <CardContent className="flex-1 space-y-6">
                {/* Progress Section */}
                <div className="space-y-2">
                    <div className="flex justify-between text-sm font-medium">
                        <span>Progress</span>
                        <span>{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                </div>

                {/* Integrated Skill Gap Analysis */}
                <div className="space-y-3">
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                        Skill Gap Analysis
                    </h4>

                    <div className="grid grid-cols-1 gap-3">
                        {/* Missing Skills (Focus first) */}
                        {skillAnalysis.missing.length > 0 && (
                            <div className="space-y-1.5">
                                <div className="text-xs text-muted-foreground flex items-center gap-1">
                                    <AlertCircle className="h-3 w-3 text-amber-500" />
                                    <span>To Learn:</span>
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                    {skillAnalysis.missing.map(skill => (
                                        <Badge key={skill} variant="outline" className="text-xs border-dashed border-amber-200 text-amber-900 bg-amber-50 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-800">
                                            {skill}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Acquired Skills */}
                        {skillAnalysis.acquired.length > 0 && (
                            <div className="space-y-1.5">
                                <div className="text-xs text-muted-foreground flex items-center gap-1">
                                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                                    <span>Acquired:</span>
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                    {skillAnalysis.acquired.map(skill => (
                                        <Badge key={skill} variant="secondary" className="text-xs bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                                            {skill}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}

                        {skillAnalysis.missing.length === 0 && skillAnalysis.acquired.length === 0 && (
                            <span className="text-xs text-muted-foreground italic">No skills defined for this role yet.</span>
                        )}
                        {skillAnalysis.missing.length === 0 && skillAnalysis.acquired.length > 0 && (
                            <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 mt-2">
                                <Trophy className="h-4 w-4" />
                                <span className="font-medium">All skills acquired!</span>
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
            <CardFooter className="pt-2">
                {activePath ? (
                    <Button className="w-full" size="sm" asChild>
                        {/* Link to the Path Execution Page */}
                        <Link href={`/learning-paths/${activePath.id}`}>View Path</Link>
                    </Button>
                ) : (
                    <Button className="w-full" size="sm" variant="outline" disabled>No Path Available</Button>
                )}
            </CardFooter>
        </Card>
    )
}
