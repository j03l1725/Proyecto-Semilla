import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'

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
            },
            orderBy: {
                createdAt: 'desc',
            },
        })

        if (!assessments || assessments.length === 0) {
            return new NextResponse('No hay datos para exportar', { status: 404 })
        }

        // Definir cabeceras del CSV
        const headers = [
            'ID Empresa',
            'Nombre Empresa',
            'Nombre Contacto',
            'Email / Login',
            'Sector Comercial',
            'Fecha Evaluación',
            'Puntaje Total',
            'Nivel de Madurez'
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

            return [
                escapeCsv(a.company.id),
                escapeCsv(a.company.name),
                escapeCsv(a.company.contactName),
                escapeCsv(a.company.email),
                escapeCsv(a.company.sector),
                escapeCsv(a.createdAt.toISOString()),
                a.totalScore,
                escapeCsv(a.level)
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
