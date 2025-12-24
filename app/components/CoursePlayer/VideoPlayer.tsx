"use client";

import React, { useRef, useEffect, useState } from "react";

interface VideoPlayerProps {
    src: string;
    onProgress?: (progress: number) => void;
    onComplete?: () => void;
}

export default function VideoPlayer({ src, onProgress, onComplete }: VideoPlayerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [playbackRate, setPlaybackRate] = useState(1);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const handleTimeUpdate = () => {
            const current = video.currentTime;
            const total = video.duration;
            const percent = (current / total) * 100;
            setProgress(percent);
            if (onProgress) onProgress(percent);

            if (percent > 90 && onComplete) {
                onComplete();
            }
        };

        const handleLoadedMetadata = () => {
            setDuration(video.duration);
        };

        const handleContextMenu = (e: MouseEvent) => {
            e.preventDefault();
        };

        video.addEventListener("timeupdate", handleTimeUpdate);
        video.addEventListener("loadedmetadata", handleLoadedMetadata);
        video.addEventListener("contextmenu", handleContextMenu);

        return () => {
            video.removeEventListener("timeupdate", handleTimeUpdate);
            video.removeEventListener("loadedmetadata", handleLoadedMetadata);
            video.removeEventListener("contextmenu", handleContextMenu);
        };
    }, [src, onProgress, onComplete]);

    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const time = (parseFloat(e.target.value) / 100) * duration;
        if (videoRef.current) {
            videoRef.current.currentTime = time;
        }
    };

    const changeSpeed = (rate: number) => {
        if (videoRef.current) {
            videoRef.current.playbackRate = rate;
            setPlaybackRate(rate);
        }
    };

    return (
        <div className="relative w-full max-w-4xl mx-auto bg-black rounded-lg overflow-hidden shadow-xl group" onContextMenu={(e) => e.preventDefault()}>
            <video
                ref={videoRef}
                src={src}
                className="w-full h-auto"
                controlsList="nodownload"
                disablePictureInPicture
                playsInline
                onClick={togglePlay}
            />

            {/* Custom Controls Overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="flex flex-col gap-2">
                    {/* Progress Bar */}
                    <input
                        type="range"
                        min="0"
                        max="100"
                        value={progress}
                        onChange={handleSeek}
                        className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full"
                    />

                    <div className="flex items-center justify-between text-white">
                        <div className="flex items-center gap-4">
                            <button onClick={togglePlay} className="hover:text-blue-400 transition-colors">
                                {isPlaying ? (
                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
                                ) : (
                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                                )}
                            </button>
                            <span className="text-sm font-mono">
                                {new Date(progress * duration * 10).toISOString().substr(14, 5)} / {new Date(duration * 1000).toISOString().substr(14, 5)}
                            </span>
                        </div>

                        <div className="flex items-center gap-2">
                            <select
                                value={playbackRate}
                                onChange={(e) => changeSpeed(parseFloat(e.target.value))}
                                className="bg-transparent text-sm border border-gray-600 rounded px-1 py-0.5 focus:outline-none focus:border-blue-500"
                            >
                                <option value="0.5">0.5x</option>
                                <option value="1">1x</option>
                                <option value="1.5">1.5x</option>
                                <option value="2">2x</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
