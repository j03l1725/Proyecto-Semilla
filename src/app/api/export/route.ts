import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { cargarCrudas } from '@/lib/cargarEvaluaciones'
import { DIMENSION_ORDER } from '@/lib/scoring'
import { calcularMetricas } from '@/lib/metricas'
import { CATALOGO, buscarItem } from '@/lib/acciones'
import { reportCode } from '@/lib/reporte'
import { ADMIN_COOKIE, verifySessionToken } from '@/lib/adminSession'

/**
 * Exportación de la muestra.
 *
 * La versión anterior entregaba nueve columnas: ni provincia, ni ciudad, ni las
 * respuestas ítem por ítem. Con eso no se puede calcular el alfa de Cronbach ni
 * cruzar por territorio, que son justamente los análisis que piden los objetivos
 * 3 y 4 del proyecto. Aquí sale una fila por evaluación con las 21 respuestas
 * codificadas 0-2, listas para SPSS, R o una hoja de cálculo.
 */
/** Baraja con semilla fija (mulberry32 + Fisher-Yates): reproducible entre descargas. */
function barajar<T extends { createdAt: Date; id: string }>(xs: T[], semilla: number): T[] {
    let t = semilla >>> 0
    const azar = () => {
        t = (t + 0x6d2b79f5) >>> 0
        let r = Math.imul(t ^ (t >>> 15), 1 | t)
        r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r
        return ((r ^ (r >>> 14)) >>> 0) / 4294967296
    }
    // Se parte de un orden estable (por fecha y luego id) para que la semilla sea la única fuente de azar.
    const out = [...xs].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime() || a.id.localeCompare(b.id))
    for (let i = out.length - 1; i > 0; i--) {
        const j = Math.floor(azar() * (i + 1))
        ;[out[i], out[j]] = [out[j], out[i]]
    }
    return out
}

export async function GET(request: NextRequest) {
    // El middleware solo cubre /admin; este endpoint valida por su cuenta.
    const authCookie = request.cookies.get(ADMIN_COOKIE)
    if (!(await verifySessionToken(authCookie?.value))) {
        return new NextResponse('Unauthorized', { status: 401 })
    }

    try {
        const crudas = await cargarCrudas()

        if (crudas.length === 0) {
            return new NextResponse('No hay datos para exportar', { status: 404 })
        }

        const m = calcularMetricas(crudas)
        const anonima = request.nextUrl.searchParams.get('anonima') === '1'

        const esc = (v: string | number | null | undefined) => {
            if (v === null || v === undefined || v === '') return ''
            const t = String(v)
            return /[",\n;]/.test(t) ? `"${t.replace(/"/g, '""')}"` : t
        }

        const columnasComunes = [
            ...DIMENSION_ORDER.map((_, i) => `N${i + 1}_pct`),
            ...CATALOGO.map((c) => c.codigo.replace('.', '_')),
        ]
        const respuestasDe = (e: (typeof m.todas)[number]) => {
            // Respuestas indexadas por código de ítem, para que el orden de las
            // columnas no dependa del orden en que vinieron de la base.
            const porItem: Record<string, number | ''> = {}
            for (const r of e.respuestas) {
                const cat = buscarItem(r.questionText ?? '')
                if (cat) porItem[cat.codigo] = r.weight
            }
            return [
                ...DIMENSION_ORDER.map((d) => e.porDimension[d] ?? ''),
                ...CATALOGO.map((cat) => porItem[cat.codigo] ?? ''),
            ]
        }

        let cabeceras: string[]
        let filas: string[]

        if (anonima) {
            // Solo la muestra oficial, sin nada que identifique a la persona ni al
            // negocio. El orden se baraja con semilla fija: el mismo conjunto da
            // siempre los mismos códigos, pero P01 no revela quién respondió primero.
            const barajadas = barajar(m.muestra, 20261029)
            cabeceras = [
                'codigo_participante',
                'fecha',
                'sector_codigo',
                'provincia',
                'puntaje_bruto',
                'dmi',
                'nivel',
                ...columnasComunes,
            ]
            filas = barajadas.map((e, i) =>
                [
                    `P${String(i + 1).padStart(2, '0')}`,
                    e.createdAt.toISOString().slice(0, 10),
                    esc(e.sectorCodigo),
                    esc(e.province),
                    e.totalRawScore,
                    e.dmi,
                    e.level,
                    ...respuestasDe(e),
                ].join(',')
            )
        } else {
            cabeceras = [
                'codigo_reporte',
                'id_evaluacion',
                'id_empresa',
                'en_muestra',
                'estado_muestra',
                'motivo_muestra',
                'fecha',
                'emprendimiento',
                'contacto',
                'email',
                'telefono',
                'sector',
                'sector_codigo',
                'provincia',
                'ciudad',
                'puntaje_bruto',
                'dmi',
                'nivel',
                ...columnasComunes,
            ]
            filas = m.todas.map((e) =>
                [
                    reportCode(e.id, e.createdAt),
                    e.id,
                    e.companyId,
                    e.enMuestra ? 1 : 0,
                    e.estadoMuestra,
                    esc(e.motivoMuestra),
                    e.createdAt.toISOString(),
                    esc(e.companyName),
                    esc(e.contactName),
                    esc(e.companyEmail),
                    esc(e.companyPhone),
                    esc(e.sector),
                    esc(e.sectorCodigo),
                    esc(e.province),
                    esc(e.city),
                    e.totalRawScore,
                    e.dmi,
                    e.level,
                    ...respuestasDe(e),
                ].join(',')
            )
        }

        // BOM para que Excel en Windows lea las tildes sin configurar nada.
        const csv = '﻿' + [cabeceras.join(','), ...filas].join('\n')
        const fecha = new Date().toISOString().slice(0, 10)
        const nombre = anonima ? 'muestra_anonima' : 'muestra_madurez_digital'

        return new NextResponse(csv, {
            status: 200,
            headers: {
                'Content-Type': 'text/csv; charset=utf-8',
                'Content-Disposition': `attachment; filename="${nombre}_${fecha}.csv"`,
            },
        })
    } catch (error) {
        console.error('Error al generar CSV:', error)
        return new NextResponse('Internal Server Error', { status: 500 })
    }
}
