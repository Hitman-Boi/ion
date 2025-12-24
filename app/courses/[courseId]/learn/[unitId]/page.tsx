import React from "react";
import { prisma } from "@/lib/prisma";
import PlayerWrapper from "@/app/components/CoursePlayer/PlayerWrapper";
import { markAsComplete } from "@/app/actions/progress";
import Link from "next/link";

export default async function LearnPage({ params }: { params: { courseId: string; unitId: string } }) {
    const unitId = parseInt(params.unitId);
    const courseId = parseInt(params.courseId);

    // Mock user ID for now (in real app, get from session)
    const userId = 1;

    const unit = await prisma.courseUnit.findUnique({
        where: { id: unitId },
        include: {
            module: {
                include: {
                    course: true
                }
            }
        }
    });

    if (!unit) {
        return <div>Unit not found</div>;
    }

    // Calculate next/prev unit logic would go here

    async function handleCompletion() {
        "use server";
        await markAsComplete(userId, unitId);
    }

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar (Simplified) */}
            <div className="w-64 bg-white border-r border-gray-200 p-4 overflow-y-auto hidden md:block">
                <h2 className="font-bold text-lg mb-4">{unit.module.course.title}</h2>
                <div className="text-sm text-gray-500 mb-2">{unit.module.title}</div>
                <div className="font-medium text-blue-600">{unit.title}</div>

                <div className="mt-8">
                    <Link href={`/courses/${courseId}`} className="text-sm text-gray-600 hover:text-gray-900">
                        ← Back to Course Home
                    </Link>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                <header className="bg-white border-b border-gray-200 p-4 flex justify-between items-center shadow-sm">
                    <h1 className="text-xl font-semibold">{unit.title}</h1>
                    <div className="flex gap-2">
                        <button className="px-4 py-2 text-sm border rounded hover:bg-gray-50">Previous</button>
                        <button className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">Next</button>
                    </div>
                </header>

                <main className="flex-1 p-6 overflow-y-auto flex items-center justify-center">
                    <div className="w-full max-w-5xl">
                        {(unit.type === "VIDEO" || unit.type === "PDF" || unit.type === "SCORM") && unit.contentPath && (
                            <PlayerWrapper
                                type={unit.type}
                                src={unit.type === "SCORM" ? `/api/stream${unit.contentPath}/index.html` : `/api/stream${unit.contentPath}`}
                                unitId={unitId}
                                userId={userId}
                            />
                        )}

                        {unit.type === "LINK" && unit.contentPath && (
                            <div className="text-center p-12 bg-white rounded-lg shadow">
                                <h3 className="text-lg font-medium mb-4">External Resource</h3>
                                <p className="mb-6 text-gray-600">This content is hosted externally.</p>
                                <a
                                    href={unit.contentPath}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                                >
                                    Open Link in New Tab
                                    <svg className="ml-2 -mr-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M11 3a1 1 0 100 2h-2A1 1 0 008 4v2H4a1 1 0 00-1 1v10a1 1 0 001 1h10a1 1 0 001-1v-4a1 1 0 10-2 0v2H6V6h2V4a1 1 0 001-1h2z" /></svg>
                                </a>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}
