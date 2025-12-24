"use client";

import React from "react";
import VideoPlayer from "@/app/components/CoursePlayer/VideoPlayer";
import PDFViewer from "@/app/components/CoursePlayer/PDFViewer";
import SCORMPlayer from "@/app/components/CoursePlayer/SCORMPlayer";
import { markAsComplete } from "@/app/actions/progress";

interface PlayerWrapperProps {
    type: "VIDEO" | "PDF" | "SCORM";
    src: string;
    unitId: number;
    userId: number;
}

export default function PlayerWrapper({ type, src, unitId, userId }: PlayerWrapperProps) {
    const handleComplete = async () => {
        await markAsComplete(userId, unitId);
        console.log("Unit marked as complete");
    };

    if (type === "VIDEO") {
        return <VideoPlayer src={src} onComplete={handleComplete} />;
    }

    if (type === "PDF") {
        return <PDFViewer src={src} onComplete={handleComplete} />;
    }

    if (type === "SCORM") {
        return <SCORMPlayer src={src} onComplete={handleComplete} />;
    }

    return null;
}
