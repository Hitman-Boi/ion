import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { withAuth } from '@/lib/auth-utils'

const UserCreateSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(['ADMIN', 'INSTRUCTOR', 'STUDENT'])
})

const UserGetSchema = z.object({
  search: z.string().optional(),
  page: z.number().min(1).optional(),
  pageSize: z.number().min(1).max(100).optional()
})

import { NextRequest } from 'next/server'

export const POST = withAuth(async (request: NextRequest) => {
  try {
    const body = await request.json()
    const { email, password, role } = UserCreateSchema.parse(body)

    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json({
        title: 'User already exists',
        status: 409,
        detail: 'A user with this email already exists in the organization.'
      }, { status: 409 })
    }

    const user = await prisma.user.create({
      data: { email, password, role }
    })

    return NextResponse.json(user, { status: 201 })
  } catch (error) {
    // Implementation will be added in code mode
    return NextResponse.json({
      title: 'Internal server error',
      status: 500,
      detail: 'An unexpected error occurred.'
    }, { status: 500 })
  }
}, 'POST')

export const GET = withAuth(async (request: NextRequest) => {
  try {
    const { search, page, pageSize } = UserGetSchema.parse(Object.fromEntries(request.nextUrl.searchParams))

    const users = await prisma.user.findMany({
      skip: (page || 1) - 1 * (pageSize || 10),
      take: pageSize || 10,
      where: {
        OR: [
          { email: { contains: search || '' } }
        ]
      }
    })
    return NextResponse.json(users)
  } catch (error) {
    // Implementation will be added in code mode
    return NextResponse.json({
      title: 'Internal server error',
      status: 500,
      detail: 'An unexpected error occurred.'
    }, { status: 500 })
  }
}, 'GET')