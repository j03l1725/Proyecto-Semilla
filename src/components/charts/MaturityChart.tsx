'use client'

import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts'

interface ChartDataPoint {
    subject: string;
    A: number;
    fullMark: number;
}

interface MaturityChartProps {
    data: ChartDataPoint[];
}

/** Divide una etiqueta larga en dos líneas equilibradas por palabras. */
function splitLabel(label: string): string[] {
    const words = label.split(' ')
    if (words.length < 2) return [label]
    let best = 1, bestDiff = Infinity
    for (let i = 1; i < words.length; i++) {
        const a = words.slice(0, i).join(' ').length
        const b = words.slice(i).join(' ').length
        if (Math.abs(a - b) < bestDiff) { bestDiff = Math.abs(a - b); best = i }
    }
    return [words.slice(0, best).join(' '), words.slice(best).join(' ')]
}

/** Etiqueta de dimensión: nombre completo dividido en dos líneas, legible sobre el morado institucional. */
function AngleTick(props: { payload?: { value?: string }; x?: number; y?: number; textAnchor?: React.SVGProps<SVGTextElement>['textAnchor'] }) {
    const { payload, x = 0, y = 0, textAnchor } = props
    const lines = splitLabel(String(payload?.value ?? ''))
    return (
        <text x={x} y={y} textAnchor={textAnchor} fill="#ddd3ec" fontSize={11} fontWeight={600}>
            {lines.map((ln, i) => (
                <tspan key={i} x={x} dy={i === 0 ? (lines.length > 1 ? -3 : 4) : 13}>{ln}</tspan>
            ))}
        </text>
    )
}

export function MaturityChart({ data }: MaturityChartProps) {
    if (!data || data.length === 0) return <div className="text-center p-4 text-morado-300">Faltan datos para la gráfica.</div>

    return (
        <div className="w-full h-[420px] sm:h-[480px] relative flex items-center justify-center">
            {/* Resplandor ambiental detrás del hexágono: morado de base, naranja
                al centro, para que el área pintada no flote sobre un fondo plano. */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] h-[340px] bg-morado-500/25 rounded-full blur-[90px] pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] bg-naranja-500/12 rounded-full blur-[70px] pointer-events-none" />

            <div className="relative z-10 w-full h-full">
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart
                        cx="50%" cy="50%" outerRadius="72%" data={data}
                        margin={{ top: 30, right: 64, bottom: 30, left: 64 }}
                    >
                        {/* Malla polar hexagonal */}
                        <PolarGrid stroke="#4e3378" gridType="polygon" />

                        {/* Dimensiones: nombre completo en dos líneas */}
                        <PolarAngleAxis dataKey="subject" tick={<AngleTick />} />

                        {/* Escala radial 0-100 sin números, para una lectura limpia */}
                        <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} tickCount={5} />

                        {/* Hexágono del puntaje: naranja institucional, el único color
                            saturado de la vista, con los vértices marcados. */}
                        <Radar
                            name="Puntaje"
                            dataKey="A"
                            stroke="#f97d28"
                            strokeWidth={2.5}
                            fill="#ea600a"
                            fillOpacity={0.4}
                            dot={{ fill: '#ffa05c', stroke: '#14082a', strokeWidth: 1.5, r: 4 }}
                            isAnimationActive={false}
                        />

                        <Tooltip
                            cursor={{ stroke: '#f97d28', strokeOpacity: 0.3 }}
                            contentStyle={{
                                backgroundColor: 'rgba(20, 8, 42, 0.96)',
                                borderRadius: '12px',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                padding: '10px 14px',
                                color: '#f6f3fb'
                            }}
                            itemStyle={{ color: '#ffa05c', fontWeight: 700, fontSize: '1rem' }}
                            labelStyle={{ color: '#b9a6d9', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '2px' }}
                            formatter={(value: number | undefined) => [`${value ?? 0}%`, 'Puntaje']}
                        />
                    </RadarChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}
