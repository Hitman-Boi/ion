"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { usePostHog } from "posthog-js/react";
import { AnalyticsEvents } from "@/lib/analytics-events";
import { markVideoComplete } from "@/app/actions/progress.actions";
import { cn } from "@/lib/utils";
import {
    Play,
    Pause,
    Maximize,
    Minimize,
    Volume2,
    VolumeX,
    Settings,
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Slider } from "@/components/ui/slider";

interface VideoPlayerProps {
    url: string;
    topicId: string;
    onComplete?: () => void;
}

const PLAYBACK_SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];

export function VideoPlayer({ url, topicId, onComplete }: VideoPlayerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const posthog = usePostHog();
    const router = useRouter();
    const [hasEnded, setHasEnded] = useState(false);

    // Player state
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [playbackSpeed, setPlaybackSpeed] = useState(1);
    const [showControls, setShowControls] = useState(true);
    const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Format time helper
    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    // Toggle play/pause
    const togglePlay = useCallback(() => {
        const video = videoRef.current;
        if (!video) return;

        if (video.paused) {
            video.play();
        } else {
            video.pause();
        }
    }, []);

    // Toggle fullscreen
    const toggleFullscreen = useCallback(async () => {
        const container = containerRef.current;
        if (!container) return;

        try {
            if (document.fullscreenElement) {
                await document.exitFullscreen();
            } else {
                await container.requestFullscreen();
            }
        } catch (error) {
            console.error("Fullscreen error:", error);
        }
    }, []);

    // Toggle mute
    const toggleMute = useCallback(() => {
        const video = videoRef.current;
        if (!video) return;

        video.muted = !video.muted;
        setIsMuted(!video.muted);
    }, []);

    // Handle volume change
    const handleVolumeChange = useCallback((value: number[]) => {
        const video = videoRef.current;
        if (!video) return;

        const newVolume = value[0];
        video.volume = newVolume;
        setVolume(newVolume);
        setIsMuted(newVolume === 0);
    }, []);

    // Handle seek
    const handleSeek = useCallback((value: number[]) => {
        const video = videoRef.current;
        if (!video) return;

        video.currentTime = value[0];
        setCurrentTime(value[0]);
    }, []);

    // Handle playback speed change
    const handleSpeedChange = useCallback((speed: number) => {
        const video = videoRef.current;
        if (!video) return;

        video.playbackRate = speed;
        setPlaybackSpeed(speed);
    }, []);

    // Show controls on mouse activity
    const handleMouseActivity = useCallback(() => {
        setShowControls(true);
        if (controlsTimeoutRef.current) {
            clearTimeout(controlsTimeoutRef.current);
        }
        controlsTimeoutRef.current = setTimeout(() => {
            if (isPlaying) {
                setShowControls(false);
            }
        }, 3000);
    }, [isPlaying]);

    // Video event listeners
    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const handlePlay = () => {
            setIsPlaying(true);
            posthog.capture(AnalyticsEvents.VIDEO_INTERACTION, {
                topic_id: topicId,
                action: "play",
                timestamp: video.currentTime,
            });
        };

        const handlePause = () => {
            setIsPlaying(false);
            posthog.capture(AnalyticsEvents.VIDEO_INTERACTION, {
                topic_id: topicId,
                action: "pause",
                timestamp: video.currentTime,
            });
        };

        const handleEnded = async () => {
            setIsPlaying(false);
            if (hasEnded) return;
            setHasEnded(true);

            posthog.capture(AnalyticsEvents.VIDEO_COMPLETED, {
                topic_id: topicId,
            });

            try {
                await markVideoComplete(topicId);
                if (onComplete) onComplete();
                router.refresh();
            } catch (error) {
                console.error("Failed to mark video complete:", error);
            }
        };

        const handleTimeUpdate = () => {
            setCurrentTime(video.currentTime);
        };

        const handleLoadedMetadata = () => {
            setDuration(video.duration);
        };

        const handleVolumeUpdate = () => {
            setVolume(video.volume);
            setIsMuted(video.muted);
        };

        video.addEventListener("play", handlePlay);
        video.addEventListener("pause", handlePause);
        video.addEventListener("ended", handleEnded);
        video.addEventListener("timeupdate", handleTimeUpdate);
        video.addEventListener("loadedmetadata", handleLoadedMetadata);
        video.addEventListener("volumechange", handleVolumeUpdate);

        return () => {
            video.removeEventListener("play", handlePlay);
            video.removeEventListener("pause", handlePause);
            video.removeEventListener("ended", handleEnded);
            video.removeEventListener("timeupdate", handleTimeUpdate);
            video.removeEventListener("loadedmetadata", handleLoadedMetadata);
            video.removeEventListener("volumechange", handleVolumeUpdate);
        };
    }, [topicId, posthog, router, hasEnded, onComplete]);

    // Fullscreen change listener
    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        document.addEventListener("fullscreenchange", handleFullscreenChange);
        return () => {
            document.removeEventListener("fullscreenchange", handleFullscreenChange);
        };
    }, []);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

            switch (e.key.toLowerCase()) {
                case " ":
                case "k":
                    e.preventDefault();
                    togglePlay();
                    break;
                case "f":
                    e.preventDefault();
                    toggleFullscreen();
                    break;
                case "m":
                    e.preventDefault();
                    toggleMute();
                    break;
                case "arrowleft":
                    e.preventDefault();
                    if (videoRef.current) {
                        videoRef.current.currentTime -= 10;
                    }
                    break;
                case "arrowright":
                    e.preventDefault();
                    if (videoRef.current) {
                        videoRef.current.currentTime += 10;
                    }
                    break;
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [togglePlay, toggleFullscreen, toggleMute]);

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (controlsTimeoutRef.current) {
                clearTimeout(controlsTimeoutRef.current);
            }
        };
    }, []);

    return (
        <div
            ref={containerRef}
            className={cn(
                "relative w-full bg-black overflow-hidden group",
                isFullscreen ? "h-screen" : "aspect-video max-h-[calc(100vh-250px)] rounded-lg shadow-lg"
            )}
            onMouseMove={handleMouseActivity}
            onMouseLeave={() => isPlaying && setShowControls(false)}
        >
            {/* Video Element */}
            <video
                ref={videoRef}
                src={url}
                className="h-full w-full object-contain"
                onClick={togglePlay}
                playsInline
            >
                Your browser does not support the video tag.
            </video>

            {/* Play/Pause Overlay */}
            <div
                className={cn(
                    "absolute inset-0 flex items-center justify-center cursor-pointer transition-opacity",
                    isPlaying && showControls ? "opacity-0" : "opacity-100"
                )}
                onClick={togglePlay}
            >
                {!isPlaying && (
                    <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center transition-transform hover:scale-110">
                        <Play className="w-8 h-8 text-white ml-1" fill="white" />
                    </div>
                )}
            </div>

            {/* Controls Bar */}
            <div
                className={cn(
                    "absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-4 pb-3 pt-8 transition-opacity",
                    showControls ? "opacity-100" : "opacity-0"
                )}
            >
                {/* Progress Bar */}
                <div className="mb-3">
                    <Slider
                        value={[currentTime]}
                        max={duration || 100}
                        step={0.1}
                        onValueChange={handleSeek}
                        className="w-full cursor-pointer [&>span:first-child]:h-1 [&>span:first-child]:bg-white/30 [&_[role=slider]]:h-3 [&_[role=slider]]:w-3 [&_[role=slider]]:border-0 [&>span:first-child>span]:bg-emerald-500"
                    />
                </div>

                {/* Control Buttons */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {/* Play/Pause */}
                        <button
                            onClick={togglePlay}
                            className="text-white hover:text-emerald-400 transition-colors"
                        >
                            {isPlaying ? (
                                <Pause className="w-5 h-5" fill="currentColor" />
                            ) : (
                                <Play className="w-5 h-5" fill="currentColor" />
                            )}
                        </button>

                        {/* Volume */}
                        <div className="flex items-center gap-2 group/volume">
                            <button
                                onClick={toggleMute}
                                className="text-white hover:text-emerald-400 transition-colors"
                            >
                                {isMuted || volume === 0 ? (
                                    <VolumeX className="w-5 h-5" />
                                ) : (
                                    <Volume2 className="w-5 h-5" />
                                )}
                            </button>
                            <div className="w-0 overflow-hidden group-hover/volume:w-20 transition-all">
                                <Slider
                                    value={[isMuted ? 0 : volume]}
                                    max={1}
                                    step={0.01}
                                    onValueChange={handleVolumeChange}
                                    className="w-20 cursor-pointer [&>span:first-child]:h-1 [&>span:first-child]:bg-white/30 [&_[role=slider]]:h-3 [&_[role=slider]]:w-3 [&_[role=slider]]:border-0 [&>span:first-child>span]:bg-white"
                                />
                            </div>
                        </div>

                        {/* Time Display */}
                        <span className="text-white/80 text-sm font-mono">
                            {formatTime(currentTime)} / {formatTime(duration)}
                        </span>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Playback Speed */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="flex items-center gap-1 text-white hover:text-emerald-400 transition-colors text-sm">
                                    <Settings className="w-4 h-4" />
                                    <span>{playbackSpeed}x</span>
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                align="end"
                                className="bg-gray-900 border-white/10"
                            >
                                {PLAYBACK_SPEEDS.map((speed) => (
                                    <DropdownMenuItem
                                        key={speed}
                                        onClick={() => handleSpeedChange(speed)}
                                        className={cn(
                                            "text-white hover:bg-white/10 cursor-pointer",
                                            playbackSpeed === speed && "text-emerald-400"
                                        )}
                                    >
                                        {speed}x
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {/* Fullscreen */}
                        <button
                            onClick={toggleFullscreen}
                            className="text-white hover:text-emerald-400 transition-colors"
                        >
                            {isFullscreen ? (
                                <Minimize className="w-5 h-5" />
                            ) : (
                                <Maximize className="w-5 h-5" />
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
