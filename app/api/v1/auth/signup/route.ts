import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

const SignupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2)
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password, name } = SignupSchema.parse(body)

    // Implementation will be added in code mode
    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      return NextResponse.json({
        title: 'User already exists',
        status: 409,
        detail: 'A user with this email already exists in the organization.'
      }, { status: 409 });
    }

    // Implementation will be added in code mode
    const newUser = await prisma.user.create({
      data: { email, password, name, role: 'USER' }
    });

    return NextResponse.json({ success: true, user: { id: newUser.id, email: newUser.email, name: newUser.name, role: newUser.role } })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        title: 'Invalid request payload',
        status: 400,
        detail: error.message
      }, { status: 400 })
    }

    return NextResponse.json({
      title: 'Internal server error',
      status: 500,
      detail: 'An unexpected error occurred.'
    }, { status: 500 })
  }
}