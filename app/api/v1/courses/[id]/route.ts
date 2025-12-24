import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAuth } from '@/lib/auth-utils'
import { z } from 'zod'

const CourseUpdateSchema = z.object({
  title: z.string().min(3).optional()
})

import { NextRequest } from 'next/server'

export const GET = withAuth(async (request: NextRequest, { params }: { params: { id: string } }) => {
  try {
    const course = await prisma.course.findUnique({
      where: { id: parseInt(params.id) }
    })

    if (!course) {
      return NextResponse.json({
        title: 'Course not found',
        status: 404,
        detail: 'The requested course does not exist.'
      }, { status: 404 })
    }

    return NextResponse.json(course)
  } catch (error) {
    return NextResponse.json({
      title: 'Internal server error',
      status: 500,
      detail: 'An unexpected error occurred.'
    }, { status: 500 })
  }
}, 'GET')

export const PUT = withAuth(async (request: NextRequest, { params }: { params: { id: string } }) => {
  try {
    const body = await request.json()
    const { title } = CourseUpdateSchema.parse(body)

    const course = await prisma.course.findUnique({
      where: { id: parseInt(params.id) }
    })

    if (!course) {
      return NextResponse.json({
        title: 'Course not found',
        status: 404,
        detail: 'The requested course does not exist.'
      }, { status: 404 })
    }

    const updatedCourse = await prisma.course.update({
      where: { id: parseInt(params.id) },
      data: { title }
    })
    return NextResponse.json(updatedCourse)
  } catch (error) {
    return NextResponse.json({
      title: 'Internal server error',
      status: 500,
      detail: 'An unexpected error occurred.'
    }, { status: 500 })
  }
}, 'PUT')

export const DELETE = withAuth(async (request: NextRequest, { params }: { params: { id: string } }) => {
  try {
    await prisma.course.delete({
      where: { id: parseInt(params.id) }
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({
      title: 'Internal server error',
      status: 500,
      detail: 'An unexpected error occurred.'
    }, { status: 500 })
  }
}, 'DELETE')