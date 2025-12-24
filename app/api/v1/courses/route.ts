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
  title: z.string().min(3),
  description: z.string().min(10),
  moduleId: z.number(),
  organizationId: z.number()
})

const CourseUpdateSchema = z.object({
  title: z.string().min(3).optional(),
  description: z.string().min(10).optional(),
  moduleId: z.number().optional(),
  organizationId: z.number().optional()
})

import { NextRequest } from 'next/server'

export const POST = withAuth(async (request: NextRequest) => {
  try {
    const body = await request.json()
    const { title, description, moduleId, organizationId } = CourseCreateSchema.parse(body)

    const existingModule = await prisma.module.findUnique({
      where: { id: moduleId }
    })

    if (!existingModule) {
      return NextResponse.json({
        title: 'Module not found',
        status: 404,
        detail: 'The specified module does not exist.'
      }, { status: 404 })
    }

    const course = await prisma.course.create({
      data: { title, description, moduleId, organizationId }
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
          { title: { contains: search || '' } },
          { description: { contains: search || '' } }
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