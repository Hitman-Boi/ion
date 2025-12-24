import { auth } from "@/auth";
import { createReadStream } from "fs";
import { stat } from "fs/promises";
import mime from "mime";
import { NextRequest, NextResponse } from "next/server";
import path from "path";

export async function GET(
    req: NextRequest,
    { params }: { params: { path: string[] } }
) {
    // 1. Auth Check (Basic: Must be logged in to view *any* course content? Or public?)
    // For now, require login as per rules "prevent direct downloading by students" (auth wall)
    const session = await auth();
    if (!session?.user) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const filePathParam = params.path.join("/");
    // Prevent directory traversal
    const safePath = path.basename(filePathParam);
    const fullPath = path.join(process.cwd(), "uploads", safePath);

    try {
        const fileStat = await stat(fullPath);
        const fileSize = fileStat.size;
        const contentType = mime.getType(fullPath) || "application/octet-stream";

        const range = req.headers.get("range");

        if (range) {
            const parts = range.replace(/bytes=/, "").split("-");
            const start = parseInt(parts[0], 10);
            const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
            const chunksize = end - start + 1;
            const file = createReadStream(fullPath, { start, end });

            const headers = new Headers();
            headers.set("Content-Range", `bytes ${start}-${end}/${fileSize}`);
            headers.set("Accept-Ranges", "bytes");
            headers.set("Content-Length", chunksize.toString());
            headers.set("Content-Type", contentType);

            // @ts-ignore: Next.js supports Node streams in NextResponse body
            return new NextResponse(file, {
                status: 206,
                headers
            });
        } else {
            const file = createReadStream(fullPath);
            const headers = new Headers();
            headers.set("Content-Length", fileSize.toString());
            headers.set("Content-Type", contentType);

            // @ts-ignore
            return new NextResponse(file, {
                status: 200,
                headers
            });
        }

    } catch (error) {
        console.error("File serve error:", error);
        return new NextResponse("File not found", { status: 404 });
    }
}
