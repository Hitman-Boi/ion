import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { withAuth } from '@/lib/auth-utils'

const CourseGetSchema = z.object({
  search: z.string().optional(),
  page: z.coerce.number().min(1).optional(),
  pageSize: z.coerce.number().min(1).max(100).optional()
})

const CourseCreateSchema = z.object({
  title: z.string().min(3)
})

const CourseUpdateSchema = z.object({
  title: z.string().min(3).optional()
})

import { NextRequest } from 'next/server'

export const POST = withAuth(async (request: NextRequest) => {
  try {
    const body = await request.json()
    const { title } = CourseCreateSchema.parse(body)

    // TODO: Get actual instructorId from session
    const course = await prisma.course.create({
      data: { title, instructorId: 1 }
    })

    return NextResponse.json(course, { status: 201 })
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
    const { search, page, pageSize } = CourseGetSchema.parse(Object.fromEntries(request.nextUrl.searchParams))

    const courses = await prisma.course.findMany({
      skip: (page || 1) - 1 * (pageSize || 10),
      take: pageSize || 10,
      where: {
        OR: [
          { title: { contains: search || '' } }
        ]
      }
    })

    return NextResponse.json(courses)
  } catch (error) {
    return NextResponse.json({
      title: 'Internal server error',
      status: 500,
      detail: 'An unexpected error occurred.'
    }, { status: 500 })
  }
}, 'GET')