import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

/**
 * Comprobación de vida. Existe para que un cron externo toque la base cada pocas
 * horas: el plan gratuito de Supabase pausa el proyecto tras siete días sin
 * actividad, y una vez pausado solo se reactiva a mano desde el panel.
 *
 * No devuelve ningún dato: solo si la base responde.
 */
export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        await prisma.$queryRaw`SELECT 1`
        return NextResponse.json({ status: 'ok', db: 'up' })
    } catch {
        return NextResponse.json({ status: 'error', db: 'down' }, { status: 503 })
    }
}
