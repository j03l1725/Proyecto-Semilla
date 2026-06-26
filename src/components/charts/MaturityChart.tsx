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

/** Etiqueta de dimensión: nombre completo dividido en dos líneas, legible sobre el tema oscuro. */
function AngleTick(props: { payload?: { value?: string }; x?: number; y?: number; textAnchor?: React.SVGProps<SVGTextElement>['textAnchor'] }) {
    const { payload, x = 0, y = 0, textAnchor } = props
    const lines = splitLabel(String(payload?.value ?? ''))
    return (
        <text x={x} y={y} textAnchor={textAnchor} fill="#d8e0db" fontSize={11} fontWeight={600}>
            {lines.map((ln, i) => (
                <tspan key={i} x={x} dy={i === 0 ? (lines.length > 1 ? -3 : 4) : 13}>{ln}</tspan>
            ))}
        </text>
    )
}

export function MaturityChart({ data }: MaturityChartProps) {
    if (!data || data.length === 0) return <div className="text-center p-4 text-slate-400">Faltan datos para la gráfica.</div>

    return (
        <div className="w-full h-[420px] sm:h-[480px] relative flex items-center justify-center">
            {/* Resplandor ambiental esmeralda detrás del hexágono */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] h-[320px] bg-emerald-500/15 rounded-full blur-[80px] pointer-events-none" />

            <div className="relative z-10 w-full h-full">
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart
                        cx="50%" cy="50%" outerRadius="72%" data={data}
                        margin={{ top: 30, right: 64, bottom: 30, left: 64 }}
                    >
                        {/* Malla polar hexagonal */}
                        <PolarGrid stroke="#2c3f36" gridType="polygon" />

                        {/* Dimensiones: nombre completo en dos líneas */}
                        <PolarAngleAxis dataKey="subject" tick={<AngleTick />} />

                        {/* Escala radial 0-100 sin números, para una lectura limpia */}
                        <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} tickCount={5} />

                        {/* Hexágono del puntaje: relleno esmeralda sólido y vértices marcados */}
                        <Radar
                            name="Puntaje"
                            dataKey="A"
                            stroke="#34d399"
                            strokeWidth={2.5}
                            fill="#10b981"
                            fillOpacity={0.45}
                            dot={{ fill: '#6ee7b7', stroke: '#0a0f0d', strokeWidth: 1.5, r: 4 }}
                            isAnimationActive={false}
                        />

                        <Tooltip
                            cursor={{ stroke: '#34d399', strokeOpacity: 0.25 }}
                            contentStyle={{
                                backgroundColor: 'rgba(10, 15, 13, 0.96)',
                                borderRadius: '12px',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                padding: '10px 14px',
                                color: '#f8fafc'
                            }}
                            itemStyle={{ color: '#34d399', fontWeight: 700, fontSize: '1rem' }}
                            labelStyle={{ color: '#94a3b8', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '2px' }}
                            formatter={(value: number | undefined) => [`${value ?? 0}%`, 'Puntaje']}
                        />
                    </RadarChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}
