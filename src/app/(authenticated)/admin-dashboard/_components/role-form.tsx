"use client";

import { createRole, updateRole } from "@/app/actions/roles.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { JobRole } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Check, X } from "lucide-react";

interface RoleFormProps {
    role?: JobRole & { skills?: { id: string, name: string }[] };
    onSuccess?: () => void;
    allSkills?: any[];
}

export function RoleForm({ role, onSuccess, allSkills = [] }: RoleFormProps) {
    const [title, setTitle] = useState(role?.title || "");
    const [description, setDescription] = useState(role?.description || "");
    // Initialize selected skills from role.skills if available
    const [selectedSkillIds, setSelectedSkillIds] = useState<string[]>(
        role?.skills?.map(s => s.id) || []
    );
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const toggleSkill = (skillId: string) => {
        setSelectedSkillIds(prev =>
            prev.includes(skillId)
                ? prev.filter(id => id !== skillId)
                : [...prev, skillId]
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (role) {
                await updateRole(role.id, { title, description, skillIds: selectedSkillIds });
            } else {
                await createRole({ title, description, skillIds: selectedSkillIds });
            }
            router.refresh();
            if (onSuccess) onSuccess();
            if (!role) {
                setTitle("");
                setDescription("");
                setSelectedSkillIds([]);
            }
        } catch (error) {
            console.error("Failed to save role:", error);
            alert("Failed to save role");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="title">Role Title</Label>
                <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    placeholder="e.g. Senior Product Manager"
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Role responsibilities and requirements..."
                />
            </div>

            <div className="space-y-2">
                <Label>Required Skills</Label>
                <div className="border rounded-md p-3 max-h-[200px] overflow-y-auto space-y-2">
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
                            )
                        })}
                        {allSkills.length === 0 && (
                            <p className="text-xs text-muted-foreground italic">No skills available. Create skills first.</p>
                        )}
                    </div>
                </div>
                <p className="text-[10px] text-muted-foreground">Select the skills required for this role.</p>
            </div>

            <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : role ? "Update Role" : "Create Role"}
            </Button>
        </form>
    );
}
