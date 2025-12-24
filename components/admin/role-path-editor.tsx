"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { createRolePath } from "@/app/actions/roles";
import { useRouter } from "next/navigation";
import { JobRole } from "@prisma/client";

interface RolePathEditorProps {
    roles: JobRole[];
    targetRole: JobRole;
    onSuccess?: () => void;
}

export function RolePathEditor({ roles, targetRole, onSuccess }: RolePathEditorProps) {
    const [sourceRoleId, setSourceRoleId] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await createRolePath({
                targetRoleId: targetRole.id,
                sourceRoleId: sourceRoleId || undefined,
                milestones: [], // TODO: Add milestone selection
            });
            router.refresh();
            if (onSuccess) onSuccess();
        } catch (error) {
            console.error("Failed to create path:", error);
            alert("Failed to create path");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label>Prerequisite Role (Optional)</Label>
                <select
                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={sourceRoleId}
                    onChange={(e) => setSourceRoleId(e.target.value)}
                >
                    <option value="">None (Entry Level)</option>
                    {roles
                        .filter((r) => r.id !== targetRole.id)
                        .map((r) => (
                            <option key={r.id} value={r.id}>
                                {r.title}
                            </option>
                        ))}
                </select>
            </div>
            <Button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Add Path Connection"}
            </Button>
        </form>
    );
}
