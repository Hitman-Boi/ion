"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createSkill(data: { name: string; category?: string }) {
    // Skip auth check

    // Check if skill already exists (case-insensitive)
    const existingSkill = await prisma.skill.findFirst({
        where: { name: { equals: data.name, mode: "insensitive" } },
    });

    if (existingSkill) {
        return existingSkill;
    }

    const skill = await prisma.skill.create({
        data: {
            name: data.name,
            category: data.category,
        },
    });

    revalidatePath("/admin-dashboard/skills");
    return skill;
}

export async function searchSkills(query: string) {
    if (!query || query.trim().length === 0) {
        return await prisma.skill.findMany({ orderBy: { name: "asc" } });
    }

    return await prisma.skill.findMany({
        where: {
            name: { contains: query, mode: "insensitive" },
        },
        orderBy: { name: "asc" },
    });
}

export async function createSkillTarget(data: { skillName: string; targetCount: number }) {
    // Skip auth check

    const target = await prisma.skillTarget.create({
        data: {
            skillName: data.skillName,
            targetCount: data.targetCount,
        },
    });

    revalidatePath("/admin-dashboard/skills");
    return target;
}

export async function getSkillGapData() {
    const targets = await prisma.skillTarget.findMany();

    const data = await Promise.all(targets.map(async (target) => {
        const skill = await prisma.skill.findUnique({
            where: { name: target.skillName },
            include: { userSkills: true }
        });

        const currentCount = skill ? skill.userSkills.length : 0;

        return {
            ...target,
            currentCount,
            gap: Math.max(0, target.targetCount - currentCount)
        };
    }));

    return data;
}

export async function getSkills() {
    return await prisma.skill.findMany();
}
