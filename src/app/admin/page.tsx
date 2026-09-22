import prisma from '@/lib/prisma'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { LevelDistributionChart } from '@/components/charts/LevelDistributionChart'
import { DimensionAvgChart } from '@/components/charts/DimensionAvgChart'
import { calcularMetricas, META_MUESTRA, type EvaluacionCruda } from '@/lib/metricas'
import { reportCode } from '@/lib/reporte'
import { logoutAdmin } from '@/app/actions/auth'
import { Download, Target, Sigma, Layers, AlertTriangle } from 'lucide-react'

// Panel con datos en vivo: se renderiza en cada petición, nunca se prerenderiza.
export const dynamic = 'force-dynamic'

const NIVEL_ESTILO: Record<string, string> = {
    Consolidado: 'bg-morado-700 text-white',
    'Transición': 'bg-morado-300 text-morado-900',
    Incipiente: 'bg-morado-100 text-morado-600',
}

function Kpi({
    titulo,
    valor,
    pie,
    icono,
}: {
    titulo: string
    valor: string
    pie: string
    icono: React.ReactNode
}) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-[#5a5566]">{titulo}</CardTitle>
                {icono}
            </CardHeader>
            <CardContent>
                <div className="text-3xl font-bold text-tinta">{valor}</div>
                <p className="text-xs text-[#6b6480] mt-1">{pie}</p>
            </CardContent>
        </Card>
    )
}

