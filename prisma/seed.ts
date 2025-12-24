import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const password = await bcrypt.hash('admin', 10)
  const testPassword = await bcrypt.hash('test', 10)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {
      password,
      role: 'ADMIN',
    },
    create: {
      email: 'admin@example.com',
      name: 'Admin User',
      password,
      role: 'ADMIN',
    },
  })

  const testUser = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      name: 'Test User',
      password: testPassword,
      role: 'STUDENT',
    },
  })

  console.log({ admin, testUser })

  // --- Module B: Workforce Intelligence Seed Data ---

  // 1. Create Skill "React.js"
  const reactSkill = await prisma.skill.upsert({
    where: { name: 'React.js' },
    update: {},
    create: {
      name: 'React.js',
      category: 'Frontend Development',
    },
  })

  // 2. Set Target for "React.js" to 5
  await prisma.skillTarget.create({
    data: {
      skillName: 'React.js',
      targetCount: 5,
    },
  })

  // 3. Create Course "Advanced React" and link it to "React.js" skill
  const advancedReactCourse = await prisma.course.create({
    data: {
      title: 'Advanced React',
      description: 'Deep dive into React hooks, patterns, and performance.',
      instructorId: admin.id, // Assigning to admin for now
      skills: {
        connect: { id: reactSkill.id },
      },
      enrollments: {
        create: {
          userId: testUser.id,
          role: 'STUDENT'
        }
      },
      chapters: {
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

  console.log({ reactSkill, advancedReactCourse })

  // 4. Create Role "Senior Frontend Engineer"
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

  // 5. Create Learning Path
  const learningPath = await prisma.learningPath.create({
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

  .finally(async () => {
    await prisma.$disconnect();
  });