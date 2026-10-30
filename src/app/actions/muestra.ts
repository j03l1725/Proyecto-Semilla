'use server'

import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import prisma from '@/lib/prisma'
import { ADMIN_COOKIE, verifySessionToken } from '@/lib/adminSession'
import { ESTADOS_MUESTRA } from '@/lib/estadosMuestra'

/**
 * Cambia el estado de una evaluación dentro de la muestra.
 *
 * Una acción de servidor es un endpoint público: el middleware no la protege,
 * así que la sesión se valida aquí dentro. Excluir exige un motivo escrito.
 */
export async function marcarMuestra(assessmentId: string, estado: string, motivo?: string) {
    const token = (await cookies()).get(ADMIN_COOKIE)?.value
    if (!(await verifySessionToken(token))) {
        return { success: false, error: 'No autorizado.' }
    }

    if (!(ESTADOS_MUESTRA as readonly string[]).includes(estado)) {
        return { success: false, error: 'Estado no válido.' }
    }
    if (typeof assessmentId !== 'string' || assessmentId.length === 0) {
        return { success: false, error: 'Evaluación no válida.' }
    }

    const motivoLimpio = (motivo ?? '').trim().slice(0, 500)
    if (estado === 'excluida' && motivoLimpio.length < 3) {
        return { success: false, error: 'Para excluir una evaluación hay que escribir el motivo.' }
    }

    try {
        await prisma.assessment.update({
            where: { id: assessmentId },
            data: { estadoMuestra: estado, motivoMuestra: motivoLimpio || null },
        })
    } catch {
        return { success: false, error: 'No se encontró la evaluación.' }
    }

    revalidatePath('/admin')
    return { success: true }
}
