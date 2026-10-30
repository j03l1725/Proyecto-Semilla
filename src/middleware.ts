import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { ADMIN_COOKIE, verifySessionToken } from '@/lib/adminSession'

/** Dirección antigua de la plataforma y la definitiva a la que se redirige. */
const HOST_ANTIGUO = 'proyecto-semilla-5upp.vercel.app'
const ORIGEN_DEFINITIVO = 'https://semilla.indoamericatech.com'

export async function middleware(request: NextRequest) {
    // La dirección de Vercel se retira: 308 conserva método, ruta y consulta.
    const host = (request.headers.get('host') ?? '').split(':')[0].toLowerCase()
    if (host === HOST_ANTIGUO) {
        const destino = new URL(request.nextUrl.pathname + request.nextUrl.search, ORIGEN_DEFINITIVO)
        return NextResponse.redirect(destino, 308)
    }

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
    // Todas las rutas salvo los estáticos de Next y el favicon.
    matcher: ['/((?!_next/static|_next/image|favicon).*)'],
}
