"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { usePostHog } from "posthog-js/react";
import { AnalyticsEvents } from "@/lib/analytics-events";
import { markVideoComplete } from "@/app/actions/progress.actions";

interface VideoPlayerProps {
    url: string;
    topicId: string;
    onComplete?: () => void;
}

export function VideoPlayer({ url, topicId, onComplete }: VideoPlayerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const posthog = usePostHog();
    const router = useRouter();
    const [hasEnded, setHasEnded] = useState(false);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const handlePlay = () => {
            posthog.capture(AnalyticsEvents.VIDEO_INTERACTION, {
                topic_id: topicId,
                action: "play",
                timestamp: video.currentTime,
            });
        };

        const handlePause = () => {
            posthog.capture(AnalyticsEvents.VIDEO_INTERACTION, {
                topic_id: topicId,
                action: "pause",
                timestamp: video.currentTime,
            });
        };

        const handleEnded = async () => {
            if (hasEnded) return;
            setHasEnded(true);

            posthog.capture(AnalyticsEvents.VIDEO_COMPLETED, {
                topic_id: topicId,
            });

            try {
                await markVideoComplete(topicId);
                if (onComplete) onComplete();
                router.refresh(); // Refresh to update progress ring
            } catch (error) {
                console.error("Failed to mark video complete:", error);
            }
        };

        video.addEventListener("play", handlePlay);
        video.addEventListener("pause", handlePause);
        video.addEventListener("ended", handleEnded);

        return () => {
            video.removeEventListener("play", handlePlay);
            video.removeEventListener("pause", handlePause);
            video.removeEventListener("ended", handleEnded);
        };
    }, [topicId, posthog, router, hasEnded, onComplete]);

    return (
        <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-black shadow-lg">
            <video
                ref={videoRef}
                src={url}
                controls
                className="h-full w-full"
                width="100%"
                height="100%"
            >
                Your browser does not support the video tag.
            </video>
        </div>
    );
}
