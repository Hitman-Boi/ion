import { NextResponse } from 'next/server'
import { auth } from '@/auth'

import { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const session = await auth()
  const { pathname } = request.nextUrl

  // Protect dashboard routes
  if (pathname.startsWith('/dashboard') && !session) {
    return NextResponse.redirect(new URL('/auth/signin', request.url))
  }

  // Redirect based on role if needed
  // Add role-based protection logic here

  return NextResponse.next()
}