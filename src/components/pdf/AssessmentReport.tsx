import React from 'react'
import { Document, Page, Text, View, Image, Link } from '@react-pdf/renderer'
import { RadarChartPdf } from './RadarChartPdf'
import { C, NIVEL, s } from './estilos'
import {
    DIMENSION_LEVEL_LABEL,
    classifyPriority,
    type DimensionResult,
    type MaturityLevel,
    type Priority,
} from '@/lib/scoring'
import { GLOBAL_SUMMARY, getRecommendation } from '@/lib/recommendations'
import {
    ETIQUETA_COSTO,
    ETIQUETA_ESFUERZO,
    accionPara,
    buscarItem,
    type Accion,
    type Plazo,
} from '@/lib/acciones'

/* ══════════════════════════════════════════════════════════════════════ */
/* Datos de entrada                                                       */
/* ══════════════════════════════════════════════════════════════════════ */

export interface AssessmentReportProps {
    companyName: string
    contactName?: string | null
    sector?: string | null
    city?: string | null
    province?: string | null
    date: string
    /** DMI — Índice de Madurez Digital global 0-100. */
    dmi: number
    level: MaturityLevel
    totalRawScore: number
    maxRawScore: number
    dimensions: DimensionResult[]
    /** Dimensiones ordenadas por brecha descendente. */
    priorities: DimensionResult[]
    /** Código verificable del reporte. */
    reportCode: string
    /** Dirección legible del reporte, sin el esquema. Se muestra como texto. */
    verifyUrl: string
    /** La misma dirección con esquema. Es la que hace pulsable el enlace. */
    verifyHref: string
    /**
     * Rutas de los logotipos. En el navegador se sirven desde `public/`; el
     * script de pruebas los pasa como rutas del sistema de archivos, porque en
     * Node no hay origen desde el que resolver una ruta absoluta.
     */
    logoSrc?: string
    wordmarkSrc?: string
    aguaSrc?: string
}

const LOGO_POR_DEFECTO = '/indoamerica-membrete.png'
const WORDMARK_POR_DEFECTO = '/insideebb-wordmark.png'
const AGUA_POR_DEFECTO = '/insideebb-agua.png'

const ETIQUETA_PRIORIDAD: Record<Priority, string> = {
    alta: 'Prioridad alta',
    media: 'Prioridad media',
    mantener: 'Mantener',
}

const COLOR_PRIORIDAD: Record<Priority, string> = {
    alta: C.naranja,
    media: C.moradoMedio,
    mantener: C.metadato,
}

/* ══════════════════════════════════════════════════════════════════════ */
/* Piezas reutilizables                                                   */
/* ══════════════════════════════════════════════════════════════════════ */

function Membrete({ reportCode, date, logoSrc }: { reportCode: string; date: string; logoSrc: string }) {
    return (
        <View style={s.membrete} fixed>
            <Image style={s.logo} src={logoSrc} />
            <View style={s.membreteDer}>
                <Text style={s.membreteProyecto}>DIAGNÓSTICO DE MADUREZ DIGITAL</Text>
                <Text style={s.membreteMeta}>{date}</Text>
                <Text style={s.membreteCodigo}>{reportCode}</Text>
            </View>
        </View>
    )
}

/**
 * Marca de agua: el logotipo de INSIDEEBB, grande y desvaído, saliendo por el
 * borde derecho a media altura. Es la única aparición de la marca en las
 * páginas de contenido —el pie ya no la repite— y el crédito completo va una
 * sola vez, en la última página.
 *
 * ▸ El tono claro viene horneado en el PNG (`insideebb-agua.png`, generado
 * desde el logotipo oficial), no de una opacidad en tiempo de render: así el
 * resultado es el mismo en el navegador y en Node, y no depende de que
 * @react-pdf respete `opacity` sobre una imagen.
 */
function Agua({ aguaSrc }: { aguaSrc: string }) {
    return <Image style={s.agua} src={aguaSrc} fixed />
}

