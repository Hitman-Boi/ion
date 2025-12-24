"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateProgress(userId: number, unitId: number, data: any) {
    try {
        const progress = await prisma.userProgress.upsert({
            where: {
                userId_unitId: {
                    userId,
                    unitId,
                },
            },
            update: {
                status: "IN_PROGRESS",
                data,
            },
            create: {
                userId,
                unitId,
                status: "IN_PROGRESS",
                data,
            },
        });
        return { success: true, progress };
    } catch (error) {
        console.error("Failed to update progress:", error);
        return { success: false, error: "Failed to update progress" };
    }
}

export async function markAsComplete(userId: number, unitId: number) {
    try {
        const progress = await prisma.userProgress.upsert({
            where: {
                userId_unitId: {
                    userId,
                    unitId,
                },
            },
            update: {
                status: "COMPLETED",
            },
            create: {
                userId,
                unitId,
                status: "COMPLETED",
            },
        });

        // Check if there's a next unit and unlock it (Linear Progression)
        // This logic would be more complex in a real app (finding the next unit in sequence)

        revalidatePath("/courses");
        return { success: true, progress };
    } catch (error) {
        console.error("Failed to complete unit:", error);
        return { success: false, error: "Failed to complete unit" };
    }
}
