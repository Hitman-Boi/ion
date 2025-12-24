"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function markVideoComplete(topicId: string) {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    const userId = session.user.id;

    // 1. Upsert UserProgress with videoCompleted = true
    const progress = await prisma.userProgress.upsert({
        where: {
            userId_topicId: {
                userId,
                topicId,
            },
        },
        update: {
            videoCompleted: true,
        },
        create: {
            userId,
            topicId,
            videoCompleted: true,
        },
    });

    // 2. Check and update Topic Completion
    await checkTopicCompletion(userId, topicId, progress);

    revalidatePath(`/courses`);
    return { success: true };
}

export async function markPdfComplete(topicId: string) {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    const userId = session.user.id;

    const progress = await prisma.userProgress.upsert({
        where: {
            userId_topicId: {
                userId,
                topicId,
            },
        },
        update: {
            pdfCompleted: true,
        },
        create: {
            userId,
            topicId,
            pdfCompleted: true,
        },
    });

    await checkTopicCompletion(userId, topicId, progress);

    revalidatePath(`/courses`);
    return { success: true };
}

export async function submitQuiz(topicId: string, score: number) {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    const userId = session.user.id;
    const PASS_THRESHOLD = 70; // Hardcoded for now, could be dynamic

    const passed = score >= PASS_THRESHOLD;

    const progress = await prisma.userProgress.upsert({
        where: {
            userId_topicId: {
                userId,
                topicId,
            },
        },
        update: {
            quizScore: score,
            quizPassed: passed ? true : undefined, // Only update to true if passed, don't revert to false if they fail a retry? Or maybe we should? PROD logic: keep highest? PRD says "If Postgres says a user passed, they passed". So only set to true.
        },
        create: {
            userId,
            topicId,
            quizScore: score,
            quizPassed: passed,
        },
    });

    // If they passed this time, ensure quizPassed is definitely true in DB (upsert logic above handles it mostly, but let's be explicit if we want to "stick" the pass)
    if (passed) {
        await prisma.userProgress.update({
            where: { id: progress.id },
            data: { quizPassed: true }
        })
    }

    // Check completion
    // Fetch fresh progress to be sure
    const freshProgress = await prisma.userProgress.findUnique({
        where: { id: progress.id }
    });

    if (freshProgress) {
        await checkTopicCompletion(userId, topicId, freshProgress);
    }

    revalidatePath(`/courses`);
    return { success: true, passed, score };
}

async function checkTopicCompletion(userId: string, topicId: string, progress: any) {
    // Logic: A topic is complete if ALL atoms that EXIST in the topic are complete.
    // However, the PRD says: "Topic is a container of up to 3 atoms (Video, PDF, Quiz). A Topic is COMPLETED only when ALL present atoms are satisfied."
    // Simplified implementation for now: Check the flags in UserProgress. 
    // Ideally, we should check which resources *actually exist* for the topic.

    // 1. Get Topic Resources types
    const topicResources = await prisma.topicResource.findMany({
        where: { topicId },
        select: { type: true }
    });

    const hasVideo = topicResources.some(r => r.type === "VIDEO");
    const hasPdf = topicResources.some(r => r.type === "PDF");
    const hasQuiz = topicResources.some(r => r.type === "QUIZ");

    const videoDone = !hasVideo || progress.videoCompleted;
    const pdfDone = !hasPdf || progress.pdfCompleted;
    const quizDone = !hasQuiz || progress.quizPassed;

    const isComplete = videoDone && pdfDone && quizDone;

    if (isComplete !== progress.isTopicComplete) {
        await prisma.userProgress.update({
            where: { id: progress.id },
            data: { isTopicComplete: isComplete }
        });

        // Trigger Course Completion Check if Topic is newly complete
        if (isComplete) {
            // Find courseId first
            const topic = await prisma.topic.findUnique({
                where: { id: topicId },
                include: { chapter: { select: { courseId: true } } }
            });

            if (topic?.chapter?.courseId) {
                await checkCourseCompletion(userId, topic.chapter.courseId);
            }
        }
    }
}

async function checkCourseCompletion(userId: string, courseId: string) {
    // 1. Fetch Course with Skills and All Topics
    const course = await prisma.course.findUnique({
        where: { id: courseId },
        include: {
            skills: true,
            chapters: {
                include: {
                    topics: { select: { id: true } }
                }
            }
        }
    });

    if (!course) return;

    // 2. Flatten Topics
    const allTopics = course.chapters.flatMap(c => c.topics);
    if (allTopics.length === 0) return;

    // 3. User Progress for these topics
    const userProgress = await prisma.userProgress.findMany({
        where: {
            userId,
            topicId: { in: allTopics.map(t => t.id) },
            isTopicComplete: true
        },
        select: { topicId: true }
    });

    // 4. Check if All Topics Complete
    const isCourseComplete = allTopics.every(t => userProgress.some(up => up.topicId === t.id));

    if (isCourseComplete) {
        // 5. Award Skills
        if (course.skills.length > 0) {
            for (const skill of course.skills) {
                await prisma.userSkill.upsert({
                    where: {
                        userId_skillId: {
                            userId,
                            skillId: skill.id
                        }
                    },
                    create: {
                        userId,
                        skillId: skill.id
                    },
                    update: {} // Already exists, do nothing (or update acquiredAt?)
                });
            }
            // Trigger standard revalidation?
            // Maybe notify user?
        }

        // Optionally mark Enrollment as completed if we had a status field
        // For now, we rely on progress calculation in UI.
    }
}
