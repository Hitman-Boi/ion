"use client";

import React, { useState } from "react";

interface UnitUploaderProps {
    courseId: string;
    onUploadComplete: (filePath: string, fileName: string, type: string) => void;
}

export default function UnitUploader({ courseId, onUploadComplete }: UnitUploaderProps) {
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Client-side validation
        const allowedTypes = ["application/pdf", "video/mp4", "video/webm", "application/zip", "application/x-zip-compressed"];
        if (!allowedTypes.includes(file.type)) {
            setError("Unsupported file type. Please upload PDF, MP4, WEBM, or ZIP.");
            return;
        }

        if (file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
            file.type === "application/vnd.openxmlformats-officedocument.presentationml.presentation") {
            setError("Unsupported format. Please convert to PDF before uploading.");
            return;
        }

        setError(null);
        setUploading(true);
        setProgress(0);

        const formData = new FormData();
        formData.append("file", file);
        formData.append("courseId", courseId);

        try {
            const xhr = new XMLHttpRequest();
            xhr.open("POST", "/api/upload");

            xhr.upload.onprogress = (event) => {
                if (event.lengthComputable) {
                    const percentComplete = (event.loaded / event.total) * 100;
                    setProgress(percentComplete);
                }
            };

            xhr.onload = () => {
                if (xhr.status === 200) {
                    const response = JSON.parse(xhr.responseText);
                    onUploadComplete(response.filePath, response.originalName, response.type);
                    setUploading(false);
                } else {
                    setError("Upload failed. Please try again.");
                    setUploading(false);
                }
            };

            xhr.onerror = () => {
                setError("Network error occurred.");
                setUploading(false);
            };

            xhr.send(formData);
        } catch (err) {
            console.error(err);
            setError("An unexpected error occurred.");
            setUploading(false);
        }
    };

    return (
        <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 transition-colors">
            <div className="flex flex-col items-center justify-center gap-4">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <div className="text-center">
                    <label className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors">
                        <span>Select File</span>
                        <input type="file" className="hidden" onChange={handleFileChange} accept=".pdf,.mp4,.webm,.zip" />
                    </label>
                    <p className="mt-2 text-sm text-gray-500">PDF, MP4, WEBM, ZIP (SCORM)</p>
                </div>
            </div>

            {error && (
                <div className="mt-4 p-3 bg-red-50 text-red-700 rounded text-sm">
                    {error}
                </div>
            )}

            {uploading && (
                <div className="mt-4">
                    <div className="flex justify-between text-sm mb-1">
                        <span>Uploading...</span>
                        <span>{Math.round(progress)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                            className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                </div>
            )}
        </div>
    );
}
