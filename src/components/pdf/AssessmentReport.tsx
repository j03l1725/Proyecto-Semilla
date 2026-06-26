import React from 'react'
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import { RadarChartPdf } from './RadarChartPdf'
import {
    DIMENSION_LEVEL_LABEL,
    type DimensionResult,
    type MaturityLevel,
} from '@/lib/scoring'
import { GLOBAL_SUMMARY, getRecommendation } from '@/lib/recommendations'

/* ------------------------------------------------------------------ */
/* Paleta por nivel de madurez                                         */
/* ------------------------------------------------------------------ */
const LEVEL_COLORS: Record<MaturityLevel, { text: string; bg: string }> = {
    Incipiente: { text: '#dc2626', bg: '#fef2f2' },
    'Transición': { text: '#d97706', bg: '#fffbeb' },
    Consolidado: { text: '#059669', bg: '#ecfdf5' },
}

const styles = StyleSheet.create({
    page: { padding: 34, paddingBottom: 56, backgroundColor: '#ffffff', fontFamily: 'Helvetica' },

    header: { marginBottom: 18, borderBottomWidth: 2, borderBottomColor: '#059669', paddingBottom: 8 },
    title: { fontSize: 20, color: '#0f172a', fontFamily: 'Helvetica-Bold' },
    subtitle: { fontSize: 10, color: '#64748b', marginTop: 3 },

    section: { marginBottom: 16 },
    sectionTitle: {
        fontSize: 12, color: '#1e293b', fontFamily: 'Helvetica-Bold', marginBottom: 8,
        borderBottomWidth: 1, borderBottomColor: '#e2e8f0', paddingBottom: 4,
    },

    row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
    label: { fontSize: 9.5, color: '#475569' },
    value: { fontSize: 9.5, color: '#0f172a', fontFamily: 'Helvetica-Bold' },

    /* Bloque de resultado global */
    globalBox: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around',
        backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0',
        borderRadius: 6, padding: 14, marginBottom: 16,
    },
    globalCol: { alignItems: 'center' },
    globalCaption: { fontSize: 8, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 3 },
    dmiValue: { fontSize: 30, color: '#047857', fontFamily: 'Helvetica-Bold' },
    rawValue: { fontSize: 18, color: '#334155', fontFamily: 'Helvetica-Bold' },
    levelBadge: { fontSize: 13, fontFamily: 'Helvetica-Bold', paddingVertical: 5, paddingHorizontal: 12, borderRadius: 12 },

    radarWrap: { alignItems: 'center', marginBottom: 4 },
    caption: { fontSize: 8, color: '#94a3b8', textAlign: 'center', marginBottom: 12 },

    /* Tabla de dimensiones */
    tHead: { flexDirection: 'row', backgroundColor: '#f1f5f9', paddingVertical: 5, paddingHorizontal: 6, borderRadius: 3 },
    tRow: { flexDirection: 'row', paddingVertical: 6, paddingHorizontal: 6, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
    tHeadCell: { fontSize: 8, color: '#64748b', fontFamily: 'Helvetica-Bold', textTransform: 'uppercase' },
    tCell: { fontSize: 9, color: '#334155' },
    colDim: { width: '52%' },
    colScore: { width: '18%', textAlign: 'center' },
    colPct: { width: '14%', textAlign: 'center' },
    colLevel: { width: '16%', textAlign: 'right' },
    miniBadge: { fontSize: 7.5, fontFamily: 'Helvetica-Bold', paddingVertical: 2, paddingHorizontal: 5, borderRadius: 8 },

    /* Recomendaciones */
    summary: { fontSize: 9.5, color: '#334155', lineHeight: 1.5, marginBottom: 14 },
    recItem: {
        marginBottom: 10, padding: 10, backgroundColor: '#f8fafc',
        borderRadius: 5, borderLeftWidth: 3, borderLeftColor: '#059669',
    },
    recHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
    recRank: { fontSize: 9, color: '#047857', fontFamily: 'Helvetica-Bold' },
    recDim: { fontSize: 10, color: '#0f172a', fontFamily: 'Helvetica-Bold' },
    recText: { fontSize: 9, color: '#334155', lineHeight: 1.5 },

    footer: {
        position: 'absolute', bottom: 26, left: 34, right: 34, textAlign: 'center',
        fontSize: 8, color: '#94a3b8', borderTopWidth: 1, borderTopColor: '#e2e8f0', paddingTop: 8,
    },
})

export interface AssessmentReportProps {
    companyName: string
    contactName?: string | null
    sector?: string | null
    date: string
    /** DMI — Índice de Madurez Digital global 0-100. */
    dmi: number
    level: MaturityLevel
    totalRawScore: number
    maxRawScore: number
    dimensions: DimensionResult[]
    /** Dimensiones ordenadas por brecha descendente. */
    priorities: DimensionResult[]
}

function LevelBadge({ level }: { level: MaturityLevel }) {
    const c = LEVEL_COLORS[level]
    return <Text style={[styles.levelBadge, { color: c.text, backgroundColor: c.bg }]}>{level}</Text>
}

