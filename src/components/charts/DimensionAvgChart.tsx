'use client'

import { Bar, BarChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Cell, LabelList } from 'recharts'

/**
 * Madurez promedio por dimensión, escala normalizada 0-100 %.
 *
 * Serie única: no lleva leyenda —el título la nombra— y cada barra se rotula
 * directamente con su valor, de modo que el gráfico se lee sin depender del
 * color ni del eje. La animación va desactivada: dejaba las barras en cero
 * durante la carga y el panel aparecía vacío en capturas e impresiones.
 */

interface DimensionAvgData {
    name: string
    score: number
    color: string
}

/** Etiquetas cortas: los nombres completos se partían en tres líneas. */
const CORTAS: Record<string, string> = {
    'Tecnologías y habilidades digitales': 'Tecnologías',
    'Comunicaciones y canales de venta': 'Comunicaciones',
    'Organización y personas': 'Organización',
    'Estrategia y transformación digital': 'Estrategia',
    'Datos y analítica': 'Datos',
    'Procesos': 'Procesos',
}

export function DimensionAvgChart({ data }: { data: DimensionAvgData[] }) {
    if (!data || data.length === 0) {
        return (
            <div className="h-[260px] flex items-center justify-center text-sm text-slate-500 bg-slate-50 rounded-md">
                Sin evaluaciones todavía.
            </div>
        )
    }

    const datos = data.map((d) => ({ ...d, corto: CORTAS[d.name] ?? d.name }))

    return (
        <div className="w-full h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={datos} layout="vertical" margin={{ top: 4, right: 44, left: 4, bottom: 4 }}>
                    <CartesianGrid strokeDasharray="2 3" horizontal={false} stroke="#EEEBF3" />
                    <XAxis
                        type="number"
                        domain={[0, 100]}
                        tick={{ fill: '#7A7488', fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(v: number) => `${v}%`}
                    />
                    <YAxis
                        dataKey="corto"
                        type="category"
                        tick={{ fill: '#3A3547', fontSize: 11 }}
                        width={104}
                        axisLine={false}
                        tickLine={false}
                    />
                    <Tooltip
                        cursor={{ fill: '#F7F5FA' }}
                        formatter={(v) => [`${Number(v ?? 0).toFixed(1)} %`, 'Madurez promedio']}
                        labelFormatter={(l) => datos.find((d) => d.corto === l)?.name ?? String(l ?? '')}
                        contentStyle={{
                            borderRadius: 8,
                            border: '1px solid #DEDAE6',
                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.08)',
                            fontSize: 13,
                        }}
                    />
                    <Bar dataKey="score" radius={[0, 3, 3, 0]} barSize={18} isAnimationActive={false}>
                        {datos.map((d) => (
                            <Cell key={d.name} fill={d.color} />
                        ))}
                        <LabelList
                            dataKey="score"
                            position="right"
                            formatter={(v: unknown) => `${Number(v ?? 0).toFixed(0)}%`}
                            style={{ fontSize: 10, fill: '#5A5566', fontWeight: 600 }}
                        />
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    )
}
