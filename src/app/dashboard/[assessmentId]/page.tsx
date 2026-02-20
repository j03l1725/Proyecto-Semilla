import { notFound } from 'next/navigation'
import prisma from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default async function AssessmentResultPage({ params }: { params: Promise<{ assessmentId: string }> }) {
    const { assessmentId } = await params;

    const assessment = await prisma.assessment.findUnique({
        where: { id: assessmentId },
        include: {
            company: true
        }
    })

    if (!assessment) {
        notFound()
    }

    // Define colores según el nivel de madurez
    const getLevelColor = (level: string | null) => {
        switch (level) {
            case 'Consolidado': return 'text-green-600'
            case 'Transición': return 'text-amber-500'
            case 'Incipiente': return 'text-red-500'
            default: return 'text-slate-700'
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
            <Card className="w-full max-w-2xl shadow-xl">
                <CardHeader className="text-center space-y-4">
                    <CardTitle className="text-3xl font-bold text-slate-800">Resultados del Diagnóstico</CardTitle>
                    <CardDescription className="text-lg">
                        Empresa: <span className="font-semibold text-slate-900">{assessment.company.name}</span>
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8 flex flex-col items-center pb-8">

                    {/* Círculo Principal de Resultado */}
                    <div className="flex flex-col items-center justify-center p-8 bg-slate-100 rounded-full w-64 h-64 border-8 border-white shadow-inner">
                        <span className="text-sm font-medium text-slate-500 uppercase tracking-widest mb-2">Nivel de Madurez</span>
                        <span className={`text-3xl font-black text-center ${getLevelColor(assessment.level)}`}>
                            {assessment.level || 'Pendiente'}
                        </span>
                        <div className="mt-4 text-center">
                            <span className="text-5xl font-bold text-slate-800">{assessment.totalScore}</span>
                            <span className="text-slate-500 font-medium"> pts</span>
                        </div>
                    </div>

                    <div className="text-center max-w-md">
                        <p className="text-slate-600">
                            Estos son los resultados iniciales basados en tus respuestas.
                            En el siguiente sprint habilitaremos la funcionalidad para exportar este reporte detallado en PDF.
                        </p>
                    </div>

                    <div className="pt-6 w-full flex justify-center border-t border-slate-100">
                        <Link href="/" passHref>
                            <Button variant="outline" size="lg">Hacer un nuevo diagnóstico</Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
