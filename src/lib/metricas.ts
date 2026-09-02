/**
 * Métricas de la muestra — panel de investigación.
 *
 * Existe para que el panel deje de ser un contador y empiece a responder los
 * objetivos específicos del proyecto: la clasificación por niveles con sus
 * perfiles (objetivo 3) y el análisis de las dimensiones e ítems que limitan la
 * madurez (objetivo 4).
 *
 * Dos reglas de conteo, y conviene tenerlas claras al leer cualquier cifra:
 *
 * ▸ La muestra es una evaluación por emprendimiento, la más reciente. Un mismo
 *   negocio puede repetir el diagnóstico para medir su avance, y ese histórico
 *   se conserva, pero contarlo dos veces inflaría la muestra.
 *
 * ▸ Los promedios se calculan sobre dimensiones normalizadas (Nᵢ), nunca sobre
 *   puntajes brutos: dimensiones con distinto número de ítems no son
 *   comparables en bruto.
 */

import { computeAssessmentResult, DIMENSION_ORDER, type MaturityLevel, type ScoringAnswer } from './scoring'
import { buscarItem } from './acciones'

export interface EvaluacionCruda {
    id: string
    createdAt: Date
    companyId: string
    companyName: string
    sector: string | null
    province: string | null
    city: string | null
    respuestas: ScoringAnswer[]
}

export interface EvaluacionCalculada extends EvaluacionCruda {
    dmi: number
    level: MaturityLevel
    totalRawScore: number
    porDimension: Record<string, number>
    /** true si el emprendimiento tiene una evaluación posterior. */
    superada: boolean
}

export interface Reparto<T extends string = string> {
    clave: T
    n: number
    /** Porcentaje sobre el total de la muestra, 0-100. */
    pct: number
    /** DMI promedio del grupo. */
    dmiMedio: number
}

export interface ItemCritico {
    codigo: string
    etiqueta: string
    dimension: string
    /** Promedio del ítem en la muestra, escala 0-2. */
    media: number
    /** Cuántos respondieron 0 en este ítem. */
    enCero: number
    /** Porcentaje de la muestra que respondió 0. */
    pctEnCero: number
}

export interface Metricas {
    /** Evaluaciones de la muestra: la más reciente de cada emprendimiento. */
    muestra: EvaluacionCalculada[]
    /** Todas las evaluaciones, incluidas las repeticiones anteriores. */
    todas: EvaluacionCalculada[]
    n: number
    nRepeticiones: number
    dmiMedio: number
    dmiMediana: number
    dmiDesviacion: number
    dmiMin: number
    dmiMax: number
    porNivel: Reparto<MaturityLevel>[]
    porDimension: { nombre: string; media: number; desviacion: number; min: number; max: number }[]
    porSector: Reparto[]
    porProvincia: Reparto[]
    itemsCriticos: ItemCritico[]
}

const NIVELES: MaturityLevel[] = ['Incipiente', 'Transición', 'Consolidado']

function media(xs: number[]): number {
    return xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0
}

function desviacion(xs: number[]): number {
    if (xs.length < 2) return 0
    const m = media(xs)
    return Math.sqrt(xs.reduce((a, x) => a + (x - m) ** 2, 0) / (xs.length - 1))
}

function mediana(xs: number[]): number {
    if (!xs.length) return 0
    const o = [...xs].sort((a, b) => a - b)
    const mitad = Math.floor(o.length / 2)
    return o.length % 2 ? o[mitad] : (o[mitad - 1] + o[mitad]) / 2
}

const r1 = (x: number) => Math.round(x * 10) / 10

