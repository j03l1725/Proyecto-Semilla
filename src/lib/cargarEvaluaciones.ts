import prisma from './prisma'
import type { EvaluacionCruda } from './metricas'

/**
 * Lee todas las evaluaciones con sus respuestas y las deja en la forma que
 * esperan las métricas. Un solo punto de lectura para el panel, la exportación
 * y la verificación: así las tres ven exactamente lo mismo.
 */
export async function cargarCrudas(): Promise<EvaluacionCruda[]> {
    const registros = await prisma.assessment.findMany({
        include: {
            company: true,
            answers: { include: { option: true, question: { include: { dimension: true } } } },
        },
        orderBy: { createdAt: 'desc' },
    })

    return registros.map((a) => ({
        id: a.id,
        createdAt: a.createdAt,
        companyId: a.companyId,
        companyName: a.company.name,
        sector: a.company.sector,
        sectorCodigo: a.company.sectorCodigo,
        province: a.company.province,
        city: a.company.city,
        contactName: a.company.contactName,
        companyEmail: a.company.email,
        companyPhone: a.company.phone,
        companyCreatedAt: a.company.createdAt,
        estadoMuestra: a.estadoMuestra,
        motivoMuestra: a.motivoMuestra,
        respuestas: a.answers.map((r) => ({
            dimension: r.question.dimension.name,
            weight: r.option.weight,
            questionText: r.question.text,
            optionText: r.option.text,
        })),
    }))
}
