import React from 'react'
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

// Define the styles for the PDF
const styles = StyleSheet.create({
    page: {
        padding: 30,
        backgroundColor: '#ffffff',
        fontFamily: 'Helvetica',
    },
    header: {
        marginBottom: 30,
        borderBottomWidth: 1,
        borderBottomColor: '#2563eb',
        paddingBottom: 10,
    },
    title: {
        fontSize: 24,
        color: '#0f172a',
        fontWeight: 'bold',
    },
    subtitle: {
        fontSize: 12,
        color: '#64748b',
        marginTop: 5,
    },
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 16,
        color: '#1e293b',
        fontWeight: 'bold',
        marginBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
        paddingBottom: 5,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 5,
    },
    label: {
        fontSize: 11,
        color: '#475569',
    },
    value: {
        fontSize: 11,
        color: '#0f172a',
        fontWeight: 'bold',
    },
    maturityBox: {
        backgroundColor: '#f1f5f9',
        padding: 15,
        borderRadius: 5,
        marginBottom: 20,
        alignItems: 'center',
    },
    maturityLevel: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#2563eb', // Default blue, you can adjust dynamically if preferred
        marginTop: 5,
    },
    dimensionItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    recommendationBlock: {
        marginTop: 30,
        padding: 15,
        backgroundColor: '#eff6ff',
        borderRadius: 5,
    },
    recommendationTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#1e40af',
        marginBottom: 8,
    },
    recommendationText: {
        fontSize: 10,
        color: '#1e3a8a',
        lineHeight: 1.5,
    },
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 30,
        right: 30,
        textAlign: 'center',
        fontSize: 9,
        color: '#94a3b8',
        borderTopWidth: 1,
        borderTopColor: '#e2e8f0',
        paddingTop: 10,
    }
})

interface DimensionScore {
    subject: string;
    A: number;
    fullMark: number;
}

interface AssessmentReportProps {
    companyName: string;
    contactName?: string | null;
    sector?: string | null;
    totalScore: number;
    level: string;
    dimensionScores: DimensionScore[];
    date: string;
}

export const AssessmentReport = ({
    companyName,
    contactName,
    sector,
    totalScore,
    level,
    dimensionScores,
    date
}: AssessmentReportProps) => {

    const getRecommendations = (lvl: string) => {
        switch (lvl) {
            case 'Incipiente':
                return 'Tu negocio está en las primeras etapas de digitalización. Prioriza la adopción de herramientas básicas como un CRM sencillo, medios de pago digitales y un sistema de control de ventas estructurado para mejorar la eficiencia inicial.';
            case 'Transición':
                return 'Tienes una base digital establecida. El siguiente paso es integrar y automatizar tus herramientas. Considera implementar IA para atención al cliente y herramientas de análisis de datos para entender mejor a tu público.';
            case 'Consolidado':
                return '¡Excelente trabajo! Operas con alta madurez digital. Mantén tu innovación activa explorando nuevas tecnologías, optimizando algoritmos predictivos y fortaleciendo tu ciberseguridad corporativa.';
            default:
                return 'Continúa explorando herramientas digitales para fortalecer el alcance y operación de tu emprendimiento.';
        }
    }

    return (
        <Document>
            <Page size="A4" style={styles.page}>

                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>Diagnóstico de Madurez Digital</Text>
                    <Text style={styles.subtitle}>Proyecto Semilla - Reporte Oficial</Text>
                </View>

                {/* Company Info */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Datos del Emprendimiento</Text>
                    <View style={styles.row}>
                        <Text style={styles.label}>Empresa:</Text>
                        <Text style={styles.value}>{companyName}</Text>
                    </View>
                    {contactName && (
                        <View style={styles.row}>
                            <Text style={styles.label}>Contacto:</Text>
                            <Text style={styles.value}>{contactName}</Text>
                        </View>
                    )}
                    {sector && (
                        <View style={styles.row}>
                            <Text style={styles.label}>Sector:</Text>
                            <Text style={styles.value}>{sector}</Text>
                        </View>
                    )}
                    <View style={styles.row}>
                        <Text style={styles.label}>Fecha del Diagnóstico:</Text>
                        <Text style={styles.value}>{date}</Text>
                    </View>
                </View>

                {/* Global Result */}
                <View style={styles.maturityBox}>
                    <Text style={styles.label}>Puntaje Global: {totalScore} pts</Text>
                    <Text style={styles.maturityLevel}>Nivel {level}</Text>
                </View>

                {/* Dimensions Score Breakdown */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Desglose por Dimensión</Text>
                    {dimensionScores.map((dim, idx) => (
                        <View key={idx} style={styles.dimensionItem}>
                            <Text style={styles.label}>{dim.subject}</Text>
                            <Text style={styles.value}>{dim.A} pts</Text>
                        </View>
                    ))}
                </View>

                {/* Recommendations */}
                <View style={styles.recommendationBlock}>
                    <Text style={styles.recommendationTitle}>Recomendación Personalizada</Text>
                    <Text style={styles.recommendationText}>
                        {getRecommendations(level)}
                    </Text>
                </View>

                {/* Footer */}
                <Text style={styles.footer} fixed>
                    Este reporte fue generado automáticamente por la Plataforma del Proyecto Semilla el {date}.
                </Text>

            </Page>
        </Document>
    )
}
