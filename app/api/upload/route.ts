import { auth } from "@/auth";
import { mkdir, writeFile } from "fs/promises";
import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
        return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create unique filename
    const ext = path.extname(file.name);
    const fileName = `${uuidv4()}${ext}`;
    const uploadDir = path.join(process.cwd(), "uploads");
    const filePath = path.join(uploadDir, fileName);

    try {
        await mkdir(uploadDir, { recursive: true });
        await writeFile(filePath, buffer);

        // Return the URL to access the file
        // Assuming we have a route handler at /api/files/[...path]
        const url = `/api/files/${fileName}`;

        return NextResponse.json({ url });
    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }
}
