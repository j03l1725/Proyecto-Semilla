/**
 * Modelo de puntuación de madurez digital v3.0
 *
 * Indicador compuesto construido según el procedimiento canónico del
 * Handbook on Constructing Composite Indicators (OCDE/JRC, 2008):
 * normalización min-max → ponderación equitativa → agregación lineal.
 *
 * Reemplaza al modelo interno con pesos arbitrarios (15/10/15/20/20/20 %).
 * Fundamentación completa: ArchivosInfo/articulo/00_FUNDAMENTACION_MODELO.md
 */

/**
 * Orden canónico de las 6 dimensiones. Son las dimensiones recurrentes en los
 * modelos de madurez digital validados y ampliamente citados, operacionalizadas
 * a partir del Digital Maturity Model para pymes de Williams et al. (2024) y del
 * EU Digital Maturity Assessment (DMA/DMAT, Comisión Europea / JRC), y
 * contextualizadas al microemprendimiento ecuatoriano.
 */
export const DIMENSION_ORDER = [
    'Tecnologías y habilidades digitales',
    'Comunicaciones y canales de venta',
    'Organización y personas',
    'Estrategia y transformación digital',
    'Datos y analítica',
    'Procesos',
] as const

export type MaturityLevel = 'Incipiente' | 'Transición' | 'Consolidado'

/** Umbrales equidistantes (0-100). Mismos rangos para el DMI global y cada dimensión. */
export const LEVEL_THRESHOLDS = { incipiente: 33.33, transicion: 66.66 } as const

/** Etiqueta accesible usada por dimensión individual (paralela al nivel canónico). */
export const DIMENSION_LEVEL_LABEL: Record<MaturityLevel, string> = {
    Incipiente: 'Básico',
    'Transición': 'Intermedio',
    Consolidado: 'Avanzado',
}

export interface DimensionResult {
    /** Nombre de la dimensión. */
    name: string
    /** Sᵢ — puntaje bruto (suma de ítems, cada uno 0-2). */
    rawScore: number
    /** Qᵢ — número de ítems respondidos en la dimensión. */
    questionCount: number
    /** Qᵢ × 2 — puntaje máximo posible de la dimensión. */
    maxScore: number
    /** Nᵢ — puntaje normalizado 0-100 (min-max). */
    normalized: number
    /** Nivel de madurez de la dimensión. */
    level: MaturityLevel
    /** Brecha de desempeño = 100 − Nᵢ (criterio de priorización IPA). */
    gap: number
    /** Respuestas individuales de la dimensión, en el orden del cuestionario. */
    items: ScoredItem[]
}

/** Grado de urgencia de una dimensión. Se deriva de la brecha, no de la posición. */
export type Priority = 'alta' | 'media' | 'mantener'

/** Respuesta a un ítem, ya puntuada. */
export interface ScoredItem {
    /** Texto de la pregunta tal como está en la base. */
    questionText: string
    /** Texto de la opción elegida. */
    optionText: string
    /** Puntaje del ítem, 0-2. */
    weight: number
}

export interface AssessmentResult {
    /** Resultados por dimensión, en DIMENSION_ORDER. */
    dimensions: DimensionResult[]
    /** DMI — Índice de Madurez Digital global 0-100 (promedio simple de las 6 Nᵢ). */
    dmi: number
    /** Nivel de madurez global. */
    level: MaturityLevel
    /** Puntaje bruto total (suma de todos los ítems). */
    totalRawScore: number
    /** Dimensiones ordenadas por brecha descendente (las más urgentes primero). */
    priorities: DimensionResult[]
}

/** Respuesta individual mínima necesaria para el cálculo. */
export interface ScoringAnswer {
    dimension: string
    weight: number
    /** Texto de la pregunta. Opcional: el CSV y las métricas no lo necesitan. */
    questionText?: string
    /** Texto de la opción elegida. Opcional, igual que el anterior. */
    optionText?: string
}

/** Redondea a un decimal. */
function round1(value: number): number {
    return Math.round(value * 10) / 10
}

/** Clasifica un valor 0-100 en el nivel de madurez correspondiente. */
export function classifyLevel(value: number): MaturityLevel {
    if (value <= LEVEL_THRESHOLDS.incipiente) return 'Incipiente'
    if (value <= LEVEL_THRESHOLDS.transicion) return 'Transición'
    return 'Consolidado'
}

/**
 * Urgencia de una dimensión a partir de su brecha, con los mismos umbrales que
 * clasifican la madurez. Antes el reporte rotulaba «prioridad alta» a las tres
 * primeras de la lista sin mirar su valor, de modo que un negocio con 100 % en
 * todo recibía tres urgencias inexistentes.
 */
export function classifyPriority(gap: number): Priority {
    if (gap >= 100 - LEVEL_THRESHOLDS.incipiente) return 'alta'
    if (gap >= 100 - LEVEL_THRESHOLDS.transicion) return 'media'
    return 'mantener'
}

/** Nᵢ — normalización min-max de una dimensión a la escala 0-100. */
export function normalizeDimension(rawScore: number, questionCount: number): number {
    const maxScore = questionCount * 2
    return maxScore > 0 ? round1((rawScore / maxScore) * 100) : 0
}

/**
 * Calcula el resultado completo de una evaluación a partir de las respuestas.
 * Es la única fuente de verdad del modelo: la usan el server action, el
 * dashboard, el panel admin y el reporte PDF.
 */
export function computeAssessmentResult(answers: ScoringAnswer[]): AssessmentResult {
    // Agrupar puntajes por dimensión.
    const grouped: Record<string, { rawScore: number; questionCount: number; items: ScoredItem[] }> = {}
    for (const a of answers) {
        if (!grouped[a.dimension]) grouped[a.dimension] = { rawScore: 0, questionCount: 0, items: [] }
        grouped[a.dimension].rawScore += a.weight
        grouped[a.dimension].questionCount += 1
        grouped[a.dimension].items.push({
            questionText: a.questionText ?? '',
            optionText: a.optionText ?? '',
            weight: a.weight,
        })
    }

    // Construir resultados por dimensión en el orden canónico.
    const dimensions: DimensionResult[] = DIMENSION_ORDER
        .filter((name) => grouped[name])
        .map((name) => {
            const { rawScore, questionCount, items } = grouped[name]
            const normalized = normalizeDimension(rawScore, questionCount)
            return {
                name,
                rawScore,
                questionCount,
                maxScore: questionCount * 2,
                normalized,
                level: classifyLevel(normalized),
                gap: round1(100 - normalized),
                items,
            }
        })

    // DMI = promedio simple de las Nᵢ (ponderación equitativa, OCDE/JRC).
    const dmi = dimensions.length > 0
        ? round1(dimensions.reduce((acc, d) => acc + d.normalized, 0) / dimensions.length)
        : 0

    const totalRawScore = answers.reduce((acc, a) => acc + a.weight, 0)

    // Priorización por análisis de brechas (Importance-Performance Analysis).
    const priorities = [...dimensions].sort((a, b) => b.gap - a.gap)

    return { dimensions, dmi, level: classifyLevel(dmi), totalRawScore, priorities }
}
