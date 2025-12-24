"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

/**
 * Check if current user has completed a specific course
 * Used by FocusPlayer to trigger the completion modal
 */
export async function checkUserCourseCompletion(
    courseId: string
): Promise<{
    isComplete: boolean;
    hasReviewed: boolean;
    courseTitle: string;
    totalTopics: number;
    completedTopics: number;
}> {
    const session = await auth();
    if (!session?.user?.id) {
        return { isComplete: false, hasReviewed: false, courseTitle: "", totalTopics: 0, completedTopics: 0 };
    }

    const userId = session.user.id;

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

    if (!course) {
        return { isComplete: false, hasReviewed: false, courseTitle: "", totalTopics: 0, completedTopics: 0 };
    }

    const allTopicIds = course.modules.flatMap((c) => c.topics.map((t) => t.id));
    const totalTopics = allTopicIds.length;

    if (totalTopics === 0) {
        return { isComplete: true, hasReviewed: false, courseTitle: course.title, totalTopics: 0, completedTopics: 0 };
    }

    // Get user's completed topics
    const completedProgress = await prisma.userProgress.findMany({
        where: {
            userId,
            topicId: { in: allTopicIds },
            isTopicComplete: true,
        },
    });

    const completedTopics = completedProgress.length;
    const isComplete = completedTopics === totalTopics;

    // Check if user has already reviewed
    const existingReview = await prisma.courseReview.findUnique({
        where: {
            userId_courseId: { userId, courseId },
        },
    });

    return {
        isComplete,
        hasReviewed: !!existingReview,
        courseTitle: course.title,
        totalTopics,
        completedTopics,
    };
}

