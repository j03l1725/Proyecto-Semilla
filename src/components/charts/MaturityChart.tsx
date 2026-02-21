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

export function MaturityChart({ data }: MaturityChartProps) {
    if (!data || data.length === 0) return <div className="text-center p-4 text-muted-foreground">Faltan datos para la gráfica.</div>

    return (
        <div className="w-full h-[350px] sm:h-[400px] mt-8 bg-white border border-slate-100 rounded-xl shadow-sm p-4">
            <h3 className="text-center text-lg font-semibold text-slate-800 mb-4">Desempeño por Dimensión</h3>
            <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" className="text-xs sm:text-sm font-medium fill-slate-700" />
                    <PolarRadiusAxis angle={30} domain={[0, 30]} tick={false} />

                    <Radar
                        name="Puntaje"
                        dataKey="A"
                        stroke="#2563eb"
                        fill="#3b82f6"
                        fillOpacity={0.6}
                    />
                    <Tooltip
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                    />
                </RadarChart>
            </ResponsiveContainer>
        </div>
    )
}
