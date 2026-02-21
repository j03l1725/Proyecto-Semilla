import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    const isAdminPath = request.nextUrl.pathname.startsWith('/admin')
    const isLoginPage = request.nextUrl.pathname === '/admin/login'

    if (isAdminPath) {
        const authCookie = request.cookies.get('admin_session')
        const isAuthenticated = authCookie?.value === 'authenticated'

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
