"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function getLearningPath(targetRoleId: string) {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    const userId = session.user.id;

    // 1. Fetch Target Role & Required Skills
    const targetRole = await prisma.jobRole.findUnique({
        where: { id: targetRoleId },
        include: { skills: true }
    });

    if (!targetRole) throw new Error("Role not found");

    // 2. Fetch User's Acquired Skills
    const userSkills = await prisma.userSkill.findMany({
        where: { userId },
        include: { skill: true }
    });

    const acquiredSkillIds = new Set(userSkills.map(us => us.skillId));

    // 3. Identify Missing Skills
    const missingSkills = targetRole.skills.filter(skill => !acquiredSkillIds.has(skill.id));
    const missingSkillIds = missingSkills.map(s => s.id);

    if (missingSkillIds.length === 0) {
        return {
            status: "COMPLETED",
            missingSkills: [],
            courses: []
        };
    }

    // 4. Find Courses that teach missing skills
    // We want courses where at least one of the course's skills is in our missing list.
    const courses = await prisma.course.findMany({
        where: {
            skills: {
                some: {
                    id: { in: missingSkillIds }
                }
            },
            deletedAt: null // Ensure we don't recommend deleted courses
        },
        include: {
            skills: true,
            enrollments: {
                where: { userId }
            }
        }
    });

    // 5. Rank/Sort Logic (Simple version: greedy coverage)
    // We can order by how many missing skills they cover
    const rankedCourses = courses.sort((a, b) => {
        const aCoverage = a.skills.filter(s => missingSkillIds.includes(s.id)).length;
        const bCoverage = b.skills.filter(s => missingSkillIds.includes(s.id)).length;
        return bCoverage - aCoverage; // Descending
    });

    return {
        status: "IN_PROGRESS",
        targetRole,
        missingSkills,
        courses: rankedCourses
    };
}
