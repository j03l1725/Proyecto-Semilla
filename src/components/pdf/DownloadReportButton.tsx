'use client'

import React, { useEffect, useState } from 'react'
import { PDFDownloadLink } from '@react-pdf/renderer'
import { AssessmentReport, type AssessmentReportProps } from './AssessmentReport'
import { Button, buttonVariants } from '@/components/ui/button'
import { Download } from 'lucide-react'

export function DownloadReportButton(props: AssessmentReportProps) {
    // Estado de hidratación: @react-pdf solo funciona en el cliente.
    const [isClient, setIsClient] = useState(false)

    useEffect(() => {
        const timer = setTimeout(() => setIsClient(true), 1)
        return () => clearTimeout(timer)
    }, [])

    if (!isClient) {
        return (
            <Button variant="default" size="lg" disabled>
                <Download className="mr-2 h-4 w-4" /> Generando Reporte...
            </Button>
        )
    }

    const safeName = props.companyName.replace(/\s+/g, '_')

    return (
        <PDFDownloadLink
            document={<AssessmentReport {...props} />}
            fileName={`Diagnostico_Madurez_Digital_${safeName}.pdf`}
            className={buttonVariants({ variant: 'default', size: 'lg', className: 'w-full sm:w-auto font-semibold' })}
            style={{ textDecoration: 'none' }}
        >
            {({ loading }: { loading: boolean }) => (
                <>
                    <Download className="mr-2 h-4 w-4" />
                    {loading ? 'Generando PDF...' : 'Descargar Reporte Completo'}
                </>
            )}
        </PDFDownloadLink>
    )
}
