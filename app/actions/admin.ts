"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { CourseRole, Role } from "@prisma/client"
import { revalidatePath } from "next/cache"

// Helper to check if user is admin
async function checkAdmin() {
    const session = await auth()
    // @ts-ignore
    if (session?.user?.role !== "ADMIN") {
        throw new Error("Unauthorized")
    }
}

export async function updateUserGlobalRole(userId: string, role: Role) {
    await checkAdmin()

    await prisma.user.update({
        where: { id: userId },
        data: { role },
    })

    revalidatePath("/admin")
}

export async function updateCourseEnrollmentRole(courseId: string, userId: string, role: CourseRole) {
    await checkAdmin()

    await prisma.enrollment.update({
        where: {
            userId_courseId: {
                userId,
                courseId,
            },
        },
        data: { role },
    })

    revalidatePath(`/admin`)
    revalidatePath(`/admin/courses/${courseId}`)
}

export async function enrollUserInCourse(courseId: string, userId: string, role: CourseRole = "STUDENT") {
    await checkAdmin()

    await prisma.enrollment.upsert({
        where: {
            userId_courseId: {
                userId,
                courseId
            }
        },
        update: { role },
        create: {
            userId,
            courseId,
            role
        }
    })
    revalidatePath(`/admin`)
    revalidatePath(`/admin/courses/${courseId}`)
}

export async function createCourse(title: string) {
    console.log("createCourse action called with title:", title)
    await checkAdmin()
    const session = await auth()
    console.log("Session in createCourse:", session)

    if (!session?.user?.id) {
        console.error("User not found in session")
        throw new Error("User not found")
    }

    try {
        const course = await prisma.course.create({
            data: {
                title,
                instructorId: session.user.id,
            },
        })
        console.log("Course created successfully:", course.id)
        return course.id
    } catch (error) {
        console.error("Database error creating course:", error)
        throw new Error("Failed to create course in database")
    }
}

export async function promoteToAdmin(email: string) {
    await checkAdmin()

    const user = await prisma.user.findUnique({
        where: { email },
    })

    if (!user) {
        throw new Error("User not found")
    }

    await prisma.user.update({
        where: { email },
        data: { role: "ADMIN" },
    })

    revalidatePath("/admin")
}

export async function getNonAdminUsers() {
    await checkAdmin()

    return prisma.user.findMany({
        where: {
            role: {
                not: "ADMIN"
            }
        },
        select: {
            id: true,
            email: true,
            name: true,
            image: true
        }
    })
}

export async function toggleCourseVisibility(courseId: string, isPublic: boolean) {
    await checkAdmin()
    await prisma.course.update({
        where: { id: courseId },
        data: { isPublic }
    })
    revalidatePath(`/admin/courses/${courseId}`)
}

export async function getUnenrolledUsers(courseId: string) {
    await checkAdmin()

    // Get all users who are NOT enrolled in this course
    return prisma.user.findMany({
        where: {
            enrollments: {
                none: {
                    courseId: courseId
                }
            }
        },
        select: {
            id: true,
            email: true,
            name: true,
            image: true
        },
        take: 50 // Limit to 50 for performance
    })
}

export async function removeUserFromCourse(courseId: string, userId: string) {
    await checkAdmin()

    await prisma.enrollment.delete({
        where: {
            userId_courseId: {
                userId,
                courseId,
            },
        },
    })

    revalidatePath(`/admin/courses/${courseId}`)
}

export async function deleteCourse(courseId: string) {
    await checkAdmin()
    await prisma.course.update({
        where: { id: courseId },
        data: { deletedAt: new Date() }
    })
    revalidatePath("/admin")
    revalidatePath(`/admin/courses/${courseId}`)
}

export async function restoreCourse(courseId: string) {
    await checkAdmin()
    await prisma.course.update({
        where: { id: courseId },
        data: { deletedAt: null }
    })
    revalidatePath("/admin")
    revalidatePath(`/admin/courses/${courseId}`)
}
