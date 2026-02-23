import prisma from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LevelDistributionChart } from '@/components/charts/LevelDistributionChart'
import { DimensionAvgChart } from '@/components/charts/DimensionAvgChart'
import { Users, BarChart3, TrendingUp, ShieldAlert, Download } from 'lucide-react'
import { logoutAdmin } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Link from 'next/link'

export default async function AdminDashboardPage() {
    // 1. Obtención paralela de estadísticas agregadas desde la BD
    const [totalAssessments, incipientes, transicion, consolidados, allAssessments] = await Promise.all([
        prisma.assessment.count(),
        prisma.assessment.count({ where: { level: 'Incipiente' } }),
        prisma.assessment.count({ where: { level: 'Transición' } }),
        prisma.assessment.count({ where: { level: 'Consolidado' } }),
        prisma.assessment.findMany({
            include: {
                company: true,
                answers: {
                    include: {
                        option: true,
                        question: { include: { dimension: true } }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        })
    ])

    const chartData = [
        { name: 'Incipiente', value: incipientes },
        { name: 'Transición', value: transicion },
        { name: 'Consolidado', value: consolidados },
    ]

    // 2. Calcular los promedios globales por cada una de las 6 dimensiones
    const dimensionTotals: Record<string, { sum: number; count: number }> = {};

    allAssessments.forEach(ass => {
        const localScores: Record<string, number> = {};

        // Sumar puntajes de cada dimensión en la evaluación individual
        ass.answers.forEach(ans => {
            const dimName = ans.question.dimension.name;
            if (!localScores[dimName]) localScores[dimName] = 0;
            localScores[dimName] += ans.option.weight;
        });

        // Acumularlos en el mapeo global
        Object.entries(localScores).forEach(([dim, score]) => {
            if (!dimensionTotals[dim]) dimensionTotals[dim] = { sum: 0, count: 0 };
            dimensionTotals[dim].sum += score;
            dimensionTotals[dim].count += 1;
        });
    });

    // Formatear promedios para el Chart (Usamos verde Catalyst #10b981 base)
    const avgChartData = Object.keys(dimensionTotals).map((dim, i) => {
        const avg = dimensionTotals[dim].sum / dimensionTotals[dim].count;
        // Graduar el color verde de Catalyst
        const colors = ['#10b981', '#34d399', '#059669', '#0d9488', '#0f766e', '#14b8a6'];
        return {
            name: dim,
            score: Number(avg.toFixed(2)),
            color: colors[i % colors.length]
        };
    }).sort((a, b) => b.score - a.score); // Del mejor punteado al peor

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-12">
            <div className="max-w-6xl mx-auto space-y-8">

                {/* Header Dashboard */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Panel de Investigación</h1>
                        <p className="text-slate-500">Monitoreo en tiempo real de la muestra recolectada.</p>
                    </div>

                    <form action={logoutAdmin}>
                        <Button variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                            Cerrar Sesión Segura
                        </Button>
                    </form>
                </div>

                {/* Tarjetas KPI */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-slate-600">Total Encuestas</CardTitle>
                            <Users className="h-4 w-4 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-slate-900">{totalAssessments}</div>
                            <p className="text-xs text-slate-500 mt-1">Meta de muestra: 30</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-slate-600">Incipientes</CardTitle>
                            <ShieldAlert className="h-4 w-4 text-red-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-slate-900">{incipientes}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-slate-600">En Transición</CardTitle>
                            <BarChart3 className="h-4 w-4 text-amber-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-slate-900">{transicion}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-slate-600">Consolidados</CardTitle>
                            <TrendingUp className="h-4 w-4 text-emerald-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-slate-900">{consolidados}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Gráficos de Análisis Medio Superior */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Card className="shadow-sm lg:col-span-1 border-slate-100 flex flex-col">
                        <CardHeader>
                            <CardTitle className="text-lg text-slate-800">Distribución Global</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 flex flex-col justify-center items-center -mt-6">
                            <LevelDistributionChart data={chartData} />

                            <div className="w-full mt-2 gap-3 flex flex-col text-center">
                                <Link href="/api/export" passHref className="w-full">
                                    <Button size="sm" variant="outline" className="w-full hover:bg-slate-50">
                                        <Download className="h-4 w-4 mr-2 text-slate-500" /> Exportar a CSV
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="shadow-sm lg:col-span-2 border-slate-100 h-full">
                        <CardHeader>
                            <CardTitle className="text-lg text-slate-800">Desempeño Promedio por Escenario (Max: 6 Pts)</CardTitle>
                            <p className="text-xs text-slate-500 mt-1">Identifica el área estructural de madurez donde las Pymes del grupo fallan más a nivel nacional.</p>
                        </CardHeader>
                        <CardContent>
                            <DimensionAvgChart data={avgChartData} />
                        </CardContent>
                    </Card>
                </div>

                {/* Tabla de Registros Detallados */}
                <Card className="shadow-sm overflow-hidden">
                    <CardHeader>
                        <CardTitle className="text-lg text-slate-800">Registros de Participantes</CardTitle>
                    </CardHeader>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-slate-50">
                                <TableRow>
                                    <TableHead className="font-semibold text-slate-700">Empresa</TableHead>
                                    <TableHead className="font-semibold text-slate-700">Contacto</TableHead>
                                    <TableHead className="font-semibold text-slate-700">Sector</TableHead>
                                    <TableHead className="font-semibold text-slate-700">Evaluación</TableHead>
                                    <TableHead className="font-semibold text-slate-700">Madurez</TableHead>
                                    <TableHead className="font-semibold text-slate-700 text-right">Puntaje</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {allAssessments.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center text-slate-500 py-8">
                                            Aún no hay diagnósticos registrados.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    allAssessments.map((record) => (
                                        <TableRow key={record.id} className="hover:bg-slate-50/50">
                                            <TableCell className="font-medium text-slate-900">{record.company.name}</TableCell>
                                            <TableCell className="text-slate-600">{record.company.contactName || 'N/A'}</TableCell>
                                            <TableCell className="text-slate-600 truncate max-w-[150px]">{record.company.sector || 'N/A'}</TableCell>
                                            <TableCell className="text-slate-600">
                                                {new Date(record.createdAt).toLocaleDateString('es-ES', {
                                                    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                                })}
                                            </TableCell>
                                            <TableCell>
                                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${record.level === 'Consolidado' ? 'bg-green-100 text-green-700' :
                                                    record.level === 'Transición' ? 'bg-amber-100 text-amber-700' :
                                                        'bg-red-100 text-red-700'
                                                    }`}>
                                                    {record.level || 'Pendiente'}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right font-bold text-slate-700">{record.totalScore}</TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </Card>
            </div>

        </div>
    )
}
