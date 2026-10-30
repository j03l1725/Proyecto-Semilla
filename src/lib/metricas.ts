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
 * ▸ Solo entran en la muestra las evaluaciones con `estadoMuestra = 'oficial'`.
 *   Las 'pendiente' esperan decisión del equipo y las 'excluida' quedan fuera
 *   con su motivo. Una evaluación nueva entra como 'pendiente': no mueve ninguna
 *   cifra hasta que alguien la marque. De las oficiales de un mismo
 *   emprendimiento cuenta la más reciente.
 *
 * ▸ Los promedios se calculan sobre dimensiones normalizadas (Nᵢ), nunca sobre
 *   puntajes brutos: dimensiones con distinto número de ítems no son
 *   comparables en bruto.
 */

import { computeAssessmentResult, DIMENSION_ORDER, type MaturityLevel, type ScoringAnswer } from './scoring'
import { buscarItem, CATALOGO } from './acciones'

export interface EvaluacionCruda {
    id: string
    createdAt: Date
    companyId: string
    companyName: string
    sector: string | null
    province: string | null
    city: string | null
    /** Categoría cerrada de actividad; null en registros anteriores al cambio. */
    sectorCodigo: string | null
    /** Datos de contacto: solo los usa revisionCalidad, nunca se muestran en gráficos. */
    contactName: string | null
    companyEmail: string | null
    companyPhone: string | null
    /** Cuándo se registró el emprendimiento (para medir cuánto tardó en enviar). */
    companyCreatedAt: Date
    estadoMuestra: string
    motivoMuestra: string | null
    respuestas: ScoringAnswer[]
}

export interface EvaluacionCalculada extends EvaluacionCruda {
    dmi: number
    level: MaturityLevel
    totalRawScore: number
    porDimension: Record<string, number>
    /** true si es oficial pero el emprendimiento tiene otra oficial más reciente. */
    superada: boolean
    /** true si cuenta en la muestra. */
    enMuestra: boolean
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
    porDimension: {
        nombre: string
        media: number
        mediana: number
        desviacion: number
        min: number
        max: number
        /** Cuántos emprendimientos tienen la dimensión en 0. */
        enCero: number
        /** Alfa de Cronbach de los ítems de la dimensión; null si no se puede calcular. */
        alfa: number | null
    }[]
    porSector: Reparto[]
    porProvincia: Reparto[]
    itemsCriticos: ItemCritico[]
    /** Intervalo de confianza al 95 % de la media del DMI (t de Student). */
    dmiIC95: { inferior: number; superior: number; t: number } | null
    /** Alfa de Cronbach de los 21 ítems; null si no se puede calcular. */
    alfaCronbach: number | null
    /** Filas completas (21 ítems) usadas para el alfa. */
    nParaAlfa: number
    pctRespuestasEnCero: number
    pctRespuestasEnDos: number
    distribucionItems: DistribucionItem[]
    /** Histograma del DMI en intervalos de 10 puntos entre 0 y 100. */
    histogramaDmi: { desde: number; hasta: number; n: number }[]
    nPendientes: number
    nExcluidas: number
}

export interface DistribucionItem {
    codigo: string
    etiqueta: string
    dimension: string
    n0: number
    n1: number
    n2: number
    media: number
}

export type TipoAviso = 'repeticion' | 'envio-rapido' | 'dato-de-prueba' | 'pendiente' | 'sector-vacio'

