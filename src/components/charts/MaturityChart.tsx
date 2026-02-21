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
    if (!data || data.length === 0) return <div className="text-center p-4 text-slate-400">Faltan datos para la gráfica.</div>

    return (
        <div className="w-full h-[400px] sm:h-[500px] bg-transparent relative overflow-hidden group flex flex-col items-center justify-center">
            {/* Ambient Glow detrás de la gráfica en tonos esmeralda oscuros */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none group-hover:bg-emerald-500/20 transition-all duration-1000" />

            <div className="relative z-10 w-full h-full pb-0 md:pb-4">
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="62%" data={data}>

                        {/* Define SVG gradient for the radar fill en Dark Theme Neon */}
                        <defs>
                            <linearGradient id="neonGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#34d399" stopOpacity={0.8} /> {/* emerald-400 */}
                                <stop offset="100%" stopColor="#059669" stopOpacity={0.3} /> {/* emerald-600 */}
                            </linearGradient>

                            {/* Filtro DropShadow para dar un resplandor (bloom) al SVG polygon de Rechart */}
                            <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
                                <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="#10b981" floodOpacity="0.4" />
                            </filter>
                        </defs>

                        {/* Malla Polar optimizada para fondo negro: oscura y punteada */}
                        <PolarGrid stroke="#1e293b" strokeDasharray="3 4" />

                        {/* Categorías (Dimensiones) con un text color que se lea sobre oscuro */}
                        <PolarAngleAxis
                            dataKey="subject"
                            className="text-[10px] sm:text-[11px] font-bold fill-slate-300 uppercase tracking-widest"
                            tick={{ fill: "#cbd5e1" }}
                        />

                        {/* Los aros numéricos o ejes del radio (0 a 6) */}
                        <PolarRadiusAxis
                            angle={30}
                            domain={[0, 6]}
                            tick={{ fill: "#64748b", fontSize: 10, fontWeight: 600 }}
                            axisLine={false}
                            tickCount={7}
                        />

                        {/* Forma Hexagonal Principal del puntaje de la compañía */}
                        <Radar
                            name="Puntaje Obtenido"
                            dataKey="A"
                            stroke="#10b981" // emarald-500 core line
                            strokeWidth={3}
                            fill="url(#neonGradient)"
                            fillOpacity={1}
                            style={{ filter: 'url(#neonGlow)' }}
                        />

                        <Tooltip
                            cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }} // cursor overlay opacity si pasas mouse
                            contentStyle={{
                                backgroundColor: 'rgba(10, 15, 13, 0.95)', // Muy oscuro 0a0f0d
                                borderRadius: '12px',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 0 15px rgba(52, 211, 153, 0.1)',
                                padding: '12px 16px',
                                color: '#f8fafc' // slate-50
                            }}
                            itemStyle={{ color: '#34d399', fontWeight: 800, fontSize: '1.1rem' }}
                            labelStyle={{ color: '#94a3b8', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}
                        />
                    </RadarChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}
