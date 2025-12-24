import { Badge } from "@/components/ui/badge";
import { AlertCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface NeedsReviewBadgeProps {
    lastReviewedAt: Date;
    contentVelocity: "HIGH" | "NORMAL" | "LOW";
    className?: string;
}

// TTL (Time To Live) in days based on content velocity
const VELOCITY_TTL: Record<string, number> = {
    HIGH: 180,   // AI, React, etc.
    NORMAL: 365, // Standard processes
    LOW: 730,    // Soft skills
};

export function NeedsReviewBadge({
    lastReviewedAt,
    contentVelocity,
    className,
}: NeedsReviewBadgeProps) {
    const now = new Date();
    const daysSinceReview = Math.floor(
        (now.getTime() - new Date(lastReviewedAt).getTime()) / (1000 * 60 * 60 * 24)
    );

    const ttl = VELOCITY_TTL[contentVelocity] || 365;
    const warningThreshold = ttl - 30; // T-30 days warning

    // Determine status
    if (daysSinceReview >= ttl + 60) {
        // Rotting: +60 days past TTL - Hidden from catalog
        return (
            <Badge variant="destructive" className={cn("gap-1", className)}>
                <AlertCircle className="w-3 h-3" />
                Deprecated
            </Badge>
        );
    }

    if (daysSinceReview >= ttl) {
        // Expired: past TTL
        return (
            <Badge variant="destructive" className={cn("gap-1", className)}>
                <AlertCircle className="w-3 h-3" />
                Needs Review
            </Badge>
        );
    }

    if (daysSinceReview >= warningThreshold) {
        // Warning: T-30 days
        return (
            <Badge variant="outline" className={cn("gap-1 border-amber-500 text-amber-500", className)}>
                <Clock className="w-3 h-3" />
                Review Soon
            </Badge>
        );
    }

    // Fresh - no badge needed
    return null;
}