/** Agrupa por una clave de texto, ignorando vacíos y normalizando mayúsculas. */
function repartoPor(
    muestra: EvaluacionCalculada[],
    clave: (e: EvaluacionCalculada) => string | null,
    sinDato: string
): Reparto[] {
    const grupos: Record<string, number[]> = {}
    for (const e of muestra) {
        const bruto = (clave(e) ?? '').trim()
        const k = bruto === '' ? sinDato : bruto.charAt(0).toUpperCase() + bruto.slice(1).toLowerCase()
        ;(grupos[k] ??= []).push(e.dmi)
    }
    return Object.entries(grupos)
        .map(([k, dmis]) => ({
            clave: k,
            n: dmis.length,
            pct: muestra.length ? r1((dmis.length / muestra.length) * 100) : 0,
            dmiMedio: r1(media(dmis)),
        }))
        .sort((a, b) => b.n - a.n || a.clave.localeCompare(b.clave))
}

export function calcularMetricas(crudas: EvaluacionCruda[]): Metricas {
    const todas: EvaluacionCalculada[] = crudas
        .map((e) => {
            const r = computeAssessmentResult(e.respuestas)
            const porDimension: Record<string, number> = {}
            r.dimensions.forEach((d) => (porDimension[d.name] = d.normalized))
            return { ...e, dmi: r.dmi, level: r.level, totalRawScore: r.totalRawScore, porDimension, superada: false }
        })
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

    // La muestra toma la evaluación más reciente de cada emprendimiento.
    const vistos = new Set<string>()
    for (const e of todas) {
        if (vistos.has(e.companyId)) e.superada = true
        else vistos.add(e.companyId)
    }
    const muestra = todas.filter((e) => !e.superada)

    const dmis = muestra.map((e) => e.dmi)

    const porNivel: Reparto<MaturityLevel>[] = NIVELES.map((nivel) => {
        const grupo = muestra.filter((e) => e.level === nivel)
        return {
            clave: nivel,
            n: grupo.length,
            pct: muestra.length ? r1((grupo.length / muestra.length) * 100) : 0,
            dmiMedio: r1(media(grupo.map((e) => e.dmi))),
        }
    })

    const porDimension = DIMENSION_ORDER.map((nombre) => {
        const vals = muestra.map((e) => e.porDimension[nombre]).filter((v) => v !== undefined)
        return {
            nombre,
            media: r1(media(vals)),
            desviacion: r1(desviacion(vals)),
            min: vals.length ? Math.min(...vals) : 0,
            max: vals.length ? Math.max(...vals) : 0,
        }
    }).sort((a, b) => a.media - b.media)

    // Ítems críticos: promedio en escala 0-2 y cuántos están en el suelo.
    const acumulado: Record<string, { pesos: number[]; etiqueta: string; dimension: string }> = {}
    for (const e of muestra) {
        for (const resp of e.respuestas) {
            const cat = buscarItem(resp.questionText ?? '')
            if (!cat) continue
            ;(acumulado[cat.codigo] ??= { pesos: [], etiqueta: cat.etiqueta, dimension: cat.dimension }).pesos.push(
                resp.weight
            )
        }
    }
    const itemsCriticos: ItemCritico[] = Object.entries(acumulado)
        .map(([codigo, v]) => {
            const enCero = v.pesos.filter((w) => w === 0).length
            return {
                codigo,
                etiqueta: v.etiqueta,
                dimension: v.dimension,
                media: r1(media(v.pesos)),
                enCero,
                pctEnCero: v.pesos.length ? r1((enCero / v.pesos.length) * 100) : 0,
            }
        })
        .sort((a, b) => a.media - b.media || b.enCero - a.enCero)

    return {
        muestra,
        todas,
        n: muestra.length,
        nRepeticiones: todas.length - muestra.length,
        dmiMedio: r1(media(dmis)),
        dmiMediana: r1(mediana(dmis)),
        dmiDesviacion: r1(desviacion(dmis)),
        dmiMin: dmis.length ? Math.min(...dmis) : 0,
        dmiMax: dmis.length ? Math.max(...dmis) : 0,
        porNivel,
        porDimension,
        porSector: repartoPor(muestra, (e) => e.sector, 'Sin especificar'),
        porProvincia: repartoPor(muestra, (e) => e.province, 'Sin especificar'),
        itemsCriticos,
    }
}

/** Meta de muestra fijada en el proyecto aprobado (mínimo 30 emprendimientos). */
export const META_MUESTRA = 30
