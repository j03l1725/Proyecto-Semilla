import { notFound } from 'next/navigation'
import prisma from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { MaturityChart } from '@/components/charts/MaturityChart'
import { DownloadReportButton } from '@/components/pdf/DownloadReportButton'
import { ArrowLeft, Building2, User, Briefcase, Calendar, Award, FileBarChart } from 'lucide-react'

// Pesos oficiales del modelo v2.0
const DIMENSION_WEIGHTS: Record<string, number> = {
    'Tecnologías y habilidades digitales': 0.15,
    'Comunicaciones y canales de venta': 0.10,
    'Organización y personas': 0.15,
    'Estrategia y transformación digital': 0.20,
    'Datos y analítica': 0.20,
    'Procesos': 0.20,
}

export default async function AdminAssessmentDetailPage({ params }: { params: Promise<{ assessmentId: string }> }) {
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

    // Calcular datos por dimensión
    const dimensionData = assessment.answers.reduce((acc, answer) => {
        const dimName = answer.question.dimension.name;
        if (!acc[dimName]) {
            acc[dimName] = { score: 0, questionCount: 0, answers: [] as { question: string; answer: string; weight: number }[] };
        }
        acc[dimName].score += answer.option.weight;
        acc[dimName].questionCount += 1;
        acc[dimName].answers.push({
            question: answer.question.text,
            answer: answer.option.text,
            weight: answer.option.weight
        });
        return acc;
    }, {} as Record<string, { score: number; questionCount: number; answers: { question: string; answer: string; weight: number }[] }>);

    const maxTotalScore = assessment.answers.length * 2;

    // Datos normalizados para el radar (0-100%)
    const chartData = Object.keys(dimensionData).map(key => {
        const maxDimScore = dimensionData[key].questionCount * 2
        const normalized = maxDimScore > 0 ? Math.round((dimensionData[key].score / maxDimScore) * 100) : 0
        return {
            subject: key,
            A: normalized,
            fullMark: 100
        }
    });

    // Calcular IMG
    let img = 0
    for (const [dimName, data] of Object.entries(dimensionData)) {
        const weight = DIMENSION_WEIGHTS[dimName] || 0
        const maxScore = data.questionCount * 2
        const normalized = maxScore > 0 ? (data.score / maxScore) * 100 : 0
        img += weight * normalized
    }

    const getLevelStyles = (level: string | null) => {
        switch (level) {
            case 'Consolidado': return 'bg-emerald-100 text-emerald-700 border-emerald-200'
            case 'Transición': return 'bg-amber-100 text-amber-700 border-amber-200'
            case 'Incipiente': return 'bg-red-100 text-red-700 border-red-200'
            default: return 'bg-slate-100 text-slate-700 border-slate-200'
        }
    }

    const getDimLevelLabel = (percentage: number) => {
        if (percentage <= 33.33) return { label: 'Básico', color: 'text-red-600 bg-red-50' }
        if (percentage <= 66.66) return { label: 'Intermedio', color: 'text-amber-600 bg-amber-50' }
        return { label: 'Avanzado', color: 'text-emerald-600 bg-emerald-50' }
    }

    // Orden de dimensiones para mostrar
    const dimensionOrder = [
        'Tecnologías y habilidades digitales',
        'Comunicaciones y canales de venta',
        'Organización y personas',
        'Estrategia y transformación digital',
        'Datos y analítica',
        'Procesos'
    ]

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-8">
            <div className="max-w-6xl mx-auto space-y-6">

                {/* Header con navegación */}
                <div className="flex items-center gap-4">
                    <Link href="/admin">
                        <Button variant="outline" size="sm" className="gap-2">
                            <ArrowLeft className="w-4 h-4" />
                            Volver al Panel
                        </Button>
                    </Link>
                </div>

                {/* Cabecera del emprendimiento */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800 tracking-tight flex items-center gap-3">
                            <Building2 className="w-8 h-8 text-blue-600" />
                            {assessment.company.name}
                        </h1>
                        <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-slate-500">
                            {assessment.company.contactName && (
                                <span className="flex items-center gap-1"><User className="w-4 h-4" /> {assessment.company.contactName}</span>
                            )}
                            {assessment.company.sector && (
                                <span className="flex items-center gap-1"><Briefcase className="w-4 h-4" /> {assessment.company.sector}</span>
                            )}
                            <span className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {new Date(assessment.createdAt).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    </div>

                    <DownloadReportButton
                        companyName={assessment.company.name}
                        contactName={assessment.company.contactName}
                        sector={assessment.company.sector}
                        totalScore={assessment.totalScore}
                        level={assessment.level || 'Pendiente'}
                        dimensionScores={chartData}
                        date={new Date(assessment.createdAt).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
                    />
                </div>

                {/* Tarjetas de resumen rápido */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="border-slate-200">
                        <CardContent className="pt-6 text-center">
                            <p className="text-sm font-medium text-slate-500 uppercase tracking-wide mb-1">Puntaje Bruto</p>
                            <p className="text-4xl font-black text-slate-800">{assessment.totalScore}<span className="text-lg text-slate-400 font-medium">/{maxTotalScore}</span></p>
                        </CardContent>
                    </Card>

                    <Card className="border-slate-200">
                        <CardContent className="pt-6 text-center">
                            <p className="text-sm font-medium text-slate-500 uppercase tracking-wide mb-1">Índice de Madurez (IMG)</p>
                            <p className="text-4xl font-black text-slate-800">{img.toFixed(1)}<span className="text-lg text-slate-400 font-medium">%</span></p>
                        </CardContent>
                    </Card>

                    <Card className="border-slate-200">
                        <CardContent className="pt-6 text-center">
                            <p className="text-sm font-medium text-slate-500 uppercase tracking-wide mb-1">Nivel de Madurez</p>
                            <div className="mt-1">
                                <span className={`inline-flex px-4 py-2 rounded-full text-lg font-bold border ${getLevelStyles(assessment.level)}`}>
                                    <Award className="w-5 h-5 mr-2" />
                                    {assessment.level || 'Pendiente'}
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Gráfico Radar + Desglose por dimensión */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                    {/* Radar */}
                    <Card className="lg:col-span-5 border-slate-200">
                        <CardHeader>
                            <CardTitle className="text-lg text-slate-800 flex items-center gap-2">
                                <FileBarChart className="w-5 h-5 text-blue-600" />
                                Mapa de Capacidades
                            </CardTitle>
                            <CardDescription>Visualización radial normalizada (0-100%)</CardDescription>
                        </CardHeader>
                        <CardContent className="min-h-[400px] flex items-center justify-center bg-[#0a0f0d] rounded-xl mx-4 mb-4">
                            <MaturityChart data={chartData} />
                        </CardContent>
                    </Card>

                    {/* Tabla de dimensiones */}
                    <Card className="lg:col-span-7 border-slate-200">
                        <CardHeader>
                            <CardTitle className="text-lg text-slate-800">Desglose por Dimensión</CardTitle>
                            <CardDescription>Puntaje bruto, porcentaje normalizado y nivel individual</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {dimensionOrder.map((dimName) => {
                                    const data = dimensionData[dimName]
                                    if (!data) return null
                                    const maxScore = data.questionCount * 2
                                    const pct = maxScore > 0 ? Math.round((data.score / maxScore) * 100) : 0
                                    const weight = DIMENSION_WEIGHTS[dimName] || 0
                                    const dimLevel = getDimLevelLabel(pct)

                                    return (
                                        <div key={dimName} className="p-4 rounded-xl border border-slate-100 bg-white hover:border-slate-200 transition-colors">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                                                <h4 className="font-semibold text-slate-800 text-sm">{dimName}</h4>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs text-slate-400">Peso: {(weight * 100).toFixed(0)}%</span>
                                                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${dimLevel.color}`}>{dimLevel.label}</span>
                                                </div>
                                            </div>
                                            {/* Barra de progreso */}
                                            <div className="flex items-center gap-3">
                                                <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full transition-all duration-500 ${pct <= 33.33 ? 'bg-red-400' : pct <= 66.66 ? 'bg-amber-400' : 'bg-emerald-400'}`}
                                                        style={{ width: `${pct}%` }}
                                                    />
                                                </div>
                                                <span className="text-sm font-bold text-slate-700 min-w-[60px] text-right">{data.score}/{maxScore} ({pct}%)</span>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Detalle de respuestas por dimensión */}
                <Card className="border-slate-200">
                    <CardHeader>
                        <CardTitle className="text-lg text-slate-800">Respuestas Individuales</CardTitle>
                        <CardDescription>Detalle pregunta por pregunta de lo que respondió el emprendedor</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {dimensionOrder.map((dimName) => {
                                const data = dimensionData[dimName]
                                if (!data) return null

                                return (
                                    <div key={dimName}>
                                        <h3 className="font-bold text-slate-700 text-sm uppercase tracking-wide mb-3 border-b border-slate-100 pb-2">
                                            {dimName}
                                        </h3>
                                        <div className="space-y-3">
                                            {data.answers.map((ans, idx) => (
                                                <div key={idx} className="flex flex-col sm:flex-row gap-2 p-3 rounded-lg bg-slate-50/80 border border-slate-100">
                                                    <div className="flex-1">
                                                        <p className="text-sm font-medium text-slate-700">{ans.question}</p>
                                                        <p className="text-sm text-slate-500 mt-1">→ {ans.answer}</p>
                                                    </div>
                                                    <div className="flex items-center">
                                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${ans.weight === 0 ? 'bg-red-100 text-red-600' :
                                                                ans.weight === 1 ? 'bg-amber-100 text-amber-600' :
                                                                    'bg-emerald-100 text-emerald-600'
                                                            }`}>
                                                            {ans.weight} pts
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </CardContent>
                </Card>

            </div>
        </div>
    )
}
