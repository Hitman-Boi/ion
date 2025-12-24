"use client";

import { useState } from "react";
import { AlertTriangle, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { resolveContentFlag, dismissContentFlag } from "@/app/actions/content-flag.actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface ContentFlag {
    id: string;
    reason: string;
    details: string | null;
    createdAt: Date;
}

interface FlagResolutionPanelProps {
    flags: ContentFlag[];
    courseId: string;
    isOwner: boolean;
    isAdmin: boolean;
}

export function FlagResolutionPanel({
    flags,
    courseId,
    isOwner,
    isAdmin,
}: FlagResolutionPanelProps) {
    const router = useRouter();
    const [processingId, setProcessingId] = useState<string | null>(null);

    if (flags.length === 0 && !isOwner) {
        return null;
    }

    const handleResolve = async (flagId: string) => {
        setProcessingId(flagId);
        try {
            await resolveContentFlag(flagId);
            toast.success("Issue marked as resolved");
            router.refresh();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to resolve");
        } finally {
            setProcessingId(null);
        }
    };

    const handleDismiss = async (flagId: string) => {
        setProcessingId(flagId);
        try {
            await dismissContentFlag(flagId);
            toast.success("Report dismissed");
            router.refresh();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to dismiss");
        } finally {
            setProcessingId(null);
        }
    };

    return (
        <Card className="border-amber-500/30 bg-amber-500/5">
            <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                    <CardTitle className="text-lg">Content Issues</CardTitle>
                    <Badge variant="secondary" className="ml-auto">
                        {flags.length} Open
                    </Badge>
                </div>
                <CardDescription>
                    Issues reported by learners about this course
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
                {flags.length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground">
                        <Check className="w-8 h-8 mx-auto mb-2 text-green-500" />
                        <p className="text-sm">No open issues! 🎉</p>
                    </div>
                ) : (
                    flags.map((flag) => (
                        <div
                            key={flag.id}
                            className="flex items-start justify-between p-3 rounded-lg bg-background/50 border border-border/50"
                        >
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <Badge variant="outline" className="text-xs">
                                        {flag.reason}
                                    </Badge>
                                    <span className="text-xs text-muted-foreground">
                                        {new Date(flag.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                                {flag.details && (
                                    <p className="text-sm text-muted-foreground line-clamp-2">
                                        {flag.details}
                                    </p>
                                )}
                            </div>
                            <div className="flex gap-1 ml-3 shrink-0">
                                {(isOwner || isAdmin) && (
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-8 px-2 text-green-600 hover:text-green-700 hover:bg-green-100"
                                        disabled={processingId === flag.id}
                                        onClick={() => handleResolve(flag.id)}
                                        title="Mark as resolved"
                                    >
                                        <Check className="w-4 h-4" />
                                    </Button>
                                )}
                                {isAdmin && (
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-8 px-2 text-red-600 hover:text-red-700 hover:bg-red-100"
                                        disabled={processingId === flag.id}
                                        onClick={() => handleDismiss(flag.id)}
                                        title="Dismiss flag"
                                    >
                                        <X className="w-4 h-4" />
                                    </Button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </CardContent>
        </Card>
    );
}
