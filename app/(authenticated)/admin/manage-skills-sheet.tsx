"use client"

import { createSkill, createSkillTarget } from "@/app/actions/skills"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skill } from "@prisma/client"
import { Tag } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

interface SkillGapData {
    id: string
    skillName: string
    currentCount: number
    targetCount: number
    gap: number
}

interface ManageSkillsSheetProps {
    initialGapData: SkillGapData[]
    allSkills: Skill[]
}

export function ManageSkillsSheet({ initialGapData, allSkills }: ManageSkillsSheetProps) {
    const [open, setOpen] = useState(false)
    const router = useRouter()

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="outline" className="gap-2">
                    <Tag className="h-4 w-4" />
                    Manage Skills
                </Button>
            </SheetTrigger>
            <SheetContent className="w-[400px] sm:w-[640px] flex flex-col h-full sm:max-w-[640px]">
                <SheetHeader>
                    <SheetTitle>Workforce Intelligence</SheetTitle>
                    <SheetDescription>
                        Monitor skill gaps and define workforce targets.
                    </SheetDescription>
                </SheetHeader>

                <Tabs defaultValue="overview" className="flex-1 flex flex-col mt-6 overflow-hidden">
                    <div className="flex items-center justify-between mb-4">
                        <TabsList>
                            <TabsTrigger value="overview">Overview</TabsTrigger>
                            <TabsTrigger value="actions">Actions</TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="overview" className="flex-1 min-h-0 border rounded-lg bg-muted/20 p-4">
                        <ScrollArea className="h-full pr-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                {initialGapData.map((item) => {
                                    const percentage = Math.min(100, (item.currentCount / item.targetCount) * 100)
                                    let statusColor = "bg-red-500"
                                    if (percentage >= 100) statusColor = "bg-green-500"
                                    else if (percentage >= 50) statusColor = "bg-yellow-500"

                                    return (
                                        <Card key={item.id} className="bg-background">
                                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4">
                                                <CardTitle className="text-sm font-medium">
                                                    {item.skillName}
                                                </CardTitle>
                                                <div className={`h-2.5 w-2.5 rounded-full ${statusColor}`} />
                                            </CardHeader>
                                            <CardContent className="p-4 pt-0">
                                                <div className="flex items-baseline gap-2 mb-1">
                                                    <span className="text-2xl font-bold">{item.currentCount}</span>
                                                    <span className="text-xs text-muted-foreground">/ {item.targetCount} target</span>
                                                </div>
                                                <Progress value={percentage} className="h-1.5 mb-2" />
                                                <p className="text-[10px] text-muted-foreground">
                                                    {item.gap > 0 ? `${item.gap} more people needed` : "Target met or exceeded"}
                                                </p>
                                            </CardContent>
                                        </Card>
                                    )
                                })}
                            </div>
                        </ScrollArea>
                    </TabsContent>

                    <TabsContent value="actions" className="flex-1">
                        <div className="grid gap-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">Define New Skill</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <form action={async (formData) => {
                                        await createSkill({
                                            name: formData.get("name") as string,
                                            category: formData.get("category") as string,
                                        })
                                        router.refresh()
                                    }} className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="name">Skill Name</Label>
                                                <Input id="name" name="name" required placeholder="e.g. React.js" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="category">Category</Label>
                                                <Input id="category" name="category" placeholder="e.g. Frontend" />
                                            </div>
                                        </div>
                                        <Button type="submit" size="sm">Create Skill</Button>
                                    </form>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">Set Skill Target</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <form action={async (formData) => {
                                        await createSkillTarget({
                                            skillName: formData.get("skillName") as string,
                                            targetCount: parseInt(formData.get("targetCount") as string),
                                        })
                                        router.refresh()
                                    }} className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="skillName">Skill</Label>
                                                <select
                                                    name="skillName"
                                                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                >
                                                    {allSkills.map(skill => (
                                                        <option key={skill.id} value={skill.name}>{skill.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="targetCount">Target Count</Label>
                                                <Input id="targetCount" name="targetCount" type="number" required min="1" placeholder="e.g. 5" />
                                            </div>
                                        </div>
                                        <Button type="submit" size="sm">Set Target</Button>
                                    </form>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>
            </SheetContent>
        </Sheet >
    )
}
