import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { TEST_USERS } from '../src/lib/test-users'

const prisma = new PrismaClient()

async function main() {
  // --- Users (using upsert for idempotency) ---
  const users = [TEST_USERS.ADMIN, TEST_USERS.STUDENT, TEST_USERS.INSTRUCTOR];

  for (const user of users) {
    const hashedPassword = await bcrypt.hash(user.password, 10);
    await prisma.user.upsert({
      where: { email: user.email },
      update: {
        password: hashedPassword,
        role: user.role,
      },
      create: {
        email: user.email,
        name: user.name,
        password: hashedPassword,
        role: user.role,
      },
    });
  }

  const admin = await prisma.user.findUniqueOrThrow({ where: { email: TEST_USERS.ADMIN.email } });
  const testUser = await prisma.user.findUniqueOrThrow({ where: { email: TEST_USERS.STUDENT.email } });
  const instructor = await prisma.user.findUniqueOrThrow({ where: { email: TEST_USERS.INSTRUCTOR.email } });

  console.log({ admin, testUser, instructor })

  // --- Module B: Workforce Intelligence Seed Data ---

  // 1. Create Skill "React.js" (using upsert for idempotency)
  const reactSkill = await prisma.skill.upsert({
    where: { name: 'React.js' },
    update: {},
    create: {
      name: 'React.js',
      category: 'Frontend Development',
    },
  })

  // 2. Set Target for "React.js" to 5 (check if exists first)
  const existingSkillTarget = await prisma.skillTarget.findFirst({
    where: { skillName: 'React.js' },
  })
  if (!existingSkillTarget) {
    await prisma.skillTarget.create({
      data: {
        skillName: 'React.js',
        targetCount: 5,
      },
    })
  }

  // 3. Create Course "Advanced React" (check if exists first)
  let advancedReactCourse = await prisma.course.findFirst({
    where: { title: 'Advanced React' },
  })

  if (!advancedReactCourse) {
    advancedReactCourse = await prisma.course.create({
      data: {
        title: 'Advanced React',
        description: 'Deep dive into React hooks, patterns, and performance.',
        instructorId: admin.id,
        skills: {
          connect: { id: reactSkill.id },
        },
        modules: {
          create: [
            {
              title: 'Introduction',
              sortOrder: 1,
              topics: {
                create: [
                  {
                    title: 'Welcome to the Course',
                    sortOrder: 1,
                    resources: {
                      create: [
                        {
                          type: 'VIDEO',
                          summary: 'Video from example.com',
                          contentUrl: 'https://example.com/video.mp4',
                          sortOrder: 1
                        }
                      ]
                    }
                  },
                  {
                    title: 'Setup Environment',
                    sortOrder: 2,
                    resources: {
                      create: [
                        {
                          type: 'PDF',
                          summary: 'Reading: guide.pdf',
                          contentUrl: 'https://example.com/guide.pdf',
                          sortOrder: 1
                        }
                      ]
                    }
                  }
                ]
              }
            }
          ]
        }
      },
    })
  }

  // Ensure test user enrollment exists (using upsert via unique constraint)
  await prisma.enrollment.upsert({
    where: {
      userId_courseId: {
        userId: testUser.id,
        courseId: advancedReactCourse.id,
      },
    },
    update: {
      role: 'STUDENT',
    },
    create: {
      userId: testUser.id,
      courseId: advancedReactCourse.id,
      role: 'STUDENT',
    },
  })

  // Ensure instructor enrollment exists (using upsert via unique constraint)
  await prisma.enrollment.upsert({
    where: {
      userId_courseId: {
        userId: instructor.id,
        courseId: advancedReactCourse.id,
      },
    },
    update: {
      role: 'INSTRUCTOR',
    },
    create: {
      userId: instructor.id,
      courseId: advancedReactCourse.id,
      role: 'INSTRUCTOR',
    },
  })

  // 3b. Create "Studio Test Course" for Instructor (for E2E testing)
  let studioTestCourse = await prisma.course.findFirst({
    where: { title: 'Studio Test Course' },
  })

  if (!studioTestCourse) {
    studioTestCourse = await prisma.course.create({
      data: {
        title: 'Studio Test Course',
        description: 'A blank canvas for testing the Studio UI.',
        instructorId: instructor.id,
        skills: {
          connect: { id: reactSkill.id },
        },
      },
    })
  } else {
    // Ensure instructor is set correctly if it already exists
    await prisma.course.update({
      where: { id: studioTestCourse.id },
      data: { instructorId: instructor.id }
    })
  }

  console.log({ studioTestCourse })

  console.log({ reactSkill, advancedReactCourse })

  // 4. Create Role "Senior Frontend Engineer" (using upsert for idempotency)
  const frontendRole = await prisma.jobRole.upsert({
    where: { title: 'Senior Frontend Engineer' },
    update: {},
    create: {
      title: 'Senior Frontend Engineer',
      description: 'Master React, Performance, and Architecture.',
      skills: {
        connect: { id: reactSkill.id },
      },
    },
  })

  // 5. Create Learning Path (check if exists first)
  let learningPath = await prisma.learningPath.findFirst({
    where: { title: 'Frontend Mastery' },
  })

  if (!learningPath) {
    learningPath = await prisma.learningPath.create({
      data: {
        title: 'Frontend Mastery',
        description: 'The ultimate guide to becoming a Senior Frontend Engineer.',
        roles: {
          connect: { id: frontendRole.id },
        },
        items: {
          create: [
            {
              orderIndex: 1,
              courseId: advancedReactCourse.id,
            },
          ],
        },
      },
    })
  }

  console.log({ frontendRole, learningPath })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })