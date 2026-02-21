'use server'

import prisma from '@/lib/prisma'

interface AssessmentSubmission {
    companyId: string
    answers: {
        questionId: string
        optionId: string
    }[]
}

// Función auxiliar para calcular el nivel cualitativo de Madurez
export function getMaturityLevel(totalScore: number): string {
    if (totalScore <= 8) return 'Incipiente'
    if (totalScore <= 16) return 'Transición'
    return 'Consolidado'
}

export async function submitAssessment(data: AssessmentSubmission) {
    try {
        // 1. Validar que la empresa exista
        const company = await prisma.company.findUnique({
            where: { id: data.companyId }
        })

        if (!company) {
            return { success: false, error: 'Empresa no encontrada.' }
        }

        // 2. Calcular el puntaje total en base a las opciones seleccionadas
        const optionIds = data.answers.map(a => a.optionId)
        const optionsData = await prisma.option.findMany({
            where: { id: { in: optionIds } }
        })

        const totalScore = optionsData.reduce((acc, curr) => acc + curr.weight, 0)

        // 3. Determinar el nivel de madurez basado en el score
        const level = getMaturityLevel(totalScore)

        // 4. Guardar todo en una transacción para asegurar consistencia
        const result = await prisma.$transaction(async (tx) => {
            // Evaluamos si ya existe un assessment previo para sobreescribirlo o crear uno nuevo
            // Para mantener el histórico limpio, primero borramos el assessment viejo si existe.
            await tx.assessment.deleteMany({
                where: { companyId: data.companyId }
            })

            // Crear nuevo
            const assessment = await tx.assessment.create({
                data: {
                    companyId: data.companyId,
                    totalScore,
                    level,
                    answers: {
                        create: data.answers.map(ans => ({
                            questionId: ans.questionId,
                            optionId: ans.optionId
                        }))
                    }
                }
            })

            return assessment
        })

        return { success: true, assessmentId: result.id, score: totalScore, level }

    } catch (error) {
        console.error('Error calculando assessment:', error)
        return { success: false, error: 'Error procesando las respuestas.' }
    }
}
