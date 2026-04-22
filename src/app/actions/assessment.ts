'use server'

import prisma from '@/lib/prisma'

// Pesos oficiales del modelo v2.0 (Matemática de Evaluación)
const DIMENSION_WEIGHTS: Record<string, number> = {
    'Tecnologías y habilidades digitales': 0.15,
    'Comunicaciones y canales de venta': 0.10,
    'Organización y personas': 0.15,
    'Estrategia y transformación digital': 0.20,
    'Datos y analítica': 0.20,
    'Procesos': 0.20,
}

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

// Función auxiliar: Clasificar nivel de madurez según umbrales del modelo v2.0
// Usa el Índice de Madurez Global (IMG) normalizado a 0-100%
function getMaturityLevel(imgPercentage: number): string {
    if (imgPercentage <= 33.33) return 'Incipiente'
    if (imgPercentage <= 66.66) return 'Transición'
    return 'Consolidado'
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

        // 2. Calcular el puntaje bruto total (suma simple para almacenar en BD)
        const totalScore = optionsData.reduce((acc, curr) => acc + curr.weight, 0)

        // 3. Calcular el IMG (Índice de Madurez Global) con normalización ponderada
        // Agrupar puntajes por dimensión
        const dimensionScores: Record<string, { score: number; count: number }> = {}
        for (const opt of optionsData) {
            const dimName = opt.question.dimension.name
            if (!dimensionScores[dimName]) {
                dimensionScores[dimName] = { score: 0, count: 0 }
            }
            dimensionScores[dimName].score += opt.weight
            dimensionScores[dimName].count += 1
        }

        // Calcular IMG = Σ(Wᵢ × Nᵢ) donde Nᵢ = (Sᵢ / (Qᵢ × 2)) × 100
        let img = 0
        for (const [dimName, data] of Object.entries(dimensionScores)) {
            const weight = DIMENSION_WEIGHTS[dimName] || 0
            const maxScore = data.count * 2 // Qᵢ × Pₘₐₓ
            const normalized = maxScore > 0 ? (data.score / maxScore) * 100 : 0 // Nᵢ
            img += weight * normalized
        }

        // 4. Determinar el nivel de madurez basado en el IMG normalizado
        const level = getMaturityLevel(img)

        // 5. Guardar todo en una transacción para asegurar consistencia
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
