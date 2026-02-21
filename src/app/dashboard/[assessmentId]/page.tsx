import { notFound } from 'next/navigation'
import prisma from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { MaturityChart } from '@/components/charts/MaturityChart'
import { DownloadReportButton } from '@/components/pdf/DownloadReportButton'
import { Medal, Building2, Calendar, FileText, ArrowRight } from 'lucide-react'

export default async function AssessmentResultPage({ params }: { params: Promise<{ assessmentId: string }> }) {
    const { assessmentId } = await params;

    const assessment = await prisma.assessment.findUnique({
        where: { id: assessmentId },
        include: {
            company: true,
            answers: {
                include: {
                    option: true,
                    question: {
                        include: {
                            dimension: true
                        }
                    }
                }
            }
        }
    })

    if (!assessment) {
        notFound()
    }

    // Calcular puntaje por dimensión
    const dimensionScores = assessment.answers.reduce((acc, answer) => {
        const dimName = answer.question.dimension.name;
        if (!acc[dimName]) {
            acc[dimName] = 0;
        }
        acc[dimName] += answer.option.weight;
        return acc;
    }, {} as Record<string, number>);

    // Formatear para re-charts
    const chartData = Object.keys(dimensionScores).map(key => ({
        subject: key,
        A: dimensionScores[key],
        fullMark: 6 // 3 questions per dimension, max 2 pts each
    }));

    // Define colores según el nivel de madurez para el Badge
    const getLevelBadgeStyles = (level: string | null) => {
        switch (level) {
            case 'Consolidado': return 'bg-emerald-100/50 text-emerald-700 border-emerald-200'
            case 'Transición': return 'bg-amber-100/50 text-amber-700 border-amber-200'
            case 'Incipiente': return 'bg-rose-100/50 text-rose-700 border-rose-200'
            default: return 'bg-slate-100 text-slate-700 border-slate-200'
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center p-4 sm:p-8 font-sans">

            {/* Cabecera Premium */}
            <div className="w-full max-w-5xl mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4 mt-6">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
                        <Medal className="w-8 h-8 text-blue-600" />
                        Resultados del Diagnóstico
                    </h1>
                    <p className="mt-2 text-slate-500 text-lg max-w-2xl">
                        Análisis detallado de la madurez digital para tu modelo de negocio basado en la matriz hexagonal.
                    </p>
                </div>

                <div className="flex items-center gap-2 bg-white px-4 py-2 border rounded-full shadow-sm text-sm font-medium text-slate-600">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    {new Date(assessment.createdAt).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
            </div>

            <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* Columna Izquierda: Tarjeta de Puntaje Total y Datos */}
                <div className="lg:col-span-4 flex flex-col gap-6">
                    <Card className="border-0 shadow-lg shadow-blue-900/5 overflow-hidden rounded-3xl pb-2">
                        {/* Gradient Header */}
                        <div className="h-2 bg-gradient-to-r from-blue-500 to-indigo-500" />

                        <CardContent className="pt-8 pb-6 flex flex-col items-center">

                            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-6 shadow-sm ring-4 ring-blue-50/50">
                                <Building2 className="w-8 h-8" />
                            </div>

                            <CardTitle className="text-2xl font-bold text-slate-900 text-center mb-2">{assessment.company.name}</CardTitle>
                            <CardDescription className="text-center mb-8">{assessment.company.sector || 'Acompañamiento Empresarial'}</CardDescription>

                            {/* Círculo Principal de Resultado Radial (Premium Vibe) */}
                            <div className="relative flex flex-col items-center justify-center p-6 bg-white rounded-full w-52 h-52 border-[12px] border-slate-50 shadow-[0_0_40px_rgba(0,0,0,0.03)] mb-8">
                                <div className="absolute inset-0 rounded-full border border-slate-100" />

                                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Tu Puntaje</span>
                                <div className="flex items-baseline">
                                    <span className="text-6xl font-black tracking-tighter text-slate-800">
                                        {assessment.totalScore}
                                    </span>
                                    <span className="text-lg font-bold text-slate-400 ml-1">/36</span>
                                </div>
                            </div>

                            <div className="text-center space-y-3 w-full px-4">
                                <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Categoría de Madurez</p>
                                <div className={`inline-flex items-center justify-center w-full py-3 px-4 rounded-xl border-2 font-bold text-lg ${getLevelBadgeStyles(assessment.level)}`}>
                                    {assessment.level || 'Pendiente'}
                                </div>
                            </div>

                        </CardContent>
                    </Card>

                    {/* Botones de Acción Mapeados desde la columna lateral (para Escritorio) o apilados en móvil */}
                    <div className="flex flex-col gap-3">
                        <DownloadReportButton
                            companyName={assessment.company.name}
                            contactName={assessment.company.contactName}
                            sector={assessment.company.sector}
                            totalScore={assessment.totalScore}
                            level={assessment.level || 'Pendiente'}
                            dimensionScores={chartData}
                            date={new Date(assessment.createdAt).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
                        />

                        <Link href="/" passHref className="w-full">
                            <Button variant="outline" size="lg" className="w-full bg-white hover:bg-slate-50 border-slate-200 text-slate-700 h-14 rounded-xl font-semibold shadow-sm group">
                                Volver al Perfil de Inicio
                                <ArrowRight className="w-4 h-4 ml-2 text-slate-400 group-hover:text-slate-600 transition-colors" />
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Columna Derecha: Gráfica Hexagonal Dimensional */}
                <div className="lg:col-span-8 flex flex-col">
                    <Card className="border-0 shadow-xl shadow-blue-900/5 rounded-3xl h-full flex flex-col bg-white overflow-hidden relative">
                        {/* Background pattern subtil */}
                        <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#3b82f6 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

                        <CardHeader className="border-b border-slate-100/50 bg-white/50 backdrop-blur-sm z-10 px-8 py-6">
                            <CardTitle className="flex items-center gap-2 text-slate-800 text-xl font-bold">
                                <FileText className="w-5 h-5 text-indigo-500" />
                                Mapeo de Capacidades
                            </CardTitle>
                            <CardDescription>Visualización radial de las 6 dimensiones estructurales del negocio basadas en un máximo de 6 puntos por vértice.</CardDescription>
                        </CardHeader>

                        <CardContent className="flex-1 p-6 relative min-h-[400px]">
                            <MaturityChart data={chartData} />
                        </CardContent>
                    </Card>
                </div>

            </div>

            {/* Footer Notice */}
            <div className="mt-12 text-center max-w-md mx-auto">
                <p className="text-sm text-slate-400">
                    Este diagnóstico es una herramienta de referencia estratégica elaborada para proveer insights tecnológicos y comerciales.
                </p>
            </div>
        </div>
    )
}
