"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { updateCourseHealthScore } from "./health-score.actions";

/**
 * Submit or update a course review
 * Users can only have one review per course (enforced by unique constraint)
 */
export async function submitCourseReview(
    courseId: string,
    rating: number,
    comment?: string,
    isPublic: boolean = false
): Promise<{ success: boolean; isNew: boolean }> {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    // Validate rating
    if (rating < 1 || rating > 5) {
        throw new Error("Rating must be between 1 and 5");
    }

    const userId = session.user.id;

    // Upsert the review
    const existingReview = await prisma.courseReview.findUnique({
        where: {
            userId_courseId: { userId, courseId },
        },
    });

    if (existingReview) {
        await prisma.courseReview.update({
            where: { id: existingReview.id },
            data: { rating, comment, isPublic },
        });
    } else {
        await prisma.courseReview.create({
            data: {
                userId,
                courseId,
                rating,
                comment,
                isPublic,
            },
        });
    }

    // Update course aggregated metrics
    await updateCourseRatingMetrics(courseId);

    // Recalculate health score
    await updateCourseHealthScore(courseId);

    revalidatePath(`/courses/${courseId}`);
    revalidatePath(`/learner-dashboard`);

    return { success: true, isNew: !existingReview };
}

/**
 * Update the cached average rating and review count for a course
 */
async function updateCourseRatingMetrics(courseId: string): Promise<void> {
    const metrics = await prisma.courseReview.aggregate({
        where: { courseId },
        _avg: { rating: true },
        _count: { rating: true },
    });

    await prisma.course.update({
        where: { id: courseId },
        data: {
            averageRating: metrics._avg.rating || 0,
            reviewCount: metrics._count.rating,
        },
    });
}

/**
 * Get user's review for a specific course (if exists)
 */
export async function getUserReviewForCourse(
    courseId: string
): Promise<{ rating: number; comment: string | null; isPublic: boolean } | null> {
    const session = await auth();
    if (!session?.user?.id) {
        return null;
    }

    const review = await prisma.courseReview.findUnique({
        where: {
            userId_courseId: {
                userId: session.user.id,
                courseId,
            },
        },
        select: {
            rating: true,
            comment: true,
            isPublic: true,
        },
    });

    return review;
}

/**
 * Get all reviews for a course
 * Comments are anonymized unless user opted for public review
 */
export async function getCourseReviews(courseId: string): Promise<
    {
        id: string;
        rating: number;
        comment: string | null;
        userName: string | null;
        createdAt: Date;
    }[]
> {
    const reviews = await prisma.courseReview.findMany({
        where: { courseId },
        include: {
            user: {
                select: { name: true },
            },
        },
        orderBy: { createdAt: "desc" },
    });

    return reviews.map((review) => ({
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        // Anonymize if not public
        userName: review.isPublic ? review.user.name : null,
        createdAt: review.createdAt,
    }));
}

/**
 * Delete user's own review
 */
export async function deleteMyReview(courseId: string): Promise<void> {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    await prisma.courseReview.delete({
        where: {
            userId_courseId: {
                userId: session.user.id,
                courseId,
            },
        },
    });

    // Update metrics after deletion
    await updateCourseRatingMetrics(courseId);
    await updateCourseHealthScore(courseId);

    revalidatePath(`/courses/${courseId}`);
}
