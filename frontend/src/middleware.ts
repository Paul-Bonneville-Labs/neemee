import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"

export default function middleware(req: NextRequest) {
  // Skip auth checks for API routes and auth pages to prevent circular redirects
  if (req.nextUrl.pathname.startsWith('/api') || req.nextUrl.pathname.startsWith('/auth')) {
    return NextResponse.next()
  }
  
  // Skip auth checks for static files
  if (req.nextUrl.pathname.startsWith('/_next') || req.nextUrl.pathname === '/favicon.ico') {
    return NextResponse.next()
  }
  
  // For now, allow all other routes to pass through
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}