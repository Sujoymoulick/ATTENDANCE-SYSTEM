import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { decrypt } from '@/lib/auth'

const protectedRoutes = ['/admin', '/teacher', '/student']
const publicRoutes = ['/login', '/']

export async function proxy(request: NextRequest) {
    const path = request.nextUrl.pathname
    const isProtectedRoute = protectedRoutes.some(p => path.startsWith(p))
    const isPublicRoute = publicRoutes.includes(path)

    const cookie = request.cookies.get('token')?.value
    const session = cookie ? await decrypt(cookie) : null

    // Redirect users without valid session trying to access protected routes
    if (isProtectedRoute && !session) {
        return NextResponse.redirect(new URL('/login', request.nextUrl))
    }

    // Role-specific route protection
    if (isProtectedRoute && session?.role) {
        const role = session.role.toLowerCase()
        const targetPrefix = `/${role}`
        if (!path.startsWith(targetPrefix)) {
            return NextResponse.redirect(new URL(targetPrefix, request.nextUrl))
        }
    }

    // Redirect authenticated users away from login page
    if (isPublicRoute && session?.role && path === '/login') {
        const role = session.role.toLowerCase()
        return NextResponse.redirect(new URL(`/${role}`, request.nextUrl))
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
}
