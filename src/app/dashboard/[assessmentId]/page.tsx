import { notFound } from 'next/navigation'
import prisma from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { MaturityChart } from '@/components/charts/MaturityChart'
import { DownloadReportButton } from '@/components/pdf/DownloadReportButton'
import { EnlacePermanente } from '@/components/EnlacePermanente'
import { computeAssessmentResult } from '@/lib/scoring'
import { reportCode, reportUrl, reportUrlCorta } from '@/lib/reporte'
import { Medal, Building2, Calendar, FileText, ArrowRight } from 'lucide-react'

// Resultado individual con datos en vivo: se renderiza en cada petición.
export const dynamic = 'force-dynamic'

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

    // Calcular el resultado con el modelo v3.0 (indicador compuesto OCDE/JRC)
    const result = computeAssessmentResult(
        assessment.answers.map(a => ({
            dimension: a.question.dimension.name,
            weight: a.option.weight,
            questionText: a.question.text,
            optionText: a.option.text,
        }))
    )

    // Identidad recuperable del reporte: el emprendedor se lleva un codigo y una
    // direccion, no solo un archivo descargado.
    const codigo = reportCode(assessment.id, assessment.createdAt)
    const enlace = reportUrl(assessment.id)
    const enlaceCorto = reportUrlCorta(assessment.id)

    // Puntaje bruto máximo (21 ítems × 2 puntos)
    const maxTotalScore = assessment.answers.length * 2;

    // Datos para el radar web: dimensiones normalizadas 0-100%
    const chartData = result.dimensions.map(d => ({
        subject: d.name,
        A: Math.round(d.normalized),
        fullMark: 100,
    }));

    // Define colores según el nivel de madurez para el Badge pero en Dark Theme
    const getLevelBadgeStyles = (level: string | null) => {
        switch (level) {
            case 'Consolidado': return 'bg-morado-300 text-morado-900 border-morado-200 shadow-[0_0_18px_rgba(185,166,217,0.28)]'
            case 'Transición': return 'bg-morado-500/25 text-morado-100 border-morado-400/50 shadow-[0_0_15px_rgba(133,112,184,0.2)]'
            case 'Incipiente': return 'bg-morado-800/60 text-morado-200 border-morado-500/40'
            default: return 'bg-morado-850 text-morado-200 border-white/10'
        }
    }

    return (
        <div className="min-h-screen bg-morado-950 flex flex-col items-center p-4 sm:p-8 font-sans relative overflow-hidden selection:bg-naranja-500/30 selection:text-naranja-100">

            {/* Fondo de marca y resplandores: morado dominante, naranja de acento. */}
            <div className="absolute inset-0 bg-[radial-gradient(110%_75%_at_50%_0%,#3c235f_0%,#241348_45%,#14082a_82%)] pointer-events-none" />
            <div className="absolute top-[-10%] left-[-10%] w-[520px] h-[520px] bg-morado-500/28 rounded-full blur-[150px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-naranja-500/10 rounded-full blur-[150px] pointer-events-none" />

            {/* NavBar simulada Brand */}
            <div className="w-full max-w-5xl mb-6 relative z-10">
                <Link href="/" className="inline-flex items-center space-x-3 cursor-pointer group">
                    <img src="/uti-oscuro-con-nombre.png" alt="Universidad Indoamérica" className="h-9 w-auto object-contain group-hover:scale-105 transition-transform" />
                </Link>
            </div>

            {/* Cabecera Premium Dark */}
            <div className="w-full max-w-5xl mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
                <div>
                    <div className="inline-flex items-center px-3 py-1 mb-4 rounded-full border border-naranja-500/40 bg-naranja-500/10 text-naranja-300 text-sm font-medium tracking-wide">
                        <span className="w-2 h-2 rounded-full bg-naranja-500 mr-2 animate-pulse" />
                        Diagnóstico Completado
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight flex items-center gap-3">
                        <Medal className="w-10 h-10 text-naranja-400 drop-shadow-[0_0_15px_rgba(234,96,10,0.5)]" />
                        Resultados Globales
                    </h1>
                    <p className="mt-4 text-morado-200/80 text-lg md:text-xl max-w-2xl font-light leading-relaxed">
                        Análisis dimensional de la madurez tecnológica y operativa calculada para su modelo de negocio.
                    </p>
                </div>

                <div className="flex items-center gap-2 bg-morado-850/80 backdrop-blur-md px-4 py-2 border border-white/10 rounded-full shadow-sm text-sm font-medium text-morado-100">
                    <Calendar className="w-4 h-4 text-naranja-400" />
                    {new Date(assessment.createdAt).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
            </div>

            <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">

                {/* Columna Izquierda: Tarjeta de Puntaje Total y Datos (Glassmorphism) */}
                <div className="lg:col-span-4 flex flex-col gap-6">
                    <Card className="bg-morado-850/60 backdrop-blur-2xl border-white/10 shadow-2xl shadow-morado-950/50 overflow-hidden rounded-[2rem]">
                        {/* Filo de marca: morado -> naranja. */}
                        <div className="h-2 -mt-6 bg-gradient-to-r from-morado-500 via-morado-400 to-naranja-500" />

                        <CardContent className="pt-8 pb-8 flex flex-col items-center">

                            <div className="w-16 h-16 bg-naranja-500/12 text-naranja-300 rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(234,96,10,0.18)] ring-1 ring-naranja-500/35">
                                <Building2 className="w-8 h-8" />
                            </div>

                            <CardTitle className="text-2xl font-bold text-white text-center mb-2">{assessment.company.name}</CardTitle>
                            <CardDescription className="text-center text-morado-200/75 mb-10">{assessment.company.sector || 'Perfil Empresarial'}</CardDescription>

                            {/* Círculo Principal de Resultado Radial (Premium Dark Vibe) */}
                            <div className="relative flex flex-col items-center justify-center p-6 bg-morado-950 rounded-full w-52 h-52 border border-white/10 shadow-[inset_0_2px_20px_rgba(0,0,0,0.5),0_0_30px_rgba(234,96,10,0.12)] mb-10">
                                {/* Anillo de progreso decorativo: arranca en naranja. */}
                                <div className="absolute inset-[-4px] rounded-full border border-morado-400/25 border-t-naranja-500/70" />

                                <span className="text-xs font-bold text-naranja-400 uppercase tracking-widest mb-1 drop-shadow-[0_0_8px_rgba(234,96,10,0.7)]">Índice de Madurez</span>
                                <div className="flex items-baseline mt-1">
                                    <span className="text-6xl font-black tracking-tighter text-white drop-shadow-md">
                                        {result.dmi.toFixed(1)}
                                    </span>
                                    <span className="text-xl font-bold text-morado-300/70 ml-1">%</span>
                                </div>
                                <span className="text-[11px] font-medium text-morado-300/70 mt-1">Puntaje bruto {assessment.totalScore}/{maxTotalScore}</span>
                            </div>

                            <div className="text-center space-y-3 w-full px-4">
                                <p className="text-sm font-medium text-morado-300/75 uppercase tracking-widest">Diagnóstico Cualitativo</p>
                                <div className={`inline-flex items-center justify-center w-full py-4 px-4 rounded-2xl border font-bold text-lg tracking-wide ${getLevelBadgeStyles(result.level)}`}>
                                    {result.level}
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
                            date={new Date(assessment.createdAt).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
                            dmi={result.dmi}
                            level={result.level}
                            totalRawScore={result.totalRawScore}
                            maxRawScore={maxTotalScore}
                            city={assessment.company.city}
                            province={assessment.company.province}
                            dimensions={result.dimensions}
                            priorities={result.priorities}
                            reportCode={codigo}
                            verifyUrl={enlaceCorto}
                            verifyHref={enlace}
                        />

                        <EnlacePermanente url={enlace} codigo={codigo} />

                        <Link href="/" passHref className="w-full">
                            <Button variant="outline" size="lg" className="w-full bg-morado-850/50 hover:bg-morado-850 border-white/10 hover:border-naranja-500/40 text-morado-100 hover:text-white h-14 rounded-2xl font-semibold backdrop-blur-md transition-all group">
                                Volver al Inicio
                                <ArrowRight className="w-4 h-4 ml-2 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Columna Derecha: Gráfica Hexagonal Dimensional Dark */}
                <div className="lg:col-span-8 flex flex-col">
                    <Card className="bg-morado-850/60 backdrop-blur-2xl border-white/10 shadow-2xl shadow-morado-950/50 rounded-[2rem] h-full flex flex-col overflow-hidden relative">
                        {/* Background pattern subtil tecnológico (puntos en gris muy oscuro) */}
                        <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#5e4590 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

                        <CardHeader className="border-b border-white/10 bg-morado-950/30 z-10 px-8 py-8">
                            <CardTitle className="flex items-center gap-3 text-white text-2xl font-bold tracking-tight">
                                <FileText className="w-6 h-6 text-naranja-400" />
                                Mapa de Capacidades Digitales
                            </CardTitle>
                            <CardDescription className="text-morado-200/75 mt-2 text-base">
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

            {/* Pie: solo la identidad de la Universidad. */}
            <div className="mt-16 flex flex-col items-center max-w-2xl mx-auto relative z-10 pb-8">
                <img src="/uti-oscuro-con-nombre.png" alt="Universidad Indoamérica" className="h-8 w-auto opacity-70" />
            </div>
        </div>
    )
}