function Pie({ verifyUrl, verifyHref }: { verifyUrl: string; verifyHref: string }) {
    return (
        <View style={s.pie} fixed>
            <View style={s.pieIzq}>
                <Text style={s.pieTexto}>Universidad Indoamérica · Proyecto Semilla 01/2026</Text>
                <Link src={verifyHref} style={s.pieEnlace}>
                    Abrir este reporte en {verifyUrl}
                </Link>
            </View>
            <Text style={s.pieNum} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
        </View>
    )
}

function Ficha({ etiqueta, valor }: { etiqueta: string; valor: string }) {
    return (
        <View style={s.fila}>
            <Text style={s.fichaEtiqueta}>{etiqueta}</Text>
            <Text style={s.fichaValor}>{valor}</Text>
        </View>
    )
}

function Vinneta({ children }: { children: React.ReactNode }) {
    return (
        <View style={s.vinneta}>
            <Text style={s.vinnetaMarca}>·</Text>
            <Text style={s.vinnetaTexto}>{children}</Text>
        </View>
    )
}

/** Barra de la escala 0-100 con los tres tramos y la posición del DMI marcada. */
function Escala({ dmi }: { dmi: number }) {
    const tramos: { nivel: MaturityLevel; ancho: string }[] = [
        { nivel: 'Incipiente', ancho: '33.33%' },
        { nivel: 'Transición', ancho: '33.33%' },
        { nivel: 'Consolidado', ancho: '33.34%' },
    ]
    const posicion = Math.min(100, Math.max(0, dmi))
    return (
        <View style={s.escala}>
            <View style={s.escalaBarra}>
                {tramos.map((t) => (
                    <View key={t.nivel} style={[s.escalaTramo, { width: t.ancho, backgroundColor: NIVEL[t.nivel].relleno }]} />
                ))}
            </View>
            {/* Marca de posición: un filete oscuro sobre el punto exacto del DMI. */}
            <View style={{ height: 5, marginTop: -9, marginBottom: 4 }}>
                <View
                    style={{
                        position: 'absolute',
                        left: `${posicion}%`,
                        width: 1.8,
                        height: 15,
                        marginTop: -3,
                        backgroundColor: C.tinta,
                    }}
                />
            </View>
            <View style={s.escalaLeyenda}>
                <Text style={[s.escalaTexto, { width: '33.33%' }]}>Básico · 0-33</Text>
                <Text style={[s.escalaTexto, { width: '33.33%' }]}>Intermedio · 34-66</Text>
                <Text style={[s.escalaTexto, { width: '33.34%' }]}>Avanzado · 67-100</Text>
            </View>
        </View>
    )
}

/* ══════════════════════════════════════════════════════════════════════ */
/* Acciones derivadas de las respuestas                                   */
/* ══════════════════════════════════════════════════════════════════════ */

interface AccionResuelta extends Accion {
    dimension: string
    /** Nombre corto del ítem del que sale la acción. */
    itemEtiqueta: string
}

/**
 * Convierte las respuestas de una dimensión en acciones concretas: solo los
 * ítems puntuados 0 o 1 generan acción, porque un ítem en 2 ya está en el techo
 * de la escala. Si un ítem no aparece en el catálogo —una pregunta nueva sin
 * acción escrita todavía— simplemente no aporta, y la dimensión cae en su texto
 * general. Nunca se inventa un consejo.
 */
function accionesDe(d: DimensionResult): AccionResuelta[] {
    const salida: (AccionResuelta & { peso: number })[] = []
    for (const item of d.items) {
        const cat = buscarItem(item.questionText)
        if (!cat) continue
        const accion = accionPara(cat, item.weight)
        if (!accion) continue
        salida.push({ ...accion, dimension: d.name, itemEtiqueta: cat.etiqueta, peso: item.weight })
    }
    // Primero lo que está en cero, y a igual puntaje, lo que cuesta menos.
    const orden: Record<string, number> = { bajo: 0, medio: 1, alto: 2 }
    return salida.sort((a, b) => a.peso - b.peso || orden[a.esfuerzo] - orden[b.esfuerzo])
}

/* ══════════════════════════════════════════════════════════════════════ */
/* Documento                                                              */
/* ══════════════════════════════════════════════════════════════════════ */

