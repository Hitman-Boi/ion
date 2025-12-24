import { getSkillGapData, createSkillTarget, getSkills, createSkill } from "@/app/actions/skills";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";


export default async function SkillGapDashboard() {
    const gapData = await getSkillGapData();
    const allSkills = await getSkills();

    return (
        <div className="h-full p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Workforce Intelligence</h1>
                    <p className="text-muted-foreground">Monitor skill gaps and workforce readiness.</p>
                </div>
                <div className="flex gap-2">
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="outline">Define New Skill</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add New Skill</DialogTitle>
                            </DialogHeader>
                            <form action={async (formData) => {
                                "use server";
                                await createSkill({
                                    name: formData.get("name") as string,
                                    category: formData.get("category") as string,
                                });
                            }} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Skill Name</Label>
                                    <Input id="name" name="name" required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="category">Category</Label>
                                    <Input id="category" name="category" />
                                </div>
                                <Button type="submit">Create Skill</Button>
                            </form>
                        </DialogContent>
                    </Dialog>

                    <Dialog>
                        <DialogTrigger asChild>
                            <Button>Set Skill Target</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Set Target for Skill</DialogTitle>
                            </DialogHeader>
                            <form action={async (formData) => {
                                "use server";
                                await createSkillTarget({
                                    skillName: formData.get("skillName") as string,
                                    targetCount: parseInt(formData.get("targetCount") as string),
                                });
                            }} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="skillName">Skill</Label>
                                    <select name="skillName" className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                                        {allSkills.map(skill => (
                                            <option key={skill.id} value={skill.name}>{skill.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="targetCount">Target Count</Label>
                                    <Input id="targetCount" name="targetCount" type="number" required min="1" />
                                </div>
                                <Button type="submit">Set Target</Button>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {gapData.map((item) => {
                    const percentage = Math.min(100, (item.currentCount / item.targetCount) * 100);
                    let statusColor = "bg-red-500";
                    if (percentage >= 100) statusColor = "bg-green-500";
                    else if (percentage >= 50) statusColor = "bg-yellow-500";

                    return (
                        <Card key={item.id}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    {item.skillName}
                                </CardTitle>
                                <div className={`h-3 w-3 rounded-full ${statusColor}`} />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{item.currentCount} / {item.targetCount}</div>
                                <p className="text-xs text-muted-foreground mb-4">
                                    {item.gap > 0 ? `${item.gap} more needed` : "Target met"}
                                </p>
                                <Progress value={percentage} className="h-2" />
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
