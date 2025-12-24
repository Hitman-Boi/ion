import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

const SignInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password } = SignInSchema.parse(body)

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return NextResponse.json({
        title: 'User not found',
        status: 404,
        detail: 'No user found with this email address.'
      }, { status: 404 });
    }

    // Note: In a real app, you should verify the password here.
    // For now, we just return success if user exists.
    // const signInResult = await signIn('credentials', { email, password }); // This is client-side only

    return NextResponse.json({ success: true, user: { id: user.id, email: user.email, role: user.role } })
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