import { auth } from "@/auth"

export default auth((req) => {
  // req.auth is available with user session info
  const isLoggedIn = !!req.auth
  const isOnDashboard = req.nextUrl.pathname.startsWith('/dashboard')
  const isOnAuthPage = req.nextUrl.pathname.startsWith('/auth')
  
  // Redirect to sign-in if not logged in and trying to access protected routes
  if (!isLoggedIn && isOnDashboard) {
    return Response.redirect(new URL('/auth/signin', req.nextUrl))
  }
  
  // Redirect to dashboard if logged in and on auth pages
  if (isLoggedIn && isOnAuthPage) {
    return Response.redirect(new URL('/dashboard', req.nextUrl))
  }
})

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