export const AssessmentReport = (p: AssessmentReportProps) => {
    const logoSrc = p.logoSrc ?? LOGO_POR_DEFECTO
    const wordmarkSrc = p.wordmarkSrc ?? WORDMARK_POR_DEFECTO
    const aguaSrc = p.aguaSrc ?? AGUA_POR_DEFECTO
    const marco = { reportCode: p.reportCode, date: p.date, logoSrc }
    const pie = { verifyUrl: p.verifyUrl, verifyHref: p.verifyHref }

    const mejor = [...p.dimensions].sort((a, b) => b.normalized - a.normalized)[0]
    const peor = [...p.dimensions].sort((a, b) => a.normalized - b.normalized)[0]

    /*
     * El plan se acota a propósito. Generar una acción por cada ítem por debajo
     * del máximo produce hasta veintiuna, y eso no es un plan: es una lista que
     * nadie ejecuta. Se toman las tres dimensiones de mayor brecha —el cuadrante
     * «concentrarse aquí» del análisis importancia-desempeño— y dentro de cada
     * una, las tres respuestas más bajas. Como máximo nueve acciones.
     */
    const conBrecha = p.priorities.filter((d) => classifyPriority(d.gap) !== 'mantener')
    const focos = (conBrecha.length > 0 ? conBrecha : p.priorities).slice(0, 3)
    const grupos = focos.map((d) => ({ dimension: d, acciones: accionesDe(d).slice(0, 3) }))

    // Las dimensiones que quedan fuera del foco, para no dejarlas sin mención.
    const resto = p.dimensions.filter(
        (d) => !focos.some((f) => f.name === d.name) && classifyPriority(d.gap) !== 'mantener'
    )

    // Hoja de ruta: todas las acciones repartidas por plazo, sin repetir título.
    const todas = grupos.flatMap((g) => g.acciones)
    const porPlazo = (plazo: Plazo) => {
        const vistos = new Set<string>()
        return todas
            .filter((a) => a.plazo === plazo)
            .filter((a) => (vistos.has(a.titulo) ? false : (vistos.add(a.titulo), true)))
    }

    return (
        <Document
            title={`Diagnóstico de Madurez Digital — ${p.companyName}`}
            author="Universidad Indoamérica · Proyecto Semilla"
            subject="Reporte de autodiagnóstico de madurez digital"
            creator="Plataforma de Madurez Digital · Proyecto Semilla"
        >
            {/* ══════════════ Página 1 · Resultado ══════════════ */}
            <Page size="A4" style={s.page}>
                <Agua aguaSrc={aguaSrc} />
                <Membrete {...marco} />

                <View style={s.tituloBloque}>
                    <Text style={s.titulo}>Diagnóstico de Madurez Digital</Text>
                    <Text style={s.subtitulo}>
                        Autodiagnóstico de 21 ítems en 6 dimensiones. Los criterios de cálculo y el alcance de este
                        reporte se detallan en la última página.
                    </Text>
                </View>

                <View style={s.seccion}>
                    <Text style={s.seccionTitulo}>Datos del emprendimiento</Text>
                    <Ficha etiqueta="Emprendimiento" valor={p.companyName} />
                    {p.contactName ? <Ficha etiqueta="Persona de contacto" valor={p.contactName} /> : null}
                    {p.sector ? <Ficha etiqueta="Sector" valor={p.sector} /> : null}
                    {p.city || p.province ? (
                        <Ficha etiqueta="Ubicación" valor={[p.city, p.province].filter(Boolean).join(', ')} />
                    ) : null}
                    <Ficha etiqueta="Fecha del diagnóstico" valor={p.date} />
                </View>

                <View style={s.cajaGlobal} wrap={false}>
                    <View style={s.globalIzq}>
                        <Text style={s.rotulo}>ÍNDICE DE MADUREZ DIGITAL</Text>
                        <Text style={s.dmi}>{p.dmi.toFixed(1)}%</Text>
                        <Text style={s.bruto}>
                            Puntaje bruto {p.totalRawScore} de {p.maxRawScore}
                        </Text>
                    </View>
                    <View style={s.globalDer}>
                        <Text
                            style={[
                                s.insignia,
                                { color: NIVEL[p.level].texto, backgroundColor: NIVEL[p.level].relleno },
                            ]}
                        >
                            Nivel {p.level} · {NIVEL[p.level].etiqueta}
                        </Text>
                        <Text style={s.glosa}>{GLOBAL_SUMMARY[p.level]}</Text>
                    </View>
                </View>

                <View style={s.seccion} wrap={false}>
                    <Text style={s.seccionTitulo}>Posición en la escala</Text>
                    <Escala dmi={p.dmi} />
                </View>

                <View style={s.seccion} wrap={false}>
                    <Text style={s.seccionTitulo}>Perfil por dimensión</Text>
                    <View style={{ alignItems: 'center' }}>
                        <RadarChartPdf data={p.dimensions.map((d) => ({ name: d.name, normalized: d.normalized }))} />
                    </View>
                </View>

                <Pie {...pie} />
            </Page>

            {/* ══════════════ Página 2 · Desglose ══════════════ */}
            <Page size="A4" style={s.page}>
                <Agua aguaSrc={aguaSrc} />
                <Membrete {...marco} />

                <View style={s.tituloBloque}>
                    <Text style={s.titulo}>Desglose por dimensión</Text>
                    <Text style={s.subtitulo}>
                        Cada dimensión se normaliza a la escala 0-100 % para que sean comparables entre sí, aunque
                        tengan distinto número de preguntas.
                    </Text>
                </View>

                {/* La tabla no se parte: antes dejaba dos filas huérfanas en una página vacía. */}
                <View style={s.seccion} wrap={false}>
                    <View style={s.thead}>
                        <Text style={[s.th, s.colDim]}>DIMENSIÓN</Text>
                        <Text style={[s.th, s.colPunt]}>PUNTAJE</Text>
                        <Text style={[s.th, s.colPct]}>NIVEL %</Text>
                        <Text style={[s.th, s.colNivel]}>MADUREZ</Text>
                    </View>
                    {p.dimensions.map((d) => (
                        <View key={d.name} style={s.tr}>
                            <Text style={[s.td, s.colDim]}>{d.name}</Text>
                            <Text style={[s.td, s.colPunt]}>
                                {d.rawScore}/{d.maxScore}
                            </Text>
                            <Text style={[s.td, s.colPct, { fontFamily: 'Helvetica-Bold', color: C.tinta }]}>
                                {d.normalized.toFixed(0)}%
                            </Text>
                            <View style={s.colNivel}>
                                <Text
                                    style={[
                                        s.chip,
                                        { color: NIVEL[d.level].texto, backgroundColor: NIVEL[d.level].relleno },
                                    ]}
                                >
                                    {DIMENSION_LEVEL_LABEL[d.level]}
                                </Text>
                            </View>
                        </View>
                    ))}
                </View>

                <View style={s.caja} wrap={false}>
                    <Text style={s.cajaTitulo}>Cómo leer su perfil</Text>
                    <Vinneta>
                        <Text style={{ fontFamily: 'Helvetica-Bold' }}>Su punto más fuerte </Text>
                        es {mejor.name.toLowerCase()}, con {mejor.normalized.toFixed(0)} %. Es la base sobre la que
                        conviene apoyar los siguientes cambios.
                    </Vinneta>
                    <Vinneta>
                        <Text style={{ fontFamily: 'Helvetica-Bold' }}>Su mayor brecha </Text>
                        está en {peor.name.toLowerCase()}, con {peor.normalized.toFixed(0)} %. Ahí es donde una mejora
                        pequeña mueve más su índice global.
                    </Vinneta>
                    <Vinneta>
                        Un perfil parejo en el gráfico indica un negocio equilibrado; uno muy irregular indica que se
                        invirtió mucho en unas áreas y se descuidaron otras, que es el caso más frecuente.
                    </Vinneta>
                    <Vinneta>
                        Las seis dimensiones pesan lo mismo en el índice, así que un punto ganado en cualquiera de
                        ellas vale igual.
                    </Vinneta>
                </View>

                <Pie {...pie} />
            </Page>

            {/* ══════════════ Página 3 · Inventario de respuestas ══════════════ */}
            <Page size="A4" style={s.page}>
                <Agua aguaSrc={aguaSrc} />
                <Membrete {...marco} />

                <View style={s.tituloBloque}>
                    <Text style={s.titulo}>Sus respuestas, ítem por ítem</Text>
                    <Text style={s.subtitulo}>
                        El detalle completo de lo que usted respondió, con el puntaje de cada ítem sobre 2. Sirve para
                        verificar el resultado y para comparar cuando repita el diagnóstico.
                    </Text>
                </View>

                {p.dimensions.map((d) => (
                    <View key={d.name} wrap={false}>
                        <Text style={s.invDim}>
                            {d.name} — {d.rawScore}/{d.maxScore} · {d.normalized.toFixed(0)} %
                        </Text>
                        {d.items.map((it, i) => {
                            const cat = buscarItem(it.questionText)
                            return (
                                <View key={i} style={s.invFila}>
                                    <Text style={s.invItem}>{cat?.etiqueta ?? it.questionText.slice(0, 46)}</Text>
                                    <Text style={s.invResp}>{it.optionText}</Text>
                                    <Text
                                        style={[
                                            s.invPunt,
                                            { color: it.weight === 2 ? C.morado : it.weight === 1 ? C.moradoMedio : C.naranja },
                                        ]}
                                    >
                                        {it.weight}/2
                                    </Text>
                                </View>
                            )
                        })}
                    </View>
                ))}

                <Pie {...pie} />
            </Page>

            {/* ══════════════ Página 4 · Plan de acción ══════════════ */}
            <Page size="A4" style={s.page}>
                <Agua aguaSrc={aguaSrc} />
                <Membrete {...marco} />

                <View style={s.tituloBloque}>
                    <Text style={s.titulo}>Plan de acción priorizado</Text>
                    <Text style={s.subtitulo}>
                        {todas.length === 0
                            ? 'Su emprendimiento no registra brechas en el instrumento.'
                            : 'Se concentran aquí las tres dimensiones con mayor brecha, y dentro de cada una las tres respuestas más bajas. Es deliberado: un plan de nueve acciones se ejecuta, uno de veintiuna no. Cuando complete estas, repita el diagnóstico y el reporte le señalará las siguientes.'}
                    </Text>
                </View>

                {todas.length === 0 ? null : grupos.map((g) => {
                    const prioridad = classifyPriority(g.dimension.gap)
                    return (
                        <View key={g.dimension.name} style={s.grupo} wrap={false}>
                            <View style={s.grupoCabecera}>
                                <Text style={s.grupoTitulo}>{g.dimension.name}</Text>
                                <Text style={[s.grupoMeta, { color: COLOR_PRIORIDAD[prioridad] }]}>
                                    {ETIQUETA_PRIORIDAD[prioridad]} · {g.dimension.normalized.toFixed(0)} % · brecha{' '}
                                    {g.dimension.gap.toFixed(0)} pts
                                </Text>
                            </View>

                            {g.acciones.length === 0 ? (
                                <View style={s.accion}>
                                    <Text style={s.accionDetalle}>{getRecommendation(g.dimension.name, g.dimension.level)}</Text>
                                </View>
                            ) : (
                                g.acciones.map((a, i) => (
                                    <View key={i} style={s.accion}>
                                        <Text style={s.accionTitulo}>
                                            {a.itemEtiqueta} — {a.titulo}
                                        </Text>
                                        <Text style={s.accionDetalle}>{a.detalle}</Text>
                                        <View style={s.accionPie}>
                                            <Text style={s.etiqueta}>{ETIQUETA_ESFUERZO[a.esfuerzo]}</Text>
                                            <Text style={s.etiqueta}>{ETIQUETA_COSTO[a.costo]}</Text>
                                            <Text style={s.etiqueta}>Sugerido a {a.plazo} días</Text>
                                            {a.herramientas.map((h) => (
                                                <Text key={h} style={s.etiqueta}>
                                                    {h}
                                                </Text>
                                            ))}
                                        </View>
                                    </View>
                                ))
                            )}
                        </View>
                    )
                })}

                {resto.length > 0 ? (
                    <View style={s.caja} wrap={false}>
                        <Text style={s.cajaTitulo}>Después de lo anterior</Text>
                        {resto.map((d) => (
                            <Vinneta key={d.name}>
                                <Text style={{ fontFamily: 'Helvetica-Bold' }}>{d.name} ({d.normalized.toFixed(0)} %). </Text>
                                {getRecommendation(d.name, d.level)}
                            </Vinneta>
                        ))}
                    </View>
                ) : null}

                {todas.length === 0 ? (
                    <View style={s.caja}>
                        <Text style={s.cajaTitulo}>Sin brechas pendientes</Text>
                        <Text style={s.cajaTexto}>
                            Su emprendimiento respondió en el nivel máximo en todos los ítems evaluados. El instrumento
                            no distingue por encima de este punto: para seguir avanzando conviene un diagnóstico
                            especializado por área, no un autodiagnóstico general.
                        </Text>
                    </View>
                ) : null}

                {todas.length === 0 ? null : (
                <View style={s.seccion} wrap={false}>
                    <Text style={s.seccionTitulo}>Hoja de ruta sugerida</Text>
                    <Text style={[s.parrafo, { marginBottom: 9 }]}>
                        El mismo plan, repartido en el tiempo. El orden pone primero lo que cuesta menos y rinde antes.
                    </Text>
                    {([30, 60, 90] as Plazo[]).map((plazo) => {
                        const lista = porPlazo(plazo)
                        return (
                            <View key={plazo} style={s.rutaFila} wrap={false}>
                                <Text style={s.rutaHito}>{plazo} días</Text>
                                <View style={s.rutaLista}>
                                    {lista.length === 0 ? (
                                        <Text style={[s.rutaItem, { color: C.metadato }]}>
                                            Sin acciones pendientes en este tramo.
                                        </Text>
                                    ) : (
                                        lista.map((a, i) => (
                                            <Text key={i} style={s.rutaItem}>
                                                · {a.titulo}
                                            </Text>
                                        ))
                                    )}
                                </View>
                            </View>
                        )
                    })}
                </View>
                )}

                <Pie {...pie} />
            </Page>

            {/* ══════════════ Página 5 · Criterios y alcance ══════════════ */}
            <Page size="A4" style={s.page}>
                <Agua aguaSrc={aguaSrc} />
                <Membrete {...marco} />

                <View style={s.tituloBloque}>
                    <Text style={s.titulo}>Criterios, alcance y verificación</Text>
                    <Text style={s.subtitulo}>
                        Bajo qué reglas se calculó este diagnóstico, qué alcance tiene y cómo se recupera.
                    </Text>
                </View>

                <View style={s.seccion} wrap={false}>
                    <Text style={s.seccionTitulo}>Cómo se calculó su resultado</Text>
                    <Text style={s.parrafo}>
                        El índice se construye con el procedimiento canónico de indicadores compuestos del Handbook on
                        Constructing Composite Indicators (OCDE y Centro Común de Investigación, 2008): normalización,
                        ponderación y agregación lineal, en ese orden.
                    </Text>
                    <Text style={s.formula}>Ni = (puntaje obtenido / puntaje maximo) x 100</Text>
                    <Text style={s.parrafo}>
                        Cada dimensión se lleva a una escala de 0 a 100 dividiendo lo que usted obtuvo entre lo máximo
                        posible en esa dimensión. Así una dimensión de 3 preguntas y otra de 5 se pueden comparar.
                    </Text>
                    <Text style={s.formula}>DMI = (N1 + N2 + N3 + N4 + N5 + N6) / 6</Text>
                    <Text style={s.parrafo}>
                        El índice global es el promedio simple de las seis. Las dimensiones pesan lo mismo a propósito:
                        no existe evidencia publicada que justifique dar más peso a una que a otra en
                        microemprendimientos, y unos pesos inventados harían el resultado imposible de comparar entre
                        negocios.
                    </Text>
                    <Text style={s.formula}>Brecha = 100 - Ni</Text>
                    <Text style={s.parrafo}>
                        La prioridad de cada dimensión sale de su brecha, siguiendo el análisis importancia-desempeño
                        de Martilla y James (1977). Los tres niveles dividen la escala en tramos iguales, según el
                        escalonamiento por etapas de los modelos de madurez (de Bruin y otros, 2005; Becker y otros,
                        2009). Las seis dimensiones y los veintiún ítems se derivan del Digital Maturity Model para
                        pymes de Williams y otros (2024) y del Digital Maturity Assessment de la Comisión Europea,
                        adaptados al contexto ecuatoriano.
                    </Text>
                </View>

                <View style={s.caja} wrap={false}>
                    <Text style={s.cajaTitulo}>Qué es y qué no es este reporte</Text>
                    <Vinneta>
                        Es un <Text style={{ fontFamily: 'Helvetica-Bold' }}>autodiagnóstico</Text>: se basa
                        únicamente en lo que usted respondió. No se verificó en campo ni se auditaron sus sistemas.
                    </Vinneta>
                    <Vinneta>
                        Es un <Text style={{ fontFamily: 'Helvetica-Bold' }}>punto de partida orientativo</Text>, no
                        una consultoría ni una certificación. Las acciones sugeridas son prácticas generales para
                        microemprendimientos; conviene contrastarlas con la realidad de su negocio antes de invertir.
                    </Vinneta>
                    <Vinneta>
                        Las herramientas que se nombran son{' '}
                        <Text style={{ fontFamily: 'Helvetica-Bold' }}>ejemplos disponibles en Ecuador</Text>, no
                        recomendaciones comerciales. El proyecto no tiene relación con ninguno de esos proveedores ni
                        recibe pago de ellos.
                    </Vinneta>
                    <Vinneta>
                        El instrumento mide seis dimensiones con veintiún ítems. Es deliberadamente breve para que se
                        pueda responder en pocos minutos, a cambio de menor detalle que un diagnóstico especializado.
                    </Vinneta>
                    <Vinneta>
                        Puede repetir el diagnóstico más adelante para medir su avance. Cada aplicación genera un
                        reporte con su propio código.
                    </Vinneta>
                </View>

                <View style={s.caja} wrap={false}>
                    <Text style={s.cajaTitulo}>Datos personales y uso investigativo</Text>
                    <Text style={s.cajaTexto}>
                        Sus respuestas forman parte de la muestra del proyecto de investigación &quot;Medición del nivel
                        de madurez digital en microemprendimientos&quot; de la Universidad Indoamérica. Los resultados
                        se analizan y publican de forma agregada y anónima: ni el nombre de su emprendimiento ni sus
                        datos de contacto aparecen en ninguna publicación.
                    </Text>
                </View>

                <View style={s.caja} wrap={false}>
                    <Text style={s.cajaTitulo}>Verificación</Text>
                    <Text style={s.cajaTexto}>
                        Reporte {p.reportCode}, emitido el {p.date}. Guarde el enlace de abajo: es la única forma de
                        volver a abrir su diagnóstico.
                    </Text>
                    <Link src={p.verifyHref} style={s.enlace}>
                        {p.verifyUrl}
                    </Link>
                    <Link src={p.verifyHref} style={s.enlaceBoton}>
                        Abrir mi diagnóstico
                    </Link>
                </View>

                <View style={s.creditos} wrap={false}>
                    <View style={s.creditoCol}>
                        <Text style={s.creditoRotulo}>INVESTIGACIÓN</Text>
                        <Text style={s.creditoNombre}>Universidad Indoamérica</Text>
                        <Text style={s.creditoNota}>
                            Proyecto Semilla 01/2026 · Medición del nivel de madurez digital en microemprendimientos
                        </Text>
                    </View>
                    <View style={s.creditoCol}>
                        <Text style={s.creditoRotulo}>DESARROLLO DE LA PLATAFORMA</Text>
                        <Image style={s.creditoLogo} src={wordmarkSrc} />
                        <Text style={s.creditoNota}>
                            Instrumento, modelo de cálculo y reporte
                        </Text>
                    </View>
                </View>

                <Pie {...pie} />
            </Page>
        </Document>
    )
}
