"use client";

import React, { useEffect, useRef } from "react";

interface SCORMPlayerProps {
    src: string; // Path to the index.html of the extracted SCORM package
    onComplete?: () => void;
}

export default function SCORMPlayer({ src, onComplete }: SCORMPlayerProps) {
    const iframeRef = useRef<HTMLIFrameElement>(null);

    useEffect(() => {
        // Listen for messages from the SCORM content if it uses postMessage
        // Or poll for LMSFinish if we implement a full SCORM API adapter.
        // For this MVP, we'll assume the SCORM content might communicate via window.API or we just load it.
        // Real SCORM support requires injecting a window.API object into the iframe.

        // Placeholder for SCORM API Adapter
        // (In a real app, we'd use a library like 'scorm-again' or similar to bridge the iframe)

        const handleMessage = (event: MessageEvent) => {
            if (event.data === "SCORM_COMPLETED" && onComplete) {
                onComplete();
            }
        };

        window.addEventListener("message", handleMessage);
        return () => window.removeEventListener("message", handleMessage);
    }, [onComplete]);

    return (
        <div className="w-full h-[80vh] bg-white rounded-lg overflow-hidden border border-gray-200">
            <iframe
                ref={iframeRef}
                src={src}
                className="w-full h-full"
                title="SCORM Player"
                style={{ border: "none" }}
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            />
        </div>
    );
}
