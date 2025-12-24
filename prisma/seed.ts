import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const password = await bcrypt.hash('admin', 10)
  const testPassword = await bcrypt.hash('test', 10)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
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
      }
    },
  })

  console.log({ reactSkill, advancedReactCourse })
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