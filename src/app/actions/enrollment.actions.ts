"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function completeCourse(courseId: string) {
    const session = await auth();
    if (!session?.user) {
        throw new Error("Unauthorized");
    }

    // 1. Mark enrollment as complete (simplified for now, usually involves checking all blocks)
    // For this demo, we'll assume calling this action completes the course.

    // 2. Fetch course skills
    const course = await prisma.course.findUnique({
        where: { id: courseId },
        include: { skills: true },
    });

    if (!course) throw new Error("Course not found");

    // 3. Grant skills to user
    for (const skill of course.skills) {
        try {
            await prisma.userSkill.create({
                data: {
                    userId: session.user.id,
                    skillId: skill.id,
                },
            });
        } catch (e) {
            // Ignore unique constraint violation if user already has skill
            console.log(`User already has skill ${skill.name}`);
        }
    }

    revalidatePath("/learner-dashboard");
    revalidatePath("/admin/skills");
}

export async function enrollUser(courseId: string) {
    const session = await auth();

    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    const enrollment = await prisma.enrollment.create({
        data: {
            userId: session.user.id,
            courseId: courseId,
        },
    });

    revalidatePath(`/courses/${courseId}`);
    return enrollment;
}
