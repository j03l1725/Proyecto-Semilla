'use server'

import prisma from '@/lib/prisma'
import { computeAssessmentResult } from '@/lib/scoring'

// Función para obtener todo el cuestionario con sus opciones
export async function getQuestions() {
    try {
        const questions = await prisma.question.findMany({
            include: {
                options: {
                    orderBy: { weight: 'asc' } // Asegurar el orden visual de las opciones por su puntaje
                },
                dimension: true,
            },
            orderBy: { createdAt: 'asc' } // Mantener el orden cronológico del marco original (Sprint 5.1 Seed)
        })

        return { success: true, questions }
    } catch (error) {
        console.error('Error al obtener preguntas:', error)
        return { success: false, error: 'No se pudieron cargar las preguntas del cuestionario.' }
    }
}

// Función que calcula el resultado final y guarda en BD
export async function submitAssessment(companyId: string, selectedOptions: string[]) {
    try {
        // 1. Obtener los detalles de las opciones seleccionadas CON su pregunta y dimensión
        const optionsData = await prisma.option.findMany({
            where: {
                id: { in: selectedOptions }
            },
            include: {
                question: {
                    include: {
                        dimension: true
                    }
                }
            }
        })

        if (!optionsData || optionsData.length === 0) {
            return { success: false, error: 'No se enviaron respuestas válidas.' }
        }

        // 2. Calcular el resultado con el modelo v3.0 (indicador compuesto OCDE/JRC):
        //    Nᵢ min-max → DMI = promedio simple de las 6 dimensiones → nivel.
        const scoreResult = computeAssessmentResult(
            optionsData.map((opt) => ({
                dimension: opt.question.dimension.name,
                weight: opt.weight,
            }))
        )

        // Se almacena el puntaje bruto total; el nivel proviene del DMI normalizado.
        const totalScore = scoreResult.totalRawScore
        const level = scoreResult.level

        // 3. Guardar todo en una transacción para asegurar consistencia
        const result = await prisma.$transaction(async (tx) => {

            // Borramos el histórico viejo si un mismo usuario hace varios assessments 
            // (Para mantener limpia la data analítica asumiendo que es diagnóstico único)
            await tx.assessment.deleteMany({
                where: { companyId }
            })

            // 5A. Crear el Assessment principal
            const assessment = await tx.assessment.create({
                data: {
                    companyId,
                    totalScore,
                    level
                }
            })

            // 5B. Formatear y preparar el insert de las respuestas (AssessmentAnswer) cruzadas
            const answersToInsert = optionsData.map(opt => ({
                assessmentId: assessment.id,
                questionId: opt.questionId,
                optionId: opt.id
            }))

            // Crear todos los registros hijo
            await tx.assessmentAnswer.createMany({
                data: answersToInsert
            })

            return assessment
        })

        return { success: true, assessmentId: result.id, level: result.level, totalScore: result.totalScore }

    } catch (error) {
        console.error('Error al guardar assessment:', error)
        return { success: false, error: 'Fallo al procesar las respuestas en el servidor.' }
    }
}
