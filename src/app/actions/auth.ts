'use server'

import { cookies } from 'next/headers'
import { ADMIN_COOKIE, SESSION_MAX_AGE_SECONDS, createSessionToken } from '@/lib/adminSession'

export async function loginAdmin(password: string) {
    const adminPassword = process.env.ADMIN_PASSWORD

    // Sin ADMIN_PASSWORD configurada no se entra. Antes había una contraseña por
    // defecto en el código, que es tanto como no tener contraseña.
    if (!adminPassword) {
        return { success: false, error: 'El acceso administrativo no está configurado en este servidor.' }
    }

    if (password !== adminPassword) {
        return { success: false, error: 'Credenciales inválidas. Acceso denegado.' }
    }

    const token = await createSessionToken()
    if (!token) {
        return { success: false, error: 'El acceso administrativo no está configurado en este servidor.' }
    }

    const cookieStore = await cookies()
    cookieStore.set(ADMIN_COOKIE, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: SESSION_MAX_AGE_SECONDS
    })
    return { success: true }
}

export async function logoutAdmin() {
    const cookieStore = await cookies()
    cookieStore.delete(ADMIN_COOKIE)
}
