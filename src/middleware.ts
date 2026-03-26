import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { decrypt } from '@/lib/auth'

const protectedRoutes = ['/admin', '/teacher', '/student']
const publicRoutes = ['/login', '/']

export async function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname
    const isProtectedRoute = protectedRoutes.some(p => path.startsWith(p))
    const isPublicRoute = publicRoutes.includes(path)

    const cookie = request.cookies.get('session')?.value
    const session = cookie ? await decrypt(cookie) : null

    // Redirect users without valid session trying to access protected routes
    if (isProtectedRoute && !session?.user) {
        return NextResponse.redirect(new URL('/login', request.nextUrl))
    }

    // Redirect authenticated users away from login page
    if (isPublicRoute && session?.user && path === '/login') {
        const role = session.user.role.toLowerCase()
        return NextResponse.redirect(new URL(`/${role}`, request.nextUrl))
    }

    return NextResponse.next()
}

// Ensure the middleware is only called for relevant paths.
export const config = {
    matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
}
