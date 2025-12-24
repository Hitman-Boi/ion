import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;
        const courseId = formData.get("courseId") as string;

        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        if (!courseId) {
            return NextResponse.json({ error: "Course ID is required" }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const filename = file.name.replace(/\s/g, "_");
        const uniqueId = uuidv4();
        const extension = path.extname(filename);

        // Validate file type
        const allowedExtensions = [".pdf", ".mp4", ".webm", ".zip"];
        if (!allowedExtensions.includes(extension.toLowerCase())) {
            return NextResponse.json({ error: "Unsupported file type. Only PDF, MP4, WEBM, and ZIP are allowed." }, { status: 400 });
        }

        // Create directory if it doesn't exist
        // We use /app/uploads as the base, which is mapped to the host volume
        const uploadDir = path.join(process.cwd(), "uploads", courseId);
        await mkdir(uploadDir, { recursive: true });

        const safeFilename = `${uniqueId}${extension}`;
        const filePath = path.join(uploadDir, safeFilename);

        await writeFile(filePath, buffer);

        // Return the relative path for storage in DB
        const relativePath = `/${courseId}/${safeFilename}`;

        return NextResponse.json({
            success: true,
            filePath: relativePath,
            originalName: filename,
            type: extension.replace(".", "").toUpperCase()
        });

    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }
}
