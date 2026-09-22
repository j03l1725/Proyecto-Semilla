import { notFound } from 'next/navigation'
import prisma from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { MaturityChart } from '@/components/charts/MaturityChart'
import { DownloadReportButton } from '@/components/pdf/DownloadReportButton'
import { computeAssessmentResult } from '@/lib/scoring'
import { reportCode, reportUrl, reportUrlCorta } from '@/lib/reporte'
import { ArrowLeft, Building2, User, Briefcase, Calendar, Award, FileBarChart, Phone, MapPin } from 'lucide-react'

// Detalle con datos en vivo: se renderiza en cada petición.
export const dynamic = 'force-dynamic'

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

    // Resultado con el modelo v3.0 (indicador compuesto OCDE/JRC)
    const result = computeAssessmentResult(
        assessment.answers.map(a => ({
            dimension: a.question.dimension.name,
            weight: a.option.weight,
            questionText: a.question.text,
            optionText: a.option.text,
        }))
    )

    // Datos normalizados para el radar (0-100%)
    const chartData = result.dimensions.map(d => ({
        subject: d.name,
        A: Math.round(d.normalized),
        fullMark: 100,
    }));

    const getLevelStyles = (level: string | null) => {
        switch (level) {
            case 'Consolidado': return 'bg-morado-700 text-white border-morado-700'
            case 'Transición': return 'bg-morado-300 text-morado-900 border-morado-400'
            case 'Incipiente': return 'bg-morado-100 text-morado-600 border-morado-200'
            default: return 'bg-morado-50 text-[#5a5566] border-morado-200'
        }
    }

    const getDimLevelLabel = (percentage: number) => {
        if (percentage <= 33.33) return { label: 'Básico', color: 'text-morado-600 bg-morado-100' }
        if (percentage <= 66.66) return { label: 'Intermedio', color: 'text-morado-900 bg-morado-300' }
        return { label: 'Avanzado', color: 'text-white bg-morado-700' }
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
        <div className="min-h-screen bg-morado-50 p-4 md:p-8">
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
                        <h1 className="text-3xl font-bold text-morado-700 tracking-tight flex items-center gap-3">
                            <Building2 className="w-8 h-8 text-morado-700" />
                            {assessment.company.name}
                        </h1>
                        <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-[#6b6480]">
                            {assessment.company.contactName && (
                                <span className="flex items-center gap-1"><User className="w-4 h-4" /> {assessment.company.contactName}</span>
                            )}
                            {assessment.company.phone && (
                                <span className="flex items-center gap-1"><Phone className="w-4 h-4" /> {assessment.company.phone}</span>
                            )}
                            {assessment.company.sector && (
                                <span className="flex items-center gap-1"><Briefcase className="w-4 h-4" /> {assessment.company.sector}</span>
                            )}
                            {(assessment.company.city || assessment.company.province) && (
                                <span className="flex items-center gap-1">
                                    <MapPin className="w-4 h-4" />
                                    {[assessment.company.city, assessment.company.province].filter(Boolean).join(', ')}
                                </span>
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
                        date={new Date(assessment.createdAt).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
                        dmi={result.dmi}
                        level={result.level}
                        totalRawScore={result.totalRawScore}
                        maxRawScore={maxTotalScore}
                        city={assessment.company.city}
                        province={assessment.company.province}
                        dimensions={result.dimensions}
                        priorities={result.priorities}
                        reportCode={reportCode(assessment.id, assessment.createdAt)}
                        verifyUrl={reportUrlCorta(assessment.id)}
                        verifyHref={reportUrl(assessment.id)}
                    />
                </div>

                {/* Tarjetas de resumen rápido */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="border-morado-200">
                        <CardContent className="pt-6 text-center">
                            <p className="text-sm font-medium text-[#6b6480] uppercase tracking-wide mb-1">Puntaje Bruto</p>
                            <p className="text-4xl font-black text-morado-700">{assessment.totalScore}<span className="text-lg text-[#6b6480] font-medium">/{maxTotalScore}</span></p>
                        </CardContent>
                    </Card>

                    <Card className="border-morado-200">
                        <CardContent className="pt-6 text-center">
                            <p className="text-sm font-medium text-[#6b6480] uppercase tracking-wide mb-1">Índice de Madurez (DMI)</p>
                            <p className="text-4xl font-black text-morado-700">{result.dmi.toFixed(1)}<span className="text-lg text-[#6b6480] font-medium">%</span></p>
                        </CardContent>
                    </Card>

                    <Card className="border-morado-200">
                        <CardContent className="pt-6 text-center">
                            <p className="text-sm font-medium text-[#6b6480] uppercase tracking-wide mb-1">Nivel de Madurez</p>
                            <div className="mt-1">
                                <span className={`inline-flex px-4 py-2 rounded-full text-lg font-bold border ${getLevelStyles(result.level)}`}>
                                    <Award className="w-5 h-5 mr-2" />
                                    {result.level}
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Gráfico Radar + Desglose por dimensión */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                    {/* Radar */}
                    <Card className="lg:col-span-5 border-morado-200">
                        <CardHeader>
                            <CardTitle className="text-lg text-morado-700 flex items-center gap-2">
                                <FileBarChart className="w-5 h-5 text-morado-700" />
                                Mapa de Capacidades
                            </CardTitle>
                            <CardDescription>Visualización radial normalizada (0-100%)</CardDescription>
                        </CardHeader>
                        <CardContent className="min-h-[400px] flex items-center justify-center bg-[radial-gradient(90%_90%_at_50%_30%,#3c235f_0%,#241348_55%,#14082a_100%)] rounded-xl mx-4 mb-4">
                            <MaturityChart data={chartData} />
                        </CardContent>
                    </Card>

                    {/* Tabla de dimensiones */}
                    <Card className="lg:col-span-7 border-morado-200">
                        <CardHeader>
                            <CardTitle className="text-lg text-morado-700">Desglose por Dimensión</CardTitle>
                            <CardDescription>Puntaje bruto, porcentaje normalizado y nivel individual</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {dimensionOrder.map((dimName) => {
                                    const data = dimensionData[dimName]
                                    if (!data) return null
                                    const maxScore = data.questionCount * 2
                                    const pct = maxScore > 0 ? Math.round((data.score / maxScore) * 100) : 0
                                    const dimLevel = getDimLevelLabel(pct)

                                    return (
                                        <div key={dimName} className="p-4 rounded-xl border border-morado-100 bg-white hover:border-morado-300 transition-colors">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                                                <h4 className="font-semibold text-morado-700 text-sm">{dimName}</h4>
                                                <div className="flex items-center gap-2">
                                                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${dimLevel.color}`}>{dimLevel.label}</span>
                                                </div>
                                            </div>
                                            {/* Barra de progreso */}
                                            <div className="flex items-center gap-3">
                                                <div className="flex-1 h-3 bg-morado-100 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full transition-all duration-500 ${pct <= 33.33 ? 'bg-morado-300' : pct <= 66.66 ? 'bg-morado-500' : 'bg-morado-700'}`}
                                                        style={{ width: `${pct}%` }}
                                                    />
                                                </div>
                                                <span className="text-sm font-bold text-[#3a3547] min-w-[60px] text-right">{data.score}/{maxScore} ({pct}%)</span>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Detalle de respuestas por dimensión */}
                <Card className="border-morado-200">
                    <CardHeader>
                        <CardTitle className="text-lg text-morado-700">Respuestas Individuales</CardTitle>
                        <CardDescription>Detalle pregunta por pregunta de lo que respondió el emprendedor</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {dimensionOrder.map((dimName) => {
                                const data = dimensionData[dimName]
                                if (!data) return null

                                return (
                                    <div key={dimName}>
                                        <h3 className="font-bold text-[#3a3547] text-sm uppercase tracking-wide mb-3 border-b border-morado-100 pb-2">
                                            {dimName}
                                        </h3>
                                        <div className="space-y-3">
                                            {data.answers.map((ans, idx) => (
                                                <div key={idx} className="flex flex-col sm:flex-row gap-2 p-3 rounded-lg bg-morado-50/80 border border-morado-100">
                                                    <div className="flex-1">
                                                        <p className="text-sm font-medium text-[#3a3547]">{ans.question}</p>
                                                        <p className="text-sm text-[#6b6480] mt-1">→ {ans.answer}</p>
                                                    </div>
                                                    <div className="flex items-center">
                                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${ans.weight === 0 ? 'bg-naranja-100 text-naranja-700' :
                                                                ans.weight === 1 ? 'bg-morado-100 text-morado-600' :
                                                                    'bg-morado-700 text-white'
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
