import { auth } from "@/auth";
import { createReadStream } from "fs";
import { stat } from "fs/promises";
import mime from "mime";
import { NextRequest, NextResponse } from "next/server";
import path from "path";

const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(process.cwd(), "antigravity_data", "uploads");

export async function GET(
    req: NextRequest,
    { params }: { params: { path: string[] } }
) {
    try {
        const session = await auth();
        // In a real app, check enrollment here. For now, just check login.
        if (!session) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const [courseId, fileName] = params.path;
        if (!courseId || !fileName) {
            return new NextResponse("Invalid path", { status: 400 });
        }

        const filePath = path.join(UPLOAD_DIR, courseId, fileName);

        // Prevent directory traversal
        if (!filePath.startsWith(UPLOAD_DIR)) {
            return new NextResponse("Access denied", { status: 403 });
        }

        try {
            const stats = await stat(filePath);
            const fileSize = stats.size;
            const range = req.headers.get("range");
            const mimeType = mime.getType(filePath) || "application/octet-stream";

            if (range) {
                const parts = range.replace(/bytes=/, "").split("-");
                const start = parseInt(parts[0], 10);
                const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
                const chunksize = (end - start) + 1;
                const file = createReadStream(filePath, { start, end });

                // @ts-ignore
                const headers = new Headers({
                    "Content-Range": `bytes ${start}-${end}/${fileSize}`,
                    "Accept-Ranges": "bytes",
                    "Content-Length": chunksize.toString(),
                    "Content-Type": mimeType,
                });

                // Return a stream response
                // @ts-ignore
                return new NextResponse(file, { status: 206, headers });
            } else {
                const file = createReadStream(filePath);
                // @ts-ignore
                const headers = new Headers({
                    "Content-Length": fileSize.toString(),
                    "Content-Type": mimeType,
                });

                // @ts-ignore
                return new NextResponse(file, { status: 200, headers });
            }

        } catch (err) {
            return new NextResponse("File not found", { status: 404 });
        }

    } catch (error) {
        console.error("Stream error:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
