"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createRole, updateRole } from "@/app/actions/roles";
import { useRouter } from "next/navigation";
import { JobRole } from "@prisma/client";

interface RoleFormProps {
    role?: JobRole;
    onSuccess?: () => void;
}

export function RoleForm({ role, onSuccess }: RoleFormProps) {
    const [title, setTitle] = useState(role?.title || "");
    const [description, setDescription] = useState(role?.description || "");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (role) {
                await updateRole(role.id, { title, description });
            } else {
                await createRole({ title, description });
            }
            router.refresh();
            if (onSuccess) onSuccess();
            if (!role) {
                setTitle("");
                setDescription("");
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
            <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : role ? "Update Role" : "Create Role"}
            </Button>
        </form>
    );
}
