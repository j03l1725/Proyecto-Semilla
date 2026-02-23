'use client'

import { Bar, BarChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Cell } from 'recharts'

interface DimensionAvgData {
    name: string;
    score: number;
    color: string;
}

interface DimensionAvgChartProps {
    data: DimensionAvgData[];
}

export function DimensionAvgChart({ data }: DimensionAvgChartProps) {
    if (!data || data.length === 0) return <div className="text-center p-4 text-slate-500">No hay datos suficientes para calcular promedios.</div>

    return (
        <div className="w-full h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                    <XAxis
                        type="number"
                        domain={[0, 6]} // Siempre sobre 6 porque cada dimension vale 6 (3 pregs x 2 pts max) 
                        tick={{ fill: "#64748b", fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                    />
                    <YAxis
                        dataKey="name"
                        type="category"
                        tick={{ fill: "#475569", fontSize: 11, fontWeight: 600 }}
                        width={140}
                        axisLine={false}
                        tickLine={false}
                    />
                    <Tooltip
                        cursor={{ fill: '#f1f5f9' }}
                        contentStyle={{
                            borderRadius: '8px',
                            border: '1px solid #e2e8f0',
                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                            padding: '8px 12px',
                            fontSize: '14px',
                            fontWeight: 600
                        }}
                        formatter={(value: any) => [`${Number(value).toFixed(1)} Pts`, 'Promedio']}
                    />
                    <Bar dataKey="score" radius={[0, 4, 4, 0]} barSize={20}>
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    )
}
