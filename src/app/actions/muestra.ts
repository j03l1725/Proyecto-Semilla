'use server'

import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import prisma from '@/lib/prisma'
import { ADMIN_COOKIE, verifySessionToken } from '@/lib/adminSession'
import { ESTADOS_MUESTRA } from '@/lib/estadosMuestra'

async function sesionValida() {
    return verifySessionToken((await cookies()).get(ADMIN_COOKIE)?.value)
}

/**
 * Cambia el estado de una evaluación dentro de la muestra.
 *
 * Una acción de servidor es un endpoint público: el middleware no la protege,
 * así que la sesión se valida aquí dentro. Excluir exige un motivo escrito.
 */
export async function marcarMuestra(assessmentId: string, estado: string, motivo?: string) {
    if (!(await sesionValida())) {
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

/** Liga a una persona del padrón con el emprendimiento que registró. */
export async function vincularParticipante(participanteId: string, companyId: string) {
    if (!(await sesionValida())) {
        return { success: false, error: 'No autorizado.' }
    }
    if (!participanteId || !companyId) {
        return { success: false, error: 'Falta elegir a la persona.' }
    }
    try {
        await prisma.participante.update({ where: { id: participanteId }, data: { companyId } })
    } catch {
        return { success: false, error: 'No se pudo vincular.' }
    }
    revalidatePath('/admin')
    return { success: true }
}
