'use server';

import { prisma as db } from "@/lib/prisma";
import { Course, Skill, User } from "@prisma/client";

export type CourseWithDetails = Course & {
    instructor: User;
    skills: Skill[];
    enrollments?: { length: number }[]; // Minimal check for enrollment count if needed
    _count?: {
        modules: number;
        enrollments: number;
    };
};

interface GetCoursesParams {
    term?: string;
    tag?: string;
}

export async function getCourses({
    term,
    tag,
}: GetCoursesParams = {}): Promise<CourseWithDetails[]> {
    try {
        const courses = await db.course.findMany({
            where: {
                isPublic: true,
                deletedAt: null, // Ensure deleted courses are not shown
                AND: [
                    // Search Term Filter
                    term
                        ? {
                            OR: [
                                { title: { contains: term, mode: "insensitive" } },
                                { description: { contains: term, mode: "insensitive" } },
                            ],
                        }
                        : {},
                    // Tag (Skill) Filter
                    tag
                        ? {
                            skills: {
                                some: {
                                    name: tag,
                                },
                            },
                        }
                        : {},
                ],
            },
            include: {
                instructor: true,
                skills: true,
                _count: {
                    select: {
                        modules: true,
                        enrollments: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return courses;
    } catch (error) {
        console.error("[GET_COURSES]", error);
        return [];
    }
}

export async function getCourseById(courseId: string, userId?: string) {
    try {
        const course = await db.course.findUnique({
            where: {
                id: courseId,
                deletedAt: null,
            },
            include: {
                instructor: true,
                skills: true,
                modules: {
                    orderBy: {
                        sortOrder: "asc",
                    },
                    include: {
                        topics: {
                            orderBy: {
                                sortOrder: "asc",
                            },
                            include: {
                                resources: true,
                                progress: userId ? {
                                    where: {
                                        userId,
                                    }
                                } : false,
                            },
                        },
                    },
                },
                enrollments: userId ? {
                    where: {
                        userId,
                    }
                } : false,
            },
        });

        if (!course) return null;

        // Visibility Check
        const isEnrolled = course.enrollments && course.enrollments.length > 0;
        const isInstructor = userId && course.instructorId === userId;

        if (!course.isPublic && !isEnrolled && !isInstructor) {
            return null;
        }

        return course;
    } catch (error) {
        console.error("[GET_COURSE_BY_ID]", error);
        return null;
    }
}
