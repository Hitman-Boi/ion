import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Clean up the test database
  await prisma.enrollment.deleteMany({});
  await prisma.module.deleteMany({});
  await prisma.course.deleteMany({});
  await prisma.user.deleteMany({});

  // Create test users
  await prisma.user.create({
    data: {
      email: 'student@example.com',
      password: 'password123',
      role: 'STUDENT',
    },
  });

  await prisma.user.create({
    data: {
      email: 'instructor@example.com',
      password: 'password123',
      role: 'INSTRUCTOR',
    },
  });

  // Create test course
  await prisma.course.create({
    data: {
      title: 'Test Course',
      instructor: {
        connect: { email: 'instructor@example.com' },
      },
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });