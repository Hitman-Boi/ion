import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";

const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(process.cwd(), "antigravity_data", "uploads");

export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (!session || session.user.role !== "INSTRUCTOR" && session.user.role !== "ADMIN") {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const formData = await req.formData();
        const file = formData.get("file") as File;
        const courseId = formData.get("courseId") as string;

        if (!file) {
            return new NextResponse("No file provided", { status: 400 });
        }

        if (!courseId) {
            return new NextResponse("No course ID provided", { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const fileExtension = path.extname(file.name);
        const fileName = `${uuidv4()}${fileExtension}`;

        // Create course directory if it doesn't exist
        const courseDir = path.join(UPLOAD_DIR, courseId);
        await mkdir(courseDir, { recursive: true });

        const filePath = path.join(courseDir, fileName);
        await writeFile(filePath, buffer);

        const fileUrl = `/api/stream/${courseId}/${fileName}`;

        return NextResponse.json({
            url: fileUrl,
            fileName: file.name,
            mimeType: file.type,
            size: file.size
        });

    } catch (error) {
        console.error("Upload error:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
