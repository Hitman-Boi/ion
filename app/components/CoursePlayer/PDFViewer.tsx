"use client";

import React, { useEffect, useState } from "react";

interface PDFViewerProps {
    src: string;
    onComplete?: () => void;
}

export default function PDFViewer({ src, onComplete }: PDFViewerProps) {
    // We append #toolbar=0 to hide the default PDF toolbar
    // Note: This is a soft protection. Full DRM requires specialized software.
    const pdfUrl = `${src}#toolbar=0&navpanes=0&scrollbar=0`;

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const element = e.currentTarget;
        const isBottom = Math.abs(element.scrollHeight - element.scrollTop - element.clientHeight) < 50;

        if (isBottom && onComplete) {
            onComplete();
        }
    };

    return (
        <div
            className="w-full h-[80vh] bg-gray-100 rounded-lg overflow-hidden border border-gray-200 relative"
            onContextMenu={(e) => e.preventDefault()}
        >
            {/* Overlay to prevent drag-and-drop */}
            <div className="absolute inset-0 z-10 pointer-events-none shadow-[inset_0_0_20px_rgba(0,0,0,0.1)]" />

            <iframe
                src={pdfUrl}
                className="w-full h-full"
                title="PDF Viewer"
                style={{ border: "none" }}
            />

            {/* 
        Note: Tracking scroll inside an iframe from a different origin (even same-origin sometimes) 
        can be tricky. For a robust solution, we might need PDF.js. 
        For now, we rely on the user clicking a "Mark as Read" button or 
        we can implement PDF.js if the iframe solution proves insufficient for tracking.
      */}
        </div>
    );
}
