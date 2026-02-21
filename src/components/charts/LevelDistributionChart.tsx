'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'

interface LevelData {
    name: string;
    value: number;
}

interface LevelDistributionChartProps {
    data: LevelData[];
}

const COLORS = ['#ef4444', '#f59e0b', '#22c55e'] // Rojo (Incipiente), Ámbar (Transición), Verde (Consolidado)

export function LevelDistributionChart({ data }: LevelDistributionChartProps) {
    // Filter out any zero value items so they don't render on the pie
    const validData = data.filter(item => item.value > 0)

    if (validData.length === 0) {
        return <div className="h-[300px] flex items-center justify-center text-slate-500 bg-slate-50 rounded-md">No hay datos suficientes para graficar.</div>
    }

    return (
        <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={validData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent = 0 }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                    >
                        {validData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                    />
                    <Legend verticalAlign="bottom" height={36} />
                </PieChart>
            </ResponsiveContainer>
        </div>
    )
}
