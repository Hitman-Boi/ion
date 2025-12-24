import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma';
import { withAuth } from '@/lib/auth-utils';
import { z } from 'zod';

const EnrollmentGetSchema = z.object({
  search: z.string().optional(),
  page: z.number().min(1).optional(),
  pageSize: z.number().min(1).max(100).optional()
})

import { NextRequest } from 'next/server'

export const GET = withAuth(async (request: NextRequest, { params }: { params: { id: string } }) => {
  const { search, page, pageSize } = EnrollmentGetSchema.parse(request.nextUrl.searchParams);
  try {
    const enrollment = await prisma.enrollment.findUnique({
      where: { id: parseInt(params.id) },
      include: {
        user: true,
        course: true
      }
    })

    if (!enrollment) {
      return NextResponse.json({
        title: 'Enrollment not found',
        status: 404,
        detail: 'The requested enrollment does not exist.'
      }, { status: 404 });
    }

    return NextResponse.json(enrollment, { status: 200 })
  } catch (error) {
    return NextResponse.json({
      title: 'Internal server error',
      status: 500,
      detail: 'An unexpected error occurred while retrieving the enrollment.'
    }, { status: 500 })
  }
}, 'GET')

export const DELETE = withAuth(async (request: NextRequest, { params }: { params: { id: string } }) => {
  const { id } = params;
  const enrollmentId = parseInt(id.toString());

  // Validate enrollment exists before deletion
  const existingEnrollment = await prisma.enrollment.findUnique({
    where: { id: enrollmentId }
  });

  if (!existingEnrollment) {
    return NextResponse.json({
      title: 'Enrollment not found',
      status: 404,
      detail: 'The requested enrollment does not exist.'
    }, { status: 404 });
  }
  try {
    await prisma.enrollment.delete({
      where: { id: enrollmentId },
      include: {
        user: true,
        course: true
      }
    })
    return NextResponse.json({ success: true, enrollment: existingEnrollment })
  } catch (error) {
    return NextResponse.json({
      title: 'Internal server error',
      status: 500,
      detail: 'An unexpected error occurred while deleting the enrollment.'
    }, { status: 500 })
  }
}, 'DELETE')