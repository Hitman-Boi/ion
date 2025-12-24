"use server";

import { prisma } from "@/lib/prisma";
import { VelocityType } from "@prisma/client";

/**
 * Content Health Score (CHS) Calculation
 * Formula: CHS = (UserRating * 0.4) + (CompletionRate * 0.3) + (FreshnessFactor * 0.3) - (BugReports * 5)
 * 
 * - UserRating: Normalized to 0-100 (1-5 stars → 0-100)
 * - CompletionRate: 0-100% of enrolled users who finish
 * - FreshnessFactor: Linear decay based on lastReviewedAt and VelocityType
 * - BugReports: -5 points per OPEN flag
 */

// TTL (Time To Live) in days based on content velocity
const VELOCITY_TTL: Record<VelocityType, number> = {
    HIGH: 180,   // AI, React, etc.
    NORMAL: 365, // Standard processes
    LOW: 730,    // Soft skills
};

/**
 * Calculate the freshness factor (0-100) based on content age and velocity.
 * 
 * Linear decay:
 * - 0-30 days: 100 points
 * - At TTL: 0 points
 * - Past TTL: 0 points (expired)
 */
function calculateFreshnessFactor(
    lastReviewedAt: Date,
    velocity: VelocityType
): number {
    const now = new Date();
    const daysSinceReview = Math.floor(
        (now.getTime() - lastReviewedAt.getTime()) / (1000 * 60 * 60 * 24)
    );

    const ttl = VELOCITY_TTL[velocity];

    // Grace period: 0-30 days = 100 points
    if (daysSinceReview <= 30) {
        return 100;
    }

    // Expired: past TTL = 0 points
    if (daysSinceReview >= ttl) {
        return 0;
    }

    // Linear decay from 100 to 0 between day 30 and TTL
    // At 6 months (180 days for HIGH velocity): ~80 points for NORMAL/LOW velocity courses
    const decayRange = ttl - 30; // Days over which decay happens
    const daysIntoDecay = daysSinceReview - 30;
    const decayPercentage = daysIntoDecay / decayRange;

    return Math.round(100 * (1 - decayPercentage));
}

/**
 * Normalize 1-5 star rating to 0-100 scale
 */
function normalizeRating(averageRating: number): number {
    // averageRating is 0-5, convert to 0-100
    return (averageRating / 5) * 100;
}

/**
 * Calculate Content Health Score for a course
 */
export async function calculateHealthScore(courseId: string): Promise<number> {
    const course = await prisma.course.findUnique({
        where: { id: courseId },
        select: {
            averageRating: true,
            completionRate: true,
            bugReportCount: true,
            contentVelocity: true,
            lastReviewedAt: true,
        },
    });

    if (!course) {
        throw new Error("Course not found");
    }

    // Normalize rating (0-5 → 0-100)
    const normalizedRating = normalizeRating(course.averageRating);

    // Get freshness factor (0-100)
    const freshnessFactor = calculateFreshnessFactor(
        course.lastReviewedAt,
        course.contentVelocity
    );

    // Calculate CHS using the weighted formula
    const chs =
        normalizedRating * 0.4 +
        course.completionRate * 0.3 +
        freshnessFactor * 0.3 -
        course.bugReportCount * 5;

    // Clamp between 0 and 100
    return Math.max(0, Math.min(100, Math.round(chs)));
}

/**
 * Update the health score for a specific course
 */
export async function updateCourseHealthScore(courseId: string): Promise<void> {
    const healthScore = await calculateHealthScore(courseId);

    await prisma.course.update({
        where: { id: courseId },
        data: { healthScore },
    });
}

/**
 * Recalculate health scores for all courses (for cron job)
 */
export async function recalculateAllHealthScores(): Promise<{
    updated: number;
    errors: string[];
}> {
    const courses = await prisma.course.findMany({
        where: { deletedAt: null },
        select: { id: true },
    });

    let updated = 0;
    const errors: string[] = [];

    for (const course of courses) {
        try {
            await updateCourseHealthScore(course.id);
            updated++;
        } catch (error) {
            errors.push(`Failed to update course ${course.id}: ${error}`);
        }
    }

    return { updated, errors };
}

/**
 * Mark a course as verified (resets freshness to 100)
 */
export async function markCourseAsVerified(courseId: string): Promise<void> {
    await prisma.course.update({
        where: { id: courseId },
        data: { lastReviewedAt: new Date() },
    });

    // Recalculate health score with new freshness
    await updateCourseHealthScore(courseId);
}

/**
 * Update course completion rate based on valid enrollments
 * "Valid enrollment" = user completed at least 1 topic
 */
