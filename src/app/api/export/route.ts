import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { computeAssessmentResult, DIMENSION_ORDER } from '@/lib/scoring'

export async function GET(request: NextRequest) {
    // Validación de seguridad manual en el endpoint
    const authCookie = request.cookies.get('admin_session')
    if (authCookie?.value !== 'authenticated') {
        return new NextResponse('Unauthorized', { status: 401 })
    }

    try {
        const assessments = await prisma.assessment.findMany({
            include: {
                company: true,
                answers: {
                    include: {
                        option: true,
                        question: { include: { dimension: true } },
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        })

        if (!assessments || assessments.length === 0) {
            return new NextResponse('No hay datos para exportar', { status: 404 })
        }

        // Definir cabeceras del CSV (DIMENSION_ORDER fija el orden de columnas Nᵢ)
        const headers = [
            'ID Empresa',
            'Nombre Empresa',
            'Nombre Contacto',
            'Email / Login',
            'Sector Comercial',
            'Fecha Evaluación',
            'Puntaje Bruto',
            'DMI (%)',
            'Nivel de Madurez',
            ...DIMENSION_ORDER.map(d => `${d} (%)`),
        ].join(',')

        // Construir renglones escapando campos con posibles comas
        const rows = assessments.map(a => {
            const escapeCsv = (str: string | null | undefined) => {
                if (!str) return '""'
                const stringified = String(str)
                if (stringified.includes(',') || stringified.includes('"') || stringified.includes('\n')) {
                    return `"${stringified.replace(/"/g, '""')}"`
                }
                return stringified
            }

            // Recalcular el resultado con el modelo v3.0 para exportar DMI y Nᵢ
            const result = computeAssessmentResult(
                a.answers.map(ans => ({
                    dimension: ans.question.dimension.name,
                    weight: ans.option.weight,
                }))
            )
            const byDim: Record<string, number> = {}
            result.dimensions.forEach(d => { byDim[d.name] = d.normalized })

            return [
                escapeCsv(a.company.id),
                escapeCsv(a.company.name),
                escapeCsv(a.company.contactName),
                escapeCsv(a.company.email),
                escapeCsv(a.company.sector),
                escapeCsv(a.createdAt.toISOString()),
                a.totalScore,
                result.dmi,
                escapeCsv(result.level),
                ...DIMENSION_ORDER.map(d => byDim[d] ?? ''),
            ].join(',')
        })

        const csvContent = [headers, ...rows].join('\n')

        // Devolver Archivo Crudo
        return new NextResponse(csvContent, {
            status: 200,
            headers: {
                'Content-Type': 'text/csv; charset=utf-8',
                'Content-Disposition': 'attachment; filename="resultados_madurez_digital.csv"',
            },
        })
    } catch (error) {
        console.error('Error al generar CSV:', error)
        return new NextResponse('Internal Server Error', { status: 500 })
    }
}