export interface AvisoCalidad {
    tipo: TipoAviso
    companyId: string
    companyName: string
    /** Evaluaciones implicadas. */
    evaluaciones: string[]
    texto: string
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

function varianzaMuestral(xs: number[]): number {
    if (xs.length < 2) return 0
    const m = media(xs)
    return xs.reduce((a, x) => a + (x - m) ** 2, 0) / (xs.length - 1)
}

/**
 * Valor crítico t de Student de dos colas al 95 % (cuantil 0,975) con `gl`
 * grados de libertad, por la expansión de Cornish-Fisher en potencias de 1/gl.
 */
export function tCritico95(gl: number): number {
    const z = 1.959963984540054
    const z3 = z ** 3, z5 = z ** 5, z7 = z ** 7, z9 = z ** 9
    return (
        z +
        (z3 + z) / (4 * gl) +
        (5 * z5 + 16 * z3 + 3 * z) / (96 * gl ** 2) +
        (3 * z7 + 19 * z5 + 17 * z3 - 15 * z) / (384 * gl ** 3) +
        (79 * z9 + 776 * z7 + 1482 * z5 - 1920 * z3 - 945 * z) / (92160 * gl ** 4)
    )
}

/** Alfa de Cronbach de una matriz filas × ítems. null con menos de 2 filas o 2 ítems. */
export function alfaDeCronbach(filas: number[][]): number | null {
    const k = filas[0]?.length ?? 0
    if (filas.length < 2 || k < 2) return null
    const sumaVar = Array.from({ length: k }, (_, j) => varianzaMuestral(filas.map((f) => f[j]))).reduce(
        (a, b) => a + b,
        0
    )
    const varTotal = varianzaMuestral(filas.map((f) => f.reduce((a, b) => a + b, 0)))
    if (varTotal === 0) return null
    return (k / (k - 1)) * (1 - sumaVar / varTotal)
}

const r1 = (x: number) => Math.round(x * 10) / 10
/** Las medias de ítem van en escala 0-2: con un decimal se confunden 0,17 y 0,25. */
const r2 = (x: number) => Math.round(x * 100) / 100
const r3 = (x: number) => Math.round(x * 1000) / 1000

/** Agrupa por una clave de texto; los vacíos van a `sinDato`. */
function repartoPor(
    muestra: EvaluacionCalculada[],
    clave: (e: EvaluacionCalculada) => string | null,
    sinDato: string
): Reparto[] {
    const grupos: Record<string, number[]> = {}
    for (const e of muestra) {
        const bruto = (clave(e) ?? '').trim()
        const k = bruto === '' ? sinDato : bruto
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
            return { ...e, dmi: r.dmi, level: r.level, totalRawScore: r.totalRawScore, porDimension, superada: false, enMuestra: false }
        })
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

    // La muestra: oficiales, y de ellas la más reciente de cada emprendimiento.
    const vistos = new Set<string>()
    for (const e of todas) {
        if (e.estadoMuestra !== 'oficial') continue
        if (vistos.has(e.companyId)) e.superada = true
        else {
            vistos.add(e.companyId)
            e.enMuestra = true
        }
    }
    const muestra = todas.filter((e) => e.enMuestra)

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

    // Matriz de respuestas 0-2 por código de ítem, solo filas con los 21 ítems.
    const matrizItems = {
        filas: muestra
            .map((e) => {
                const f: Record<string, number> = {}
                for (const r of e.respuestas) {
                    const cat = buscarItem(r.questionText ?? '')
                    if (cat) f[cat.codigo] = r.weight
                }
                return f
            })
            .filter((f) => CATALOGO.every((c) => f[c.codigo] !== undefined)),
    }
    const alfaGlobal = alfaDeCronbach(matrizItems.filas.map((f) => CATALOGO.map((c) => f[c.codigo])))

    const todosPesos = muestra.flatMap((e) => e.respuestas.map((r) => r.weight))
    const pctPeso = (w: number) => (todosPesos.length ? r1((todosPesos.filter((x) => x === w).length / todosPesos.length) * 100) : 0)

    const distribucionItems: DistribucionItem[] = CATALOGO.map((c) => {
        const pesos = muestra.flatMap((e) =>
            e.respuestas.filter((r) => buscarItem(r.questionText ?? '')?.codigo === c.codigo).map((r) => r.weight)
        )
        return {
            codigo: c.codigo,
            etiqueta: c.etiqueta,
            dimension: c.dimension,
            n0: pesos.filter((w) => w === 0).length,
            n1: pesos.filter((w) => w === 1).length,
            n2: pesos.filter((w) => w === 2).length,
            media: r2(media(pesos)),
        }
    })

    const histogramaDmi = Array.from({ length: 10 }, (_, i) => ({
        desde: i * 10,
        hasta: i * 10 + 10,
        n: dmis.filter((d) => (i === 9 ? d >= 90 : d >= i * 10 && d < i * 10 + 10)).length,
    }))

    const tc = dmis.length >= 2 ? tCritico95(dmis.length - 1) : null
    const dmiIC95 =
        tc === null
            ? null
            : {
                  inferior: r1(media(dmis) - (tc * desviacion(dmis)) / Math.sqrt(dmis.length)),
                  superior: r1(media(dmis) + (tc * desviacion(dmis)) / Math.sqrt(dmis.length)),
                  t: r3(tc),
              }

