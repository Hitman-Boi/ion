"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createBlock(courseId: string, parentId: string | null, blockType: string) {
    const session = await auth();
    if (!session || (session.user.role !== "INSTRUCTOR" && session.user.role !== "ADMIN")) {
        throw new Error("Unauthorized");
    }

    // Determine path
    let path = "";
    if (parentId) {
        const parent = await prisma.courseBlock.findUnique({ where: { id: parentId } });
        if (!parent) throw new Error("Parent not found");
        path = parent.path;
    }

    // Generate a temp ID for path generation (will be updated by DB or we generate UUID here)
    // Prisma default uuid() is generated at DB level, so we might need to query or generate here.
    // Let's generate UUID here to construct path.
    const crypto = require('crypto');
    const id = crypto.randomUUID();
    const sanitizedId = id.replace(/-/g, '_');
    path = path ? `${path}.${sanitizedId}` : sanitizedId;

    const block = await prisma.courseBlock.create({
        data: {
            id,
            courseId,
            parentId,
            blockType,
            displayName: "New Block",
            path,
            position: 0, // Should calculate based on siblings
            content: {},
        },
    });

    revalidatePath(`/studio/${courseId}`);
    return block;
}

export async function updateBlock(blockId: string, data: any) {
    const session = await auth();
    if (!session || (session.user.role !== "INSTRUCTOR" && session.user.role !== "ADMIN")) {
        throw new Error("Unauthorized");
    }

    const block = await prisma.courseBlock.update({
        where: { id: blockId },
        data: {
            displayName: data.displayName,
            content: data.content,
            blockType: data.blockType,
        },
    });

    revalidatePath(`/studio/${block.courseId}`);
    return block;
}
