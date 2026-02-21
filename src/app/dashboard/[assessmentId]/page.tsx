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

    // Define colores según el nivel de madurez para el Badge pero en Dark Theme
    const getLevelBadgeStyles = (level: string | null) => {
        switch (level) {
            case 'Consolidado': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-[0_0_15px_rgba(52,211,153,0.15)]'
            case 'Transición': return 'bg-amber-500/10 text-amber-400 border-amber-500/30 shadow-[0_0_15px_rgba(251,191,36,0.15)]'
            case 'Incipiente': return 'bg-rose-500/10 text-rose-400 border-rose-500/30 shadow-[0_0_15px_rgba(244,63,94,0.15)]'
            default: return 'bg-slate-800 text-slate-300 border-slate-700'
        }
    }

    return (
        <div className="min-h-screen bg-[#0a0f0d] flex flex-col items-center p-4 sm:p-8 font-sans relative overflow-hidden selection:bg-green-500/30 selection:text-green-200">

            {/* Ambient Glow Effects (Dark Theme Neon) */}
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-emerald-500/20 rounded-full blur-[150px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[150px] pointer-events-none" />

            {/* NavBar simulada Brand */}
            <div className="w-full max-w-5xl mb-6">
                <Link href="/" className="inline-flex items-center space-x-3 cursor-pointer group">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/20 group-hover:scale-105 transition-transform">
                        <span className="text-white font-extrabold text-xl">S</span>
                    </div>
                    <span className="text-2xl font-bold tracking-tighter text-white">Semilla</span>
                </Link>
            </div>

            {/* Cabecera Premium Dark */}
            <div className="w-full max-w-5xl mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
                <div>
                    <div className="inline-flex items-center px-3 py-1 mb-4 rounded-full border border-green-500/30 bg-green-500/10 text-green-400 text-sm font-medium tracking-wide">
                        <span className="w-2 h-2 rounded-full bg-green-400 mr-2 animate-pulse" />
                        Diagnóstico Completado
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-extrabold text-[#f4f7f5] tracking-tight flex items-center gap-3">
                        <Medal className="w-10 h-10 text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.5)]" />
                        Resultados Globales
                    </h1>
                    <p className="mt-4 text-slate-400 text-lg md:text-xl max-w-2xl font-light leading-relaxed">
                        Análisis dimensional de la madurez tecnológica y operativa calculada para su modelo de negocio.
                    </p>
                </div>

                <div className="flex items-center gap-2 bg-[#131b17]/80 backdrop-blur-md px-4 py-2 border border-white/10 rounded-full shadow-sm text-sm font-medium text-slate-300">
                    <Calendar className="w-4 h-4 text-emerald-500" />
                    {new Date(assessment.createdAt).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
            </div>

            <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">

                {/* Columna Izquierda: Tarjeta de Puntaje Total y Datos (Glassmorphism) */}
                <div className="lg:col-span-4 flex flex-col gap-6">
                    <Card className="bg-[#131b17]/60 backdrop-blur-2xl border-white/5 shadow-2xl shadow-green-900/10 overflow-hidden rounded-[2rem]">
                        {/* Gradient Header Neón */}
                        <div className="h-2 bg-gradient-to-r from-green-400 via-emerald-500 to-teal-600" />

                        <CardContent className="pt-8 pb-8 flex flex-col items-center">

                            <div className="w-16 h-16 bg-green-500/10 text-emerald-400 rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(52,211,153,0.15)] ring-1 ring-emerald-500/30">
                                <Building2 className="w-8 h-8" />
                            </div>

                            <CardTitle className="text-2xl font-bold text-white text-center mb-2">{assessment.company.name}</CardTitle>
                            <CardDescription className="text-center text-slate-400 mb-10">{assessment.company.sector || 'Perfil Empresarial'}</CardDescription>

                            {/* Círculo Principal de Resultado Radial (Premium Dark Vibe) */}
                            <div className="relative flex flex-col items-center justify-center p-6 bg-[#0a0f0d] rounded-full w-52 h-52 border border-white/5 shadow-[inset_0_2px_20px_rgba(0,0,0,0.5),0_0_30px_rgba(52,211,153,0.1)] mb-10">
                                {/* Anillo decorativo rotatorio u opcional */}
                                <div className="absolute inset-[-4px] rounded-full border border-green-500/20 border-t-green-500/50" />

                                <span className="text-xs font-bold text-green-500 uppercase tracking-widest mb-1 drop-shadow-[0_0_8px_rgba(34,197,94,0.8)]">Tu Puntaje</span>
                                <div className="flex items-baseline mt-1">
                                    <span className="text-7xl font-black tracking-tighter text-white drop-shadow-md">
                                        {assessment.totalScore}
                                    </span>
                                    <span className="text-xl font-bold text-slate-500 ml-1">/36</span>
                                </div>
                            </div>

                            <div className="text-center space-y-3 w-full px-4">
                                <p className="text-sm font-medium text-slate-500 uppercase tracking-widest">Diagnóstico Cualitativo</p>
                                <div className={`inline-flex items-center justify-center w-full py-4 px-4 rounded-2xl border font-bold text-lg tracking-wide ${getLevelBadgeStyles(assessment.level)}`}>
                                    {assessment.level || 'Pendiente'}
                                </div>
                            </div>

                        </CardContent>
                    </Card>

                    {/* Botones de Acción */}
                    <div className="flex flex-col gap-4">
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
                            <Button variant="outline" size="lg" className="w-full bg-[#131b17]/50 hover:bg-[#131b17] border-white/10 hover:border-white/20 text-slate-300 hover:text-white h-14 rounded-2xl font-semibold backdrop-blur-md transition-all group">
                                Volver al Inicio
                                <ArrowRight className="w-4 h-4 ml-2 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Columna Derecha: Gráfica Hexagonal Dimensional Dark */}
                <div className="lg:col-span-8 flex flex-col">
                    <Card className="bg-[#131b17]/60 backdrop-blur-2xl border-white/5 shadow-2xl shadow-green-900/10 rounded-[2rem] h-full flex flex-col overflow-hidden relative">
                        {/* Background pattern subtil tecnológico (puntos en gris muy oscuro) */}
                        <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#1e293b 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

                        <CardHeader className="border-b border-white/5 bg-black/20 z-10 px-8 py-8">
                            <CardTitle className="flex items-center gap-3 text-white text-2xl font-bold tracking-tight">
                                <FileText className="w-6 h-6 text-emerald-400" />
                                Mapa de Capacidades Digitales
                            </CardTitle>
                            <CardDescription className="text-slate-400 mt-2 text-base">
                                Visualización radial de las 6 dimensiones estructurales del negocio para identificar polos térmicos de fortalezas corporativas.
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="flex-1 p-6 sm:p-10 relative min-h-[450px] flex items-center justify-center">
                            <div className="w-full h-full relative z-10">
                                <MaturityChart data={chartData} />
                            </div>
                        </CardContent>
                    </Card>
                </div>

            </div>

            {/* Footer Notice Oscuro */}
            <div className="mt-16 text-center max-w-lg mx-auto relative z-10 pb-8">
                <p className="text-sm text-slate-500 bg-[#131b17]/80 backdrop-blur-md py-3 px-6 rounded-full border border-white/5 shadow-xl">
                    Herramienta de referencia estratégica. Desarrollado por el equipo de Catalyst.
                </p>
            </div>
        </div>
    )
}