export const AssessmentReport = ({
    companyName,
    contactName,
    sector,
    date,
    dmi,
    level,
    totalRawScore,
    maxRawScore,
    dimensions,
    priorities,
}: AssessmentReportProps) => (
    <Document>
        {/* ---------------- Página 1: diagnóstico ---------------- */}
        <Page size="A4" style={styles.page}>
            <View style={styles.header}>
                <Text style={styles.title}>Diagnóstico de Madurez Digital</Text>
                <Text style={styles.subtitle}>Reporte de evaluación de madurez digital</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Datos del emprendimiento</Text>
                <View style={styles.row}>
                    <Text style={styles.label}>Empresa</Text>
                    <Text style={styles.value}>{companyName}</Text>
                </View>
                {contactName ? (
                    <View style={styles.row}>
                        <Text style={styles.label}>Contacto</Text>
                        <Text style={styles.value}>{contactName}</Text>
                    </View>
                ) : null}
                {sector ? (
                    <View style={styles.row}>
                        <Text style={styles.label}>Sector</Text>
                        <Text style={styles.value}>{sector}</Text>
                    </View>
                ) : null}
                <View style={styles.row}>
                    <Text style={styles.label}>Fecha del diagnóstico</Text>
                    <Text style={styles.value}>{date}</Text>
                </View>
            </View>

            <View style={styles.globalBox}>
                <View style={styles.globalCol}>
                    <Text style={styles.globalCaption}>Índice de Madurez (DMI)</Text>
                    <Text style={styles.dmiValue}>{dmi.toFixed(1)}%</Text>
                </View>
                <View style={styles.globalCol}>
                    <Text style={styles.globalCaption}>Nivel</Text>
                    <LevelBadge level={level} />
                </View>
                <View style={styles.globalCol}>
                    <Text style={styles.globalCaption}>Puntaje bruto</Text>
                    <Text style={styles.rawValue}>{totalRawScore}/{maxRawScore}</Text>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Mapa de capacidades digitales</Text>
                <View style={styles.radarWrap}>
                    <RadarChartPdf data={dimensions.map((d) => ({ name: d.name, normalized: d.normalized }))} />
                </View>
                <Text style={styles.caption}>
                    Las 6 dimensiones en escala normalizada 0-100 %. Cuanto más cerca del borde, mayor madurez.
                </Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Desglose por dimensión</Text>
                <View style={styles.tHead}>
                    <Text style={[styles.tHeadCell, styles.colDim]}>Dimensión</Text>
                    <Text style={[styles.tHeadCell, styles.colScore]}>Puntaje</Text>
                    <Text style={[styles.tHeadCell, styles.colPct]}>Nivel %</Text>
                    <Text style={[styles.tHeadCell, styles.colLevel]}>Madurez</Text>
                </View>
                {dimensions.map((d) => {
                    const c = LEVEL_COLORS[d.level]
                    return (
                        <View key={d.name} style={styles.tRow}>
                            <Text style={[styles.tCell, styles.colDim]}>{d.name}</Text>
                            <Text style={[styles.tCell, styles.colScore]}>{d.rawScore}/{d.maxScore}</Text>
                            <Text style={[styles.tCell, styles.colPct, { fontFamily: 'Helvetica-Bold' }]}>
                                {d.normalized.toFixed(0)}%
                            </Text>
                            <Text style={[styles.tCell, styles.colLevel, { color: c.text, fontFamily: 'Helvetica-Bold' }]}>
                                {DIMENSION_LEVEL_LABEL[d.level]}
                            </Text>
                        </View>
                    )
                })}
            </View>

            <Text style={styles.footer} fixed>
                Reporte generado por la plataforma de diagnóstico · {date}
            </Text>
        </Page>

        {/* ---------------- Página 2: recomendaciones ---------------- */}
        <Page size="A4" style={styles.page}>
            <View style={styles.header}>
                <Text style={styles.title}>Recomendaciones priorizadas</Text>
                <Text style={styles.subtitle}>
                    Acciones ordenadas por brecha de desempeño (análisis importancia-desempeño)
                </Text>
            </View>

            <Text style={styles.summary}>{GLOBAL_SUMMARY[level]}</Text>

            {priorities.map((d, idx) => (
                <View key={d.name} style={styles.recItem}>
                    <View style={styles.recHeader}>
                        <Text style={styles.recDim}>
                            {idx + 1}. {d.name}
                        </Text>
                        <Text style={styles.recRank}>
                            {idx < 3 ? 'Prioridad alta' : 'Prioridad media'} · {d.normalized.toFixed(0)}%
                        </Text>
                    </View>
                    <Text style={styles.recText}>{getRecommendation(d.name, d.level)}</Text>
                </View>
            ))}

            <Text style={styles.footer} fixed>
                Reporte generado por la plataforma de diagnóstico · {date}
            </Text>
        </Page>
    </Document>
)
