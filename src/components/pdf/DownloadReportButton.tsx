'use client'

import React, { useEffect, useState } from 'react'
import { PDFDownloadLink } from '@react-pdf/renderer'
import { AssessmentReport } from './AssessmentReport'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'

// Reuse interfaces for typing consistency
interface DimensionScore {
    subject: string;
    A: number;
    fullMark: number;
}

interface DownloadReportProps {
    companyName: string;
    contactName?: string | null;
    sector?: string | null;
    totalScore: number;
    level: string;
    dimensionScores: DimensionScore[];
    date: string;
}

export function DownloadReportButton(props: DownloadReportProps) {
    // Manejamos un estado de hidratación para Next.js
    const [isClient, setIsClient] = useState(false)

    useEffect(() => {
        const timer = setTimeout(() => setIsClient(true), 1)
        return () => clearTimeout(timer)
    }, [])

    if (!isClient) return <Button variant="default" size="lg" disabled><Download className="mr-2 h-4 w-4" /> Generando Reporte...</Button>

    return (
        <PDFDownloadLink
            document={<AssessmentReport {...props} />}
            fileName={`Diagnostico_Madurez_Digital_${props.companyName.replace(/\s+/g, '_')}.pdf`}
        >
            {({ loading }: { loading: boolean }) => (
                <Button
                    variant="default"
                    size="lg"
                    disabled={loading}
                    className="w-full sm:w-auto font-semibold"
                >
                    <Download className="mr-2 h-4 w-4" />
                    {loading ? 'Generando PDF...' : 'Descargar Reporte Completo'}
                </Button>
            )}
        </PDFDownloadLink>
    )
}
