"use server";

import { prisma as db } from "@/lib/prisma";
import { CourseRole } from "@prisma/client";

export async function getInstructorCourses(userId: string) {
    if (!userId) return [];

    const courses = await db.course.findMany({
        where: {
            OR: [
                { instructorId: userId },
                {
                    enrollments: {
                        some: {
                            userId: userId,
                            role: {
                                in: [CourseRole.INSTRUCTOR, CourseRole.MODERATOR],
                            },
                            isActive: true,
                        },
                    },
                },
            ],
        },
        include: {
            _count: {
                select: {
                    enrollments: true,
                    chapters: true,
                },
            },
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    return courses;
}

export async function isUserInstructor(userId: string) {
    if (!userId) return false;

    const count = await db.course.count({
        where: {
            OR: [
                { instructorId: userId },
                {
                    enrollments: {
                        some: {
                            userId: userId,
                            role: {
                                in: [CourseRole.INSTRUCTOR, CourseRole.MODERATOR],
                            },
                            isActive: true,
                        },
                    },
                },
            ],
        },
    });

    return count > 0;
}