export default async function AdminDashboardPage() {
    const registros = await prisma.assessment.findMany({
        include: {
            company: true,
            answers: { include: { option: true, question: { include: { dimension: true } } } },
        },
        orderBy: { createdAt: 'desc' },
    })

    const crudas: EvaluacionCruda[] = registros.map((a) => ({
        id: a.id,
        createdAt: a.createdAt,
        companyId: a.companyId,
        companyName: a.company.name,
        sector: a.company.sector,
        province: a.company.province,
        city: a.company.city,
        respuestas: a.answers.map((r) => ({
            dimension: r.question.dimension.name,
            weight: r.option.weight,
            questionText: r.question.text,
            optionText: r.option.text,
        })),
    }))

    const m = calcularMetricas(crudas)
    const avance = Math.min(100, Math.round((m.n / META_MUESTRA) * 100))
    const faltan = Math.max(0, META_MUESTRA - m.n)

    const distribucion = m.porNivel.map((r) => ({ name: r.clave, value: r.n }))
    const colores = ['#3c235f', '#4e3378', '#5e4590', '#7059a5', '#8570b8', '#9c8bca']
    const dimChart = m.porDimension.map((d, i) => ({
        name: d.nombre,
        score: d.media,
        color: colores[i % colores.length],
    }))

    return (
        <div className="min-h-screen bg-morado-50">
            {/* Franja institucional: el panel es de la Universidad, no un tablero
                genérico, y quien entra debe verlo antes que los números. */}
            <header className="bg-[linear-gradient(100deg,#3c235f_0%,#241348_55%,#2c1852_100%)] px-6 md:px-10 py-6">
                <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-5">
                        <img src="/uti-oscuro-con-nombre.png" alt="Universidad Indoamérica" className="h-9 w-auto" />
                        <div className="h-9 w-px bg-white/20 hidden sm:block" />
                        <div>
                            <h1 className="text-2xl font-bold text-white tracking-tight">Panel de investigación</h1>
                            <p className="text-sm text-morado-200/80">
                                01/2026 · Madurez digital en microemprendimientos
                            </p>
                        </div>
                    </div>
                    <form action={logoutAdmin}>
                        <Button variant="outline" className="bg-transparent border-white/25 text-white hover:bg-naranja-500 hover:text-morado-950 hover:border-naranja-500">
                            Cerrar sesión
                        </Button>
                    </form>
                </div>
            </header>

            <div className="max-w-6xl mx-auto space-y-8 p-6 md:p-10">

                {/* ── Avance de la muestra ─────────────────────────────── */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg text-morado-700 flex items-center gap-2">
                            <Target className="w-5 h-5 text-morado-700" />
                            Objetivo 2 — Aplicación del instrumento
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-end justify-between mb-2">
                            <span className="text-4xl font-bold text-tinta">
                                {m.n}
                                <span className="text-xl text-[#6b6480] font-medium"> / {META_MUESTRA}</span>
                            </span>
                            <span className="text-sm font-semibold text-[#5a5566]">{avance} %</span>
                        </div>
                        <div className="w-full h-3 bg-morado-100 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-morado-700 to-naranja-500 rounded-full transition-all" style={{ width: `${avance}%` }} />
                        </div>
                        <p className="text-xs text-[#6b6480] mt-2">
                            {faltan > 0
                                ? `Faltan ${faltan} emprendimientos para alcanzar la muestra mínima comprometida en el proyecto aprobado.`
                                : 'Muestra mínima alcanzada. Los objetivos 3, 4 y 5 ya se pueden cerrar con estos datos.'}
                            {m.nRepeticiones > 0
                                ? ` Hay ${m.nRepeticiones} evaluación(es) repetida(s) de un mismo emprendimiento; no se cuentan en la muestra, pero se conservan.`
                                : ''}
                        </p>
                    </CardContent>
                </Card>

                {/* ── KPIs ─────────────────────────────────────────────── */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Kpi
                        titulo="DMI promedio"
                        valor={`${m.dmiMedio} %`}
                        pie={`Mediana ${m.dmiMediana} % · desviación ${m.dmiDesviacion}`}
                        icono={<Sigma className="h-4 w-4 text-morado-700" />}
                    />
                    <Kpi
                        titulo="Rango observado"
                        valor={m.n ? `${m.dmiMin}–${m.dmiMax} %` : '—'}
                        pie="Menor y mayor índice de la muestra"
                        icono={<Layers className="h-4 w-4 text-morado-700" />}
                    />
                    <Kpi
                        titulo="Dimensión más débil"
                        valor={m.n ? `${m.porDimension[0].media} %` : '—'}
                        pie={m.n ? m.porDimension[0].nombre : 'Sin datos'}
                        icono={<AlertTriangle className="h-4 w-4 text-naranja-600" />}
                    />
                    <Kpi
                        titulo="Ítem más crítico"
                        valor={m.itemsCriticos.length ? `${m.itemsCriticos[0].pctEnCero} %` : '—'}
                        pie={
                            m.itemsCriticos.length
                                ? `en cero — ${m.itemsCriticos[0].etiqueta}`
                                : 'Sin datos'
                        }
                        icono={<AlertTriangle className="h-4 w-4 text-naranja-600" />}
                    />
                </div>

                {/* ── Objetivo 3: clasificación ────────────────────────── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Card className="lg:col-span-1 flex flex-col">
                        <CardHeader>
                            <CardTitle className="text-lg text-morado-700">Objetivo 3 — Clasificación</CardTitle>
                            <p className="text-xs text-[#6b6480] mt-1">Reparto de la muestra por nivel de madurez.</p>
                        </CardHeader>
                        <CardContent className="flex-1 flex flex-col justify-center items-center">
                            <LevelDistributionChart data={distribucion} />
                            <div className="w-full mt-3 space-y-1">
                                {m.porNivel.map((r) => (
                                    <div key={r.clave} className="flex items-center justify-between text-xs">
                                        <span className={`px-2 py-0.5 rounded font-semibold ${NIVEL_ESTILO[r.clave]}`}>
                                            {r.clave}
                                        </span>
                                        <span className="text-[#5a5566]">
                                            {r.n} · {r.pct} % · DMI {r.dmiMedio} %
                                        </span>
                                    </div>
                                ))}
                            </div>
                            <Link href="/api/export" className="w-full mt-4">
                                <Button size="sm" variant="outline" className="w-full">
                                    <Download className="h-4 w-4 mr-2 text-[#6b6480]" /> Exportar muestra a CSV
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>

                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle className="text-lg text-morado-700">
                                Objetivo 4 — Madurez promedio por dimensión
                            </CardTitle>
                            <p className="text-xs text-[#6b6480] mt-1">
                                Escala normalizada 0-100 %, de la dimensión más rezagada a la más consolidada.
                            </p>
                        </CardHeader>
                        <CardContent>
                            <DimensionAvgChart data={dimChart} />
                            <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1">
                                {m.porDimension.map((d) => (
                                    <div key={d.nombre} className="flex justify-between text-[11px] text-[#5a5566]">
                                        <span className="truncate pr-2">{d.nombre}</span>
                                        <span className="tabular-nums whitespace-nowrap">
                                            {d.media} % ± {d.desviacion}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* ── Ítems críticos ──────────────────────────────────── */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg text-morado-700">Ítems más críticos de la muestra</CardTitle>
                        <p className="text-xs text-[#6b6480] mt-1">
                            Los diez ítems con menor promedio. Es la evidencia directa del objetivo 4 y la base de las
                            recomendaciones del objetivo 5.
                        </p>
                    </CardHeader>
                    <CardContent className="overflow-x-auto">
                        {m.itemsCriticos.length === 0 ? (
                            <p className="text-sm text-[#6b6480] py-6 text-center">
                                Sin datos todavía. Aparecerá en cuanto se registre la primera evaluación.
                            </p>
                        ) : (
                            <Table>
                                <TableHeader className="bg-morado-50">
                                    <TableRow>
                                        <TableHead className="font-semibold text-[#3a3547]">Ítem</TableHead>
                                        <TableHead className="font-semibold text-[#3a3547]">Dimensión</TableHead>
                                        <TableHead className="font-semibold text-[#3a3547] text-right">Media (0-2)</TableHead>
                                        <TableHead className="font-semibold text-[#3a3547] text-right">En cero</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {m.itemsCriticos.slice(0, 10).map((it) => (
                                        <TableRow key={it.codigo}>
                                            <TableCell className="text-morado-700">
                                                <span className="font-mono text-[11px] text-[#6b6480] mr-2">{it.codigo}</span>
                                                {it.etiqueta}
                                            </TableCell>
                                            <TableCell className="text-[#6b6480] text-xs">{it.dimension}</TableCell>
                                            <TableCell className="text-right font-semibold tabular-nums">{it.media}</TableCell>
                                            <TableCell className="text-right text-[#5a5566] tabular-nums">
                                                {it.enCero} ({it.pctEnCero} %)
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>

                {/* ── Segmentación ────────────────────────────────────── */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {[
                        { titulo: 'Por sector', datos: m.porSector },
                        { titulo: 'Por provincia', datos: m.porProvincia },
                    ].map((bloque) => (
                        <Card key={bloque.titulo}>
                            <CardHeader>
                                <CardTitle className="text-lg text-morado-700">{bloque.titulo}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {bloque.datos.length === 0 ? (
                                    <p className="text-sm text-[#6b6480] py-4 text-center">Sin datos todavía.</p>
                                ) : (
                                    <div className="space-y-1.5">
                                        {bloque.datos.slice(0, 8).map((r) => (
                                            <div key={r.clave} className="flex items-center gap-3 text-xs">
                                                <span className="w-40 truncate text-[#3a3547]">{r.clave}</span>
                                                <div className="flex-1 h-2 bg-morado-100 rounded-full overflow-hidden">
                                                    <div className="h-full bg-morado-500 rounded-full" style={{ width: `${r.pct}%` }} />
                                                </div>
                                                <span className="w-28 text-right text-[#6b6480] tabular-nums whitespace-nowrap">
                                                    {r.n} · DMI {r.dmiMedio} %
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* ── Registros ───────────────────────────────────────── */}
                <Card className="overflow-hidden">
                    <CardHeader>
                        <CardTitle className="text-lg text-morado-700">Registros de participantes</CardTitle>
                        <p className="text-xs text-[#6b6480] mt-1">
                            Todas las evaluaciones, incluidas las repeticiones. Las marcadas «superada» no cuentan en la
                            muestra.
                        </p>
                    </CardHeader>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-morado-50">
                                <TableRow>
                                    <TableHead className="font-semibold text-[#3a3547]">Emprendimiento</TableHead>
                                    <TableHead className="font-semibold text-[#3a3547]">Reporte</TableHead>
                                    <TableHead className="font-semibold text-[#3a3547]">Ubicación</TableHead>
                                    <TableHead className="font-semibold text-[#3a3547]">Fecha</TableHead>
                                    <TableHead className="font-semibold text-[#3a3547]">Nivel</TableHead>
                                    <TableHead className="font-semibold text-[#3a3547] text-right">DMI</TableHead>
                                    <TableHead className="font-semibold text-[#3a3547] text-center">Detalle</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {m.todas.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center text-[#6b6480] py-8">
                                            Aún no hay diagnósticos registrados.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    m.todas.map((e) => (
                                        <TableRow key={e.id} className={e.superada ? 'opacity-55' : ''}>
                                            <TableCell className="font-medium text-tinta">
                                                {e.companyName}
                                                {e.superada ? (
                                                    <span className="ml-2 text-[10px] uppercase tracking-wide text-[#6b6480]">
                                                        superada
                                                    </span>
                                                ) : null}
                                                <div className="text-xs text-[#6b6480]">{e.sector || 'Sector no indicado'}</div>
                                            </TableCell>
                                            <TableCell className="font-mono text-[11px] text-[#6b6480]">
                                                {reportCode(e.id, e.createdAt)}
                                            </TableCell>
                                            <TableCell className="text-[#5a5566] text-xs">
                                                {[e.city, e.province].filter(Boolean).join(', ') || '—'}
                                            </TableCell>
                                            <TableCell className="text-[#5a5566] text-xs">
                                                {new Date(e.createdAt).toLocaleDateString('es-EC', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </TableCell>
                                            <TableCell>
                                                <span className={`px-2 py-1 rounded text-xs font-semibold ${NIVEL_ESTILO[e.level]}`}>
                                                    {e.level}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right font-bold text-[#3a3547] tabular-nums">
                                                {e.dmi} %
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Link href={`/admin/${e.id}`}>
                                                    <Button variant="outline" size="sm">
                                                        Ver
                                                    </Button>
                                                </Link>
                                            </TableCell>
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
