import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { ADMIN_COOKIE, verifySessionToken } from '@/lib/adminSession'

export async function middleware(request: NextRequest) {
    const isAdminPath = request.nextUrl.pathname.startsWith('/admin')
    const isLoginPage = request.nextUrl.pathname === '/admin/login'

    if (isAdminPath) {
        const authCookie = request.cookies.get(ADMIN_COOKIE)
        const isAuthenticated = await verifySessionToken(authCookie?.value)

        // Si intenta acceder a /admin pero no está validado -> redirigir a login
        if (!isAuthenticated && !isLoginPage) {
            return NextResponse.redirect(new URL('/admin/login', request.url))
        }

        // Si ya está validado y trata de ir al login -> redirigir a admin
        if (isAuthenticated && isLoginPage) {
            return NextResponse.redirect(new URL('/admin', request.url))
        }
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/admin/:path*'],
}
