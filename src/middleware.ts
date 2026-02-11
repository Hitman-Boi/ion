import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Skip all auth checks - allow all requests through
export default function middleware(request: NextRequest) {
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
