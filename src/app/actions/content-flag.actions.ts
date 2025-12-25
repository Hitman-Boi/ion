"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { updateCourseHealthScore } from "./health-score.actions";
import { type FlagReason } from "@/lib/content-flag-constants";

// Re-export type for convenience
export type { FlagReason } from "@/lib/content-flag-constants";

/**
 * Submit a content flag (bug report)
 * Users can submit multiple flags for different reasons
 */
export async function submitContentFlag(
    courseId: string,
    reason: FlagReason,
    details?: string
): Promise<{ success: boolean; flagId: string }> {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    // Create the flag
    const flag = await prisma.contentFlag.create({
        data: {
            courseId,
            userId: session.user.id,
            reason,
            details,
            status: "OPEN",
        },
    });

    // Update bug report count on course
    await updateCourseBugReportCount(courseId);

    // Recalculate health score (penalty applied)
    await updateCourseHealthScore(courseId);

    revalidatePath(`/courses/${courseId}`);

    return { success: true, flagId: flag.id };
}

/**
 * Update the cached bug report count for a course
 */
async function updateCourseBugReportCount(courseId: string): Promise<void> {
    const openFlags = await prisma.contentFlag.count({
        where: { courseId, status: "OPEN" },
    });

    await prisma.course.update({
        where: { id: courseId },
        data: { bugReportCount: openFlags },
    });
}

/**
 * Resolve a content flag (course owner/instructor only)
 */
export async function resolveContentFlag(flagId: string): Promise<void> {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    // Get the flag and verify ownership
    const flag = await prisma.contentFlag.findUnique({
        where: { id: flagId },
        include: {
            course: { select: { instructorId: true } },
        },
    });

    if (!flag) {
        throw new Error("Flag not found");
    }

    // Check if user is the course owner/instructor or admin
    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { role: true },
    });

    const isOwner = flag.course.instructorId === session.user.id;
    const isAdmin = user?.role === "ADMIN";

    if (!isOwner && !isAdmin) {
        throw new Error("Only course owner or admin can resolve flags");
    }

    // Mark as resolved
    await prisma.contentFlag.update({
        where: { id: flagId },
        data: {
            status: "RESOLVED",
            resolvedAt: new Date(),
        },
    });

    // Update count and health score
    await updateCourseBugReportCount(flag.courseId);
    await updateCourseHealthScore(flag.courseId);

    revalidatePath(`/courses/${flag.courseId}`);
    revalidatePath(`/admin-dashboard`);
}

/**
 * Dismiss a content flag (admin only - for invalid reports)
 */
export async function dismissContentFlag(flagId: string): Promise<void> {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    // Verify admin
    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { role: true },
    });

    if (user?.role !== "ADMIN") {
        throw new Error("Admin access required");
    }

    const flag = await prisma.contentFlag.findUnique({
        where: { id: flagId },
        select: { courseId: true },
    });

    if (!flag) {
        throw new Error("Flag not found");
    }

    await prisma.contentFlag.update({
        where: { id: flagId },
        data: {
            status: "DISMISSED",
            resolvedAt: new Date(),
        },
    });

    // Update count and health score
    await updateCourseBugReportCount(flag.courseId);
    await updateCourseHealthScore(flag.courseId);

    revalidatePath(`/admin-dashboard`);
}

/**
 * Get open flags for a course (for course owner)
 */
export async function getOpenFlagsForCourse(
    courseId: string
): Promise<
    {
        id: string;
        reason: string;
        details: string | null;
        createdAt: Date;
    }[]
> {
    const session = await auth();
    if (!session?.user?.id) {
        return [];
    }

    const flags = await prisma.contentFlag.findMany({
        where: { courseId, status: "OPEN" },
        select: {
            id: true,
            reason: true,
            details: true,
            createdAt: true,
        },
        orderBy: { createdAt: "desc" },
    });

    return flags;
}

/**
 * Get all flags for admin view
 */
export async function getAllOpenFlags(): Promise<
    {
        id: string;
        courseId: string;
        courseTitle: string;
        reason: string;
        details: string | null;
        createdAt: Date;
    }[]
> {
    const session = await auth();
    if (!session?.user?.id) {
        return [];
    }

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { role: true },
    });

    if (user?.role !== "ADMIN") {
        return [];
    }

    const flags = await prisma.contentFlag.findMany({
        where: { status: "OPEN" },
        include: {
            course: { select: { title: true } },
        },
        orderBy: { createdAt: "desc" },
    });

    return flags.map((flag) => ({
        id: flag.id,
        courseId: flag.courseId,
        courseTitle: flag.course.title,
        reason: flag.reason,
        details: flag.details,
        createdAt: flag.createdAt,
    }));
}
