import NextAuth from "next-auth"
import { authConfig } from "./auth.config"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { v4 as uuidv4 } from "uuid"

const { auth } = NextAuth(authConfig)

export default async function middleware(req: NextRequest) {
  const requestId = req.headers.get('x-request-id') || uuidv4()

  // 1. Run NextAuth
  const sessionResponse = await auth(req)

  // If NextAuth returns a redirect or error (response), we define it here
  if (sessionResponse) {
    sessionResponse.headers.set('x-request-id', requestId)
    return sessionResponse
  }

  // 2. Continue chain
  // Add request ID to headers so it's available in Server Components / API Routes
  const requestHeaders = new Headers(req.headers)
  requestHeaders.set('x-request-id', requestId)

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })

  // Add to response headers so client sees it
  response.headers.set('x-request-id', requestId)

  return response
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}