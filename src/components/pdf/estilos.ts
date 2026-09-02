/**
 * Sistema visual del reporte — v4.0
 *
 * La identidad es la de la Universidad Indoamérica, que es quien respalda el
 * proyecto: morado institucional y naranja de acento, tomados del logotipo.
 * El verde esmeralda anterior no venía de ninguna marca.
 *
 * Los tres niveles de madurez son una escala ordinal, así que se codifican con
 * una rampa de un solo tono que va de claro a oscuro —no con un semáforo—, y
 * el color viaja siempre acompañado de la palabra: nunca se distingue un nivel
 * solo por su color. Contraste verificado: 8,6:1 · 7,1:1 · 11,0:1.
 */

import { StyleSheet } from '@react-pdf/renderer'
import type { MaturityLevel } from '@/lib/scoring'

export const C = {
    /** Morado institucional Indoamérica. */
    morado: '#3C2660',
    moradoMedio: '#5E4590',
    /** Naranja institucional. Reservado para señalar prioridad, nunca decorativo. */
    naranja: '#B4491A',
    tinta: '#1B1826',
    texto: '#3A3547',
    secundario: '#5A5566',
    metadato: '#7A7488',
    linea: '#DEDAE6',
    lineaSuave: '#EEEBF3',
    panel: '#F7F5FA',
    blanco: '#FFFFFF',
    agua: '#F5F2FA',
} as const

/** Rampa secuencial de los tres niveles. Luminancia 0,82 → 0,43 → 0,03. */
export const NIVEL: Record<MaturityLevel, { relleno: string; texto: string; etiqueta: string }> = {
    Incipiente: { relleno: '#EDE7F5', texto: '#4A3372', etiqueta: 'Básico' },
    'Transición': { relleno: '#B9A6D9', texto: '#2B1A47', etiqueta: 'Intermedio' },
    Consolidado: { relleno: '#3C2660', texto: '#F1ECF7', etiqueta: 'Avanzado' },
}

export const s = StyleSheet.create({
    page: {
        paddingTop: 30,
        paddingHorizontal: 40,
        paddingBottom: 62,
        backgroundColor: C.blanco,
        fontFamily: 'Helvetica',
        color: C.texto,
    },

    /* ── Membrete ────────────────────────────────────────────────────── */
    membrete: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        borderBottomWidth: 1.5,
        borderBottomColor: C.morado,
        paddingBottom: 9,
        marginBottom: 16,
    },
    logo: { width: 132 },
    membreteDer: { alignItems: 'flex-end' },
    membreteProyecto: {
        fontSize: 8,
        fontFamily: 'Helvetica-Bold',
        color: C.morado,
        letterSpacing: 0.4,
    },
    membreteMeta: { fontSize: 6.8, color: C.metadato, marginTop: 2.5 },

    /* ── Títulos ─────────────────────────────────────────────────────── */
    titulo: { fontSize: 19, color: C.morado, fontFamily: 'Helvetica-Bold', letterSpacing: -0.4 },
    subtitulo: { fontSize: 9, color: C.secundario, marginTop: 3, lineHeight: 1.4 },
    tituloBloque: { marginBottom: 15 },

    seccion: { marginBottom: 15 },
    seccionTitulo: {
        fontSize: 10.5,
        color: C.morado,
        fontFamily: 'Helvetica-Bold',
        marginBottom: 7,
        paddingBottom: 3.5,
        borderBottomWidth: 0.8,
        borderBottomColor: C.linea,
    },

    parrafo: { fontSize: 9, color: C.texto, lineHeight: 1.55 },

    /* ── Ficha de datos ──────────────────────────────────────────────── */
    fila: { flexDirection: 'row', marginBottom: 3.5 },
    fichaEtiqueta: { fontSize: 8.5, color: C.metadato, width: '30%' },
    fichaValor: { fontSize: 8.5, color: C.tinta, fontFamily: 'Helvetica-Bold', width: '70%' },

    /* ── Resultado global ────────────────────────────────────────────── */
    cajaGlobal: {
        flexDirection: 'row',
        borderWidth: 0.8,
        borderColor: C.linea,
        borderRadius: 4,
        marginBottom: 14,
        overflow: 'hidden',
    },
    globalIzq: {
        width: '34%',
        backgroundColor: C.panel,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRightWidth: 0.8,
        borderRightColor: C.linea,
    },
    globalDer: { width: '66%', paddingVertical: 12, paddingHorizontal: 14, justifyContent: 'center' },
    rotulo: { fontSize: 6.8, color: C.metadato, letterSpacing: 0.9, marginBottom: 3 },
    dmi: { fontSize: 34, color: C.morado, fontFamily: 'Helvetica-Bold', letterSpacing: -1.5 },
    bruto: { fontSize: 7.5, color: C.metadato, marginTop: 3 },
    insignia: {
        fontSize: 11,
        fontFamily: 'Helvetica-Bold',
        paddingVertical: 4,
        paddingHorizontal: 11,
        borderRadius: 3,
        marginBottom: 7,
    },
    glosa: { fontSize: 8.2, color: C.texto, lineHeight: 1.5 },

    /* ── Escala de posición ──────────────────────────────────────────── */
    escala: { marginTop: 10, marginBottom: 4 },
    escalaBarra: { flexDirection: 'row', height: 9, borderRadius: 2, overflow: 'hidden' },
    escalaTramo: { justifyContent: 'center', alignItems: 'center' },
    escalaLeyenda: { flexDirection: 'row', marginTop: 3 },
    escalaTexto: { fontSize: 6.5, color: C.metadato, textAlign: 'center' },

    /* ── Tabla ───────────────────────────────────────────────────────── */
    thead: {
        flexDirection: 'row',
        backgroundColor: C.panel,
        paddingVertical: 5,
        paddingHorizontal: 7,
        borderTopWidth: 0.8,
        borderTopColor: C.morado,
    },
    tr: {
        flexDirection: 'row',
        paddingVertical: 6,
        paddingHorizontal: 7,
        borderBottomWidth: 0.6,
        borderBottomColor: C.lineaSuave,
        alignItems: 'center',
    },
    th: { fontSize: 7, color: C.morado, fontFamily: 'Helvetica-Bold', letterSpacing: 0.3 },
    td: { fontSize: 8.5, color: C.texto },
    colDim: { width: '46%' },
    colPunt: { width: '15%', textAlign: 'center' },
    colPct: { width: '13%', textAlign: 'center' },
    colNivel: { width: '26%', textAlign: 'right' },
    chip: {
        fontSize: 7,
        fontFamily: 'Helvetica-Bold',
        paddingVertical: 2.5,
        paddingHorizontal: 6,
        borderRadius: 2,
        textAlign: 'center',
    },

    /* ── Acciones ────────────────────────────────────────────────────── */
    grupo: { marginBottom: 12 },
    grupoCabecera: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: C.panel,
        paddingVertical: 5,
        paddingHorizontal: 8,
        borderLeftWidth: 2.5,
        borderLeftColor: C.morado,
    },
    grupoTitulo: { fontSize: 9.5, color: C.morado, fontFamily: 'Helvetica-Bold' },
    grupoMeta: { fontSize: 7.5, fontFamily: 'Helvetica-Bold' },
    accion: { paddingTop: 7, paddingBottom: 2, paddingLeft: 10, paddingRight: 2 },
    accionTitulo: { fontSize: 8.8, color: C.tinta, fontFamily: 'Helvetica-Bold', marginBottom: 2.5 },
    accionDetalle: { fontSize: 8.2, color: C.texto, lineHeight: 1.5 },
    accionPie: { flexDirection: 'row', marginTop: 3.5, flexWrap: 'wrap' },
    etiqueta: {
        fontSize: 6.5,
        color: C.secundario,
        backgroundColor: C.panel,
        borderWidth: 0.5,
        borderColor: C.linea,
        borderRadius: 2,
        paddingVertical: 1.5,
        paddingHorizontal: 4,
        marginRight: 4,
        marginTop: 2,
    },

    /* ── Hoja de ruta ────────────────────────────────────────────────── */
    rutaFila: { flexDirection: 'row', marginBottom: 7, alignItems: 'flex-start' },
    rutaHito: {
        width: 58,
        alignSelf: 'flex-start',
        backgroundColor: C.morado,
        color: C.blanco,
        fontSize: 8,
        fontFamily: 'Helvetica-Bold',
        textAlign: 'center',
        paddingVertical: 4,
        borderRadius: 2,
        marginRight: 9,
    },
    rutaLista: { flex: 1, paddingTop: 1 },
    rutaItem: { fontSize: 8.2, color: C.texto, lineHeight: 1.45, marginBottom: 1.5 },

    /* ── Caja de nota ────────────────────────────────────────────────── */
    caja: {
        borderWidth: 0.8,
        borderColor: C.linea,
        backgroundColor: C.panel,
        borderRadius: 3,
        padding: 10,
        marginBottom: 12,
    },
    cajaTitulo: { fontSize: 8.5, color: C.morado, fontFamily: 'Helvetica-Bold', marginBottom: 4 },
    cajaTexto: { fontSize: 8, color: C.texto, lineHeight: 1.5 },
    vinneta: { flexDirection: 'row', marginBottom: 3 },
    vinnetaMarca: { fontSize: 8, color: C.morado, width: 11, fontFamily: 'Helvetica-Bold' },
    vinnetaTexto: { flex: 1, fontSize: 8, color: C.texto, lineHeight: 1.5 },

    /* ── Inventario de respuestas ────────────────────────────────────── */
    invDim: {
        fontSize: 8.5,
        fontFamily: 'Helvetica-Bold',
        color: C.morado,
        marginBottom: 3,
        marginTop: 5,
        paddingBottom: 2,
        borderBottomWidth: 0.6,
        borderBottomColor: C.lineaSuave,
    },
    invFila: { flexDirection: 'row', marginBottom: 2.5, alignItems: 'flex-start' },
    invItem: { fontSize: 7.6, color: C.secundario, width: '30%', paddingRight: 6 },
    invResp: { fontSize: 7.6, color: C.texto, width: '62%', lineHeight: 1.35 },
    invPunt: { fontSize: 7.6, fontFamily: 'Helvetica-Bold', width: '8%', textAlign: 'right' },

    /* ── Fórmulas ────────────────────────────────────────────────────── */
    formula: {
        fontSize: 8.5,
        fontFamily: 'Courier',
        color: C.morado,
        backgroundColor: C.panel,
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 2,
        marginTop: 3,
        marginBottom: 6,
    },

    /* ── Marca de agua ───────────────────────────────────────────────── */
    agua: {
        position: 'absolute',
        top: 392,
        left: 0,
        right: 0,
        textAlign: 'center',
        fontSize: 30,
        fontFamily: 'Helvetica-Bold',
        color: C.agua,
        letterSpacing: 7,
        transform: 'rotate(-24deg)',
    },

    /* ── Pie ─────────────────────────────────────────────────────────── */
    pie: {
        position: 'absolute',
        bottom: 24,
        left: 40,
        right: 40,
        borderTopWidth: 0.8,
        borderTopColor: C.linea,
        paddingTop: 6,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    pieIzq: { flexDirection: 'row', alignItems: 'center' },
    pieTexto: { fontSize: 6.5, color: C.metadato, lineHeight: 1.4 },
    pieLogo: { width: 46, marginLeft: 6 },
    pieNum: { fontSize: 6.5, color: C.metadato, fontFamily: 'Helvetica-Bold' },
})
