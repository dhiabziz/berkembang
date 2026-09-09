import { NextRequest, NextResponse } from 'next/server'
import { getIronSession } from 'iron-session'
import type { SessionData } from '@/lib/auth/session'

// UC-22: Route Protection — implements FR-06
export async function middleware(request: NextRequest) {
  const response = NextResponse.next()

  const session = await getIronSession<SessionData>(request, response, {
    password: process.env.SESSION_SECRET!,
    cookieName: 'berkembang_session',
  })

  const { pathname } = request.nextUrl

  if (pathname === '/login') {
    if (session.userId) {
      const redirectTo = session.role === 'admin' ? '/admin/dashboard' : '/mentee/leaderboard'
      return NextResponse.redirect(new URL(redirectTo, request.url))
    }
    return response
  }

  if (!session.userId) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // UC-22 flow 2: mentee blocked from /admin/*. Flow 3: admin allowed on every route (including /mentee/*).
  if (pathname.startsWith('/admin') && session.role !== 'admin') {
    return NextResponse.redirect(new URL('/mentee/leaderboard', request.url))
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
