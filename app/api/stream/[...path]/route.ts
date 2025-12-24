import { NextRequest, NextResponse } from "next/server";
import { createReadStream, statSync } from "fs";
import { stat } from "fs/promises";
import path from "path";
import mime from "mime";

export async function GET(
    req: NextRequest,
    { params }: { params: { path: string[] } }
) {
    // TODO: Add authentication check here (e.g., verify user is enrolled)

    const filePathParam = params.path.join("/");
    const filePath = path.join(process.cwd(), "uploads", filePathParam);

    try {
        const stats = await stat(filePath);
        const fileSize = stats.size;
        const mimeType = mime.getType(filePath) || "application/octet-stream";

        const range = req.headers.get("range");

        if (range) {
            const parts = range.replace(/bytes=/, "").split("-");
            const start = parseInt(parts[0], 10);
            const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
            const chunksize = end - start + 1;
            const file = createReadStream(filePath, { start, end });

            const headers = {
                "Content-Range": `bytes ${start}-${end}/${fileSize}`,
                "Accept-Ranges": "bytes",
                "Content-Length": chunksize.toString(),
                "Content-Type": mimeType,
            };

            return new NextResponse(file as any, {
                status: 206,
                headers,
            });
        } else {
            const file = createReadStream(filePath);
            const headers = {
                "Content-Length": fileSize.toString(),
                "Content-Type": mimeType,
            };

            return new NextResponse(file as any, {
                status: 200,
                headers,
            });
        }
    } catch (error) {
        console.error("Stream error:", error);
        return NextResponse.json({ error: "File not found" }, { status: 404 });
    }
}
