"use client";

import { Button } from "@/components/ui/button";
import { subscribeToLearningPath, unsubscribeFromLearningPath } from "@/app/actions/learning-paths.actions";
import { useTransition } from "react";
import { Check, Plus, Loader2 } from "lucide-react";

interface SubscribeButtonProps {
    pathId: string;
    isSubscribed: boolean;
}

export function SubscribeButton({ pathId, isSubscribed }: SubscribeButtonProps) {
    const [isPending, startTransition] = useTransition();

    const handleClick = () => {
        startTransition(async () => {
            if (isSubscribed) {
                await unsubscribeFromLearningPath(pathId);
            } else {
                await subscribeToLearningPath(pathId);
            }
        });
    };

    if (isPending) {
        return (
            <Button disabled className="min-w-[140px]">
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {isSubscribed ? "Removing..." : "Adding..."}
            </Button>
        );
    }

    if (isSubscribed) {
        return (
            <Button
                variant="outline"
                onClick={handleClick}
                className="min-w-[140px] border-green-500/50 text-green-600 hover:bg-red-50 hover:text-red-600 hover:border-red-500/50 group"
            >
                <Check className="h-4 w-4 mr-2 group-hover:hidden" />
                <span className="group-hover:hidden">Subscribed</span>
                <span className="hidden group-hover:inline">Unsubscribe</span>
            </Button>
        );
    }

    return (
        <Button onClick={handleClick} className="min-w-[140px]">
            <Plus className="h-4 w-4 mr-2" />
            Subscribe
        </Button>
    );
}
