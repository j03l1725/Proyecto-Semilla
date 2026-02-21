'use server'

import { cookies } from 'next/headers'

export async function loginAdmin(password: string) {
    // En MVP, usamos una contraseña predefinida por variable de entorno o una por defecto muy robusta.
    const adminPassword = process.env.ADMIN_PASSWORD || 'investigacion2024'

    if (password === adminPassword) {
        const cookieStore = await cookies()
        cookieStore.set('admin_session', 'authenticated', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 24 // 1 day valid token
        })
        return { success: true }
    }

    return { success: false, error: 'Credenciales inválidas. Acceso denegado.' }
}

export async function logoutAdmin() {
    const cookieStore = await cookies()
    cookieStore.delete('admin_session')
}
