"use client";
import MuxPlayer from "@mux/mux-player-react";

export function VideoPlayer({ playbackId }: { playbackId: string }) {
    if (!playbackId) return <div className="bg-muted aspect-video flex items-center justify-center">No Video ID</div>;

    return (
        <MuxPlayer
            playbackId={playbackId}
            metadata={{ video_id: playbackId }}
            className="w-full aspect-video"
        />
    );
}
