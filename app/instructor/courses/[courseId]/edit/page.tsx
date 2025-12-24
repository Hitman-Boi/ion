import React from "react";
import { prisma } from "@/lib/prisma";
import UnitUploader from "@/app/components/CourseBuilder/UnitUploader";
import { revalidatePath } from "next/cache";

export default async function CourseBuilderPage({ params }: { params: { courseId: string } }) {
    const courseId = parseInt(params.courseId);

    const course = await prisma.course.findUnique({
        where: { id: courseId },
        include: {
            modules: {
                include: {
                    units: true
                }
            }
        }
    });

    if (!course) {
        return <div>Course not found</div>;
    }

    async function addUnit(formData: FormData) {
        "use server";
        const title = formData.get("title") as string;
        const type = formData.get("type") as "VIDEO" | "PDF" | "SCORM" | "LINK";
        const moduleId = parseInt(formData.get("moduleId") as string);
        const contentPath = formData.get("contentPath") as string;

        await prisma.courseUnit.create({
            data: {
                title,
                type,
                moduleId,
                contentPath,
            }
        });

        revalidatePath(`/instructor/courses/${courseId}/edit`);
    }

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6">Edit Course: {course.title}</h1>

            <div className="grid gap-8">
                {course.modules.map((module) => (
                    <div key={module.id} className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                        <h2 className="text-xl font-semibold mb-4">{module.title}</h2>

                        <div className="space-y-4 mb-6">
                            {module.units.map((unit) => (
                                <div key={unit.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                                    <div className="flex items-center gap-3">
                                        <span className={`px-2 py-1 text-xs rounded font-bold ${unit.type === 'VIDEO' ? 'bg-blue-100 text-blue-800' :
                                                unit.type === 'PDF' ? 'bg-red-100 text-red-800' :
                                                    'bg-green-100 text-green-800'
                                            }`}>
                                            {unit.type}
                                        </span>
                                        <span>{unit.title}</span>
                                    </div>
                                    <span className="text-sm text-gray-500 truncate max-w-xs">{unit.contentPath}</span>
                                </div>
                            ))}
                        </div>

                        <div className="border-t pt-4">
                            <h3 className="text-lg font-medium mb-3">Add New Unit</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h4 className="text-sm font-semibold mb-2">1. Upload Content</h4>
                                    <UnitUploader
                                        courseId={courseId.toString()}
                                        onUploadComplete={async (path, name, type) => {
                                            "use server";
                                            // This callback needs to be client-side or handled differently.
                                            // For this MVP, we'll let the user copy/paste or auto-fill via client state.
                                            // Since we can't pass server functions to client components easily like this without binding,
                                            // We will handle the form submission separately.
                                        }}
                                    />
                                    <p className="text-xs text-gray-500 mt-2">
                                        * After upload, copy the file path to the form on the right.
                                    </p>
                                </div>

                                <form action={addUnit} className="space-y-3">
                                    <input type="hidden" name="moduleId" value={module.id} />

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Unit Title</label>
                                        <input type="text" name="title" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Content Type</label>
                                        <select name="type" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                                            <option value="VIDEO">Video</option>
                                            <option value="PDF">PDF</option>
                                            <option value="SCORM">SCORM</option>
                                            <option value="LINK">External Link</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Content Path / URL</label>
                                        <input type="text" name="contentPath" placeholder="/1/video.mp4" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
                                    </div>

                                    <button type="submit" className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition-colors">
                                        Add Unit
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