export async function updateCourseCompletionRate(
    courseId: string
): Promise<void> {
    // Get all topics for this course
    const course = await prisma.course.findUnique({
        where: { id: courseId },
        include: {
            modules: {
                include: {
                    topics: { select: { id: true } },
                },
            },
        },
    });

    if (!course) return;

    const allTopicIds = course.modules.flatMap((c) => c.topics.map((t) => t.id));
    if (allTopicIds.length === 0) return;

    // Get all enrollments for this course
    const enrollments = await prisma.enrollment.findMany({
        where: { courseId },
        select: { userId: true },
    });

    if (enrollments.length === 0) {
        await prisma.course.update({
            where: { id: courseId },
            data: { completionRate: 0, enrollmentCount: 0 },
        });
        return;
    }

    // For each enrolled user, check if they completed at least 1 topic (valid enrollment)
    // and if they completed all topics (course completion)
    let validEnrollments = 0;
    let completions = 0;

    for (const { userId } of enrollments) {
        const userProgress = await prisma.userProgress.findMany({
            where: {
                userId,
                topicId: { in: allTopicIds },
                isTopicComplete: true,
            },
        });

        if (userProgress.length > 0) {
            validEnrollments++;

            // Check if all topics are complete
            if (userProgress.length === allTopicIds.length) {
                completions++;
            }
        }
    }

    const completionRate =
        validEnrollments > 0 ? (completions / validEnrollments) * 100 : 0;

    await prisma.course.update({
        where: { id: courseId },
        data: {
            completionRate,
            enrollmentCount: validEnrollments,
        },
    });
}

/**
 * Update all course completion rates (for cron job)
 */
export async function updateAllCompletionRates(): Promise<{
    updated: number;
    errors: string[];
}> {
    const courses = await prisma.course.findMany({
        where: { deletedAt: null },
        select: { id: true },
    });

    let updated = 0;
    const errors: string[] = [];

    for (const course of courses) {
        try {
            await updateCourseCompletionRate(course.id);
            updated++;
        } catch (error) {
            errors.push(`Failed to update completion rate for ${course.id}: ${error}`);
        }
    }

    return { updated, errors };
}

/**
 * Get stale/expired courses that need attention
 */
export async function getStaleCourses(): Promise<
    {
        id: string;
        title: string;
        daysSinceReview: number;
        status: "warning" | "expired" | "rotting";
    }[]
> {
    const courses = await prisma.course.findMany({
        where: { deletedAt: null, isPublic: true },
        select: {
            id: true,
            title: true,
            lastReviewedAt: true,
            contentVelocity: true,
        },
    });

    const now = new Date();
    const staleCourses = [];

    for (const course of courses) {
        const daysSinceReview = Math.floor(
            (now.getTime() - course.lastReviewedAt.getTime()) / (1000 * 60 * 60 * 24)
        );
        const ttl = VELOCITY_TTL[course.contentVelocity];
        const warningThreshold = ttl - 30; // T-30 days warning

        if (daysSinceReview >= ttl + 60) {
            // Rotting: +60 days past TTL
            staleCourses.push({
                id: course.id,
                title: course.title,
                daysSinceReview,
                status: "rotting" as const,
            });
        } else if (daysSinceReview >= ttl) {
            // Expired: past TTL
            staleCourses.push({
                id: course.id,
                title: course.title,
                daysSinceReview,
                status: "expired" as const,
            });
        } else if (daysSinceReview >= warningThreshold) {
            // Warning: T-30 days
            staleCourses.push({
                id: course.id,
                title: course.title,
                daysSinceReview,
                status: "warning" as const,
            });
        }
    }

    return staleCourses;
}

/**
 * Auto-deprecate rotting courses (hide from catalog)
 * Called by cron job for courses +60 days past TTL
 */
export async function deprecateRottingCourses(): Promise<{
    deprecated: number;
    courseIds: string[];
}> {
    const courses = await prisma.course.findMany({
        where: { deletedAt: null, isPublic: true },
        select: {
            id: true,
            lastReviewedAt: true,
            contentVelocity: true,
        },
    });

    const now = new Date();
    const toDeprecate: string[] = [];

    for (const course of courses) {
        const daysSinceReview = Math.floor(
            (now.getTime() - course.lastReviewedAt.getTime()) / (1000 * 60 * 60 * 24)
        );
        const ttl = VELOCITY_TTL[course.contentVelocity];

        if (daysSinceReview >= ttl + 60) {
            toDeprecate.push(course.id);
        }
    }

    if (toDeprecate.length > 0) {
        await prisma.course.updateMany({
            where: { id: { in: toDeprecate } },
            data: { isPublic: false }, // Hide from catalog
        });
    }

    return { deprecated: toDeprecate.length, courseIds: toDeprecate };
}
