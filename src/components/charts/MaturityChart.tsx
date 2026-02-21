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
        <div className="w-full h-[400px] sm:h-[480px] bg-white border border-slate-100 rounded-3xl shadow-sm p-4 relative overflow-hidden group">
            {/* Ambient Background Glow Effect Optional */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-blue-50 rounded-full blur-3xl opacity-50 pointer-events-none group-hover:bg-blue-100 transition-colors duration-1000" />

            <h3 className="text-center text-xl font-bold text-slate-800 mb-6 tracking-tight relative z-10">Desempeño Dimensional</h3>
            <div className="relative z-10 w-full h-full pb-8">
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="65%" data={data}>

                        {/* Define SVG gradient for the radar fill */}
                        <defs>
                            <linearGradient id="cyberGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.8} />
                                <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.4} />
                            </linearGradient>
                        </defs>

                        {/* Finer polar grid with dashed pattern for tech feel */}
                        <PolarGrid stroke="#e2e8f0" strokeDasharray="3 3" />

                        <PolarAngleAxis
                            dataKey="subject"
                            className="text-[10px] sm:text-[12px] font-bold fill-slate-500 uppercase tracking-widest"
                            tick={{ fill: "#64748b" }}
                        />

                        {/* Domain set to Sprint 6 Matrix max per dimension: 2 points * 3 questions = 6 points max */}
                        <PolarRadiusAxis angle={30} domain={[0, 6]} tick={{ fill: "#cbd5e1", fontSize: 10 }} axisLine={false} />

                        <Radar
                            name="Puntaje"
                            dataKey="A"
                            stroke="#4f46e5"
                            strokeWidth={3}
                            fill="url(#cyberGradient)"
                        />
                        <Tooltip
                            contentStyle={{
                                borderRadius: '12px',
                                border: 'none',
                                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
                                padding: '12px 16px',
                                fontWeight: 600,
                                color: '#1e293b'
                            }}
                            itemStyle={{ color: '#4f46e5', fontWeight: 700 }}
                        />
                    </RadarChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}
