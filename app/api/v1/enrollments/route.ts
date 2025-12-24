import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { withAuth } from '@/lib/auth-utils'

const EnrollmentGetSchema = z.object({
  search: z.string().optional(),
  page: z.coerce.number().min(1).optional(),
  pageSize: z.coerce.number().min(1).max(100).optional()
})

const EnrollmentCreateSchema = z.object({
  userId: z.number(),
  courseId: z.number()
})

import { NextRequest } from 'next/server'

export const POST = withAuth(async (request: NextRequest) => {
  try {
    const body = await request.json()
    const { userId, courseId } = EnrollmentCreateSchema.parse(body)

    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    })

    const existingCourse = await prisma.course.findUnique({
      where: { id: courseId }
    })

    if (!existingUser || !existingCourse) {
      return NextResponse.json({
        title: 'Resource not found',
        status: 404,
        detail: 'User or course does not exist'
      }, { status: 404 })
    }

    const enrollment = await prisma.enrollment.create({
      data: { userId, courseId }
    })

    return NextResponse.json(enrollment, { status: 201 })
  } catch (error) {
    return NextResponse.json({
      title: 'Internal server error',
      status: 500,
      detail: 'An unexpected error occurred.'
    }, { status: 500 })
  }
}, 'POST')

export const GET = withAuth(async (request: NextRequest) => {
  try {
    const { search, page, pageSize } = EnrollmentGetSchema.parse(Object.fromEntries(request.nextUrl.searchParams))
    const skip = (page || 1) - 1
    const take = pageSize || 10
    const enrollments = await prisma.enrollment.findMany({
      skip: skip * take,
      take,
      where: search ? {
        OR: [
          { user: { email: { contains: search } } }, // Assuming search by user email
          // { courseId: { contains: search } } // courseId is int, cannot contains string
        ]
      } : undefined,
    })

    return NextResponse.json(enrollments)
  } catch (error) {
    return NextResponse.json({
      title: 'Internal server error',
      status: 500,
      detail: 'An unexpected error occurred.'
    }, { status: 500 })
  }
}, 'GET')