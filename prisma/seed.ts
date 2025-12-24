import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const password = await bcrypt.hash('admin', 10)
  const testPassword = await bcrypt.hash('test', 10)
  const instructorPassword = await bcrypt.hash('instructor', 10)

  // --- Users (using upsert for idempotency) ---
  const admin = await prisma.user.upsert({
    where: { email: 'admin@learning-hub.iongroup.com' },
    update: {
      password,
      role: 'ADMIN',
    },
    create: {
      email: 'admin@learning-hub.iongroup.com',
      name: 'Admin User',
      password,
      role: 'ADMIN',
    },
  })

  const testUser = await prisma.user.upsert({
    where: { email: 'test@learning-hub.iongroup.com' },
    update: {},
    create: {
      email: 'test@learning-hub.iongroup.com',
      name: 'Test User',
      password: testPassword,
      role: 'STUDENT',
    },
  })

  const instructor = await prisma.user.upsert({
    where: { email: 'instructor@learning-hub.iongroup.com' },
    update: {
      password: instructorPassword,
      role: 'INSTRUCTOR',
    },
    create: {
      email: 'instructor@learning-hub.iongroup.com',
      name: 'Instructor User',
      password: instructorPassword,
      role: 'INSTRUCTOR',
    },
  })

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
                          title: 'Welcome Video',
                          type: 'VIDEO',
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
                          title: 'Setup Guide',
                          type: 'PDF',
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
    update: {},
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