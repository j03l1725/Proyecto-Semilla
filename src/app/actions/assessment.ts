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

        // Integridad de la muestra. Un diagnóstico incompleto no se rechaza por
        // pulcritud: el DMI normaliza cada dimensión por el número de ítems
        // RESPONDIDOS, así que una pregunta faltante produce un índice que
        // parece válido y no lo es. Y como el reporte no distingue un caso del
        // otro, el dato entra a la muestra contaminándola en silencio.
        const totalPreguntas = await prisma.question.count()
        const preguntasCubiertas = new Set(optionsData.map((o) => o.questionId)).size

        if (preguntasCubiertas !== totalPreguntas) {
            console.error(
                `Envío incompleto: ${preguntasCubiertas} de ${totalPreguntas} preguntas (empresa ${companyId})`
            )
            return {
                success: false,
                error: `El diagnóstico está incompleto: ${preguntasCubiertas} de ${totalPreguntas} preguntas respondidas.`,
            }
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

            // El histórico NO se borra. Antes cada nueva evaluación eliminaba las
            // anteriores del mismo emprendimiento, lo que contradecía la promesa
            // del reporte —«repita el diagnóstico para medir su avance»— y
            // destruía el único dato longitudinal que el proyecto puede producir.
            // El panel de investigación resuelve la duplicidad contando solo la
            // evaluación más reciente de cada emprendimiento en la muestra.

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