    const porDimension = DIMENSION_ORDER.map((nombre) => {
        const vals = muestra.map((e) => e.porDimension[nombre]).filter((v) => v !== undefined)
        const codigos = CATALOGO.filter((c) => c.dimension === nombre).map((c) => c.codigo)
        const a = alfaDeCronbach(matrizItems.filas.map((f) => codigos.map((c) => f[c])))
        return {
            nombre,
            media: r1(media(vals)),
            mediana: r1(mediana(vals)),
            enCero: vals.filter((v) => v === 0).length,
            alfa: a === null ? null : r3(a),
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
                media: r2(media(v.pesos)),
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
        porSector: repartoPor(muestra, (e) => e.sectorCodigo, 'Sin dato'),
        porProvincia: repartoPor(muestra, (e) => e.province, 'Sin especificar'),
        itemsCriticos,
        dmiIC95,
        alfaCronbach: alfaGlobal === null ? null : r3(alfaGlobal),
        nParaAlfa: matrizItems.filas.length,
        pctRespuestasEnCero: pctPeso(0),
        pctRespuestasEnDos: pctPeso(2),
        distribucionItems,
        histogramaDmi,
        nPendientes: todas.filter((e) => e.estadoMuestra === 'pendiente').length,
        nExcluidas: todas.filter((e) => e.estadoMuestra === 'excluida').length,
    }
}

const DOMINIOS_FICTICIOS = /@(example\.(com|org|net)|test\.|ejemplo\.|prueba\.|mailinator\.|fake\.|asdf\.|correo\.com$|mail\.com$|x\.com$)/i

/**
 * Avisos de calidad sobre todas las evaluaciones. Solo informa: no cambia el
 * estado de nada. La decisión de incluir o excluir es del equipo. Las
 * evaluaciones ya excluidas no generan avisos.
 */
export function revisionCalidad(todas: EvaluacionCalculada[]): AvisoCalidad[] {
    const avisos: AvisoCalidad[] = []
    // La mediana de duración sale de la muestra completa; los avisos, solo de lo
    // que no está ya excluido: una exclusión es una decisión tomada, no algo por revisar.
    const todasConExcluidas = todas
    todas = todas.filter((e) => e.estadoMuestra !== 'excluida')

    // 1. Repetición de un mismo emprendimiento.
    const porEmpresa = new Map<string, EvaluacionCalculada[]>()
    for (const e of todas) (porEmpresa.get(e.companyId) ?? porEmpresa.set(e.companyId, []).get(e.companyId)!).push(e)
    for (const [companyId, evs] of porEmpresa) {
        if (evs.length > 1)
            avisos.push({
                tipo: 'repeticion',
                companyId,
                companyName: evs[0].companyName,
                evaluaciones: evs.map((e) => e.id),
                texto: `${evs.length} evaluaciones del mismo emprendimiento.`,
            })
    }

    // 2. Envío demasiado rápido: menos de un tercio de la mediana de la muestra.
    const duracion = (e: EvaluacionCalculada) => (e.createdAt.getTime() - e.companyCreatedAt.getTime()) / 1000
    const medianaDur = mediana(todasConExcluidas.filter((e) => e.enMuestra).map(duracion))
    if (medianaDur > 0) {
        for (const e of todas) {
            const d = duracion(e)
            if (d >= 0 && d < medianaDur / 3)
                avisos.push({
                    tipo: 'envio-rapido',
                    companyId: e.companyId,
                    companyName: e.companyName,
                    evaluaciones: [e.id],
                    texto: `Envió ${Math.round(d)} s después de registrarse; la mediana de la muestra es ${Math.round(medianaDur)} s.`,
                })
        }
    }

    // 3. Nombre o correo de prueba.
    for (const e of todas) {
        const campos = [e.companyName, e.contactName ?? '', e.companyEmail ?? '']
        if (campos.some((c) => /prueba/i.test(c)) || DOMINIOS_FICTICIOS.test(e.companyEmail ?? ''))
            avisos.push({
                tipo: 'dato-de-prueba',
                companyId: e.companyId,
                companyName: e.companyName,
                evaluaciones: [e.id],
                texto: 'El nombre o el correo parecen de prueba.',
            })
    }

    // 4. Emprendimientos con evaluaciones pendientes.
    for (const [companyId, evs] of porEmpresa) {
        const pend = evs.filter((e) => e.estadoMuestra === 'pendiente')
        if (pend.length)
            avisos.push({
                tipo: 'pendiente',
                companyId,
                companyName: evs[0].companyName,
                evaluaciones: pend.map((e) => e.id),
                texto: pend.length === 1 ? '1 evaluación pendiente de decisión.' : `${pend.length} evaluaciones pendientes de decisión.`,
            })
    }

    // 5. Sector vacío.
    for (const [companyId, evs] of porEmpresa) {
        if (!(evs[0].sectorCodigo ?? '').trim())
            avisos.push({
                tipo: 'sector-vacio',
                companyId,
                companyName: evs[0].companyName,
                evaluaciones: evs.map((e) => e.id),
                texto: 'Sin categoría de sector: aparece como “Sin dato” en los repartos.',
            })
    }

    return avisos
}

/** Meta de muestra fijada en el proyecto aprobado (mínimo 30 emprendimientos). */
export const META_MUESTRA = 30
