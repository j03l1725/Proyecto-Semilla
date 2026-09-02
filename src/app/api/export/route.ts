import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { DIMENSION_ORDER } from '@/lib/scoring'
import { calcularMetricas, type EvaluacionCruda } from '@/lib/metricas'
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
export async function GET(request: NextRequest) {
    // El middleware solo cubre /admin; este endpoint valida por su cuenta.
    const authCookie = request.cookies.get(ADMIN_COOKIE)
    if (!(await verifySessionToken(authCookie?.value))) {
        return new NextResponse('Unauthorized', { status: 401 })
    }

    try {
        const registros = await prisma.assessment.findMany({
            include: {
                company: true,
                answers: { include: { option: true, question: { include: { dimension: true } } } },
            },
            orderBy: { createdAt: 'desc' },
        })

        if (registros.length === 0) {
            return new NextResponse('No hay datos para exportar', { status: 404 })
        }

        const crudas: EvaluacionCruda[] = registros.map((a) => ({
            id: a.id,
            createdAt: a.createdAt,
            companyId: a.companyId,
            companyName: a.company.name,
            sector: a.company.sector,
            province: a.company.province,
            city: a.company.city,
            respuestas: a.answers.map((r) => ({
                dimension: r.question.dimension.name,
                weight: r.option.weight,
                questionText: r.question.text,
                optionText: r.option.text,
            })),
        }))

        const m = calcularMetricas(crudas)
        // Datos de contacto, que las métricas no arrastran a propósito.
        const contacto = new Map(registros.map((a) => [a.id, a.company]))

        const esc = (v: string | number | null | undefined) => {
            if (v === null || v === undefined || v === '') return ''
            const t = String(v)
            return /[",\n;]/.test(t) ? `"${t.replace(/"/g, '""')}"` : t
        }

        const cabeceras = [
            'codigo_reporte',
            'id_evaluacion',
            'id_empresa',
            'en_muestra',
            'fecha',
            'emprendimiento',
            'contacto',
            'email',
            'telefono',
            'sector',
            'provincia',
            'ciudad',
            'puntaje_bruto',
            'dmi',
            'nivel',
            ...DIMENSION_ORDER.map((_, i) => `N${i + 1}_pct`),
            ...CATALOGO.map((c) => c.codigo.replace('.', '_')),
        ]

        const filas = m.todas.map((e) => {
            const c = contacto.get(e.id)

            // Respuestas indexadas por código de ítem, para que el orden de las
            // columnas no dependa del orden en que vinieron de la base.
            const porItem: Record<string, number | ''> = {}
            for (const r of e.respuestas) {
                const cat = buscarItem(r.questionText ?? '')
                if (cat) porItem[cat.codigo] = r.weight
            }

            return [
                reportCode(e.id, e.createdAt),
                e.id,
                e.companyId,
                e.superada ? 0 : 1,
                e.createdAt.toISOString(),
                esc(e.companyName),
                esc(c?.contactName),
                esc(c?.email),
                esc(c?.phone),
                esc(e.sector),
                esc(e.province),
                esc(e.city),
                e.totalRawScore,
                e.dmi,
                e.level,
                ...DIMENSION_ORDER.map((d) => e.porDimension[d] ?? ''),
                ...CATALOGO.map((cat) => porItem[cat.codigo] ?? ''),
            ].join(',')
        })

        // BOM para que Excel en Windows lea las tildes sin configurar nada.
        const csv = '﻿' + [cabeceras.join(','), ...filas].join('\n')
        const fecha = new Date().toISOString().slice(0, 10)

        return new NextResponse(csv, {
            status: 200,
            headers: {
                'Content-Type': 'text/csv; charset=utf-8',
                'Content-Disposition': `attachment; filename="muestra_madurez_digital_${fecha}.csv"`,
            },
        })
    } catch (error) {
        console.error('Error al generar CSV:', error)
        return new NextResponse('Internal Server Error', { status: 500 })
    }
}
