'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'

/**
 * Reparto de la muestra por nivel de madurez.
 *
 * Dos correcciones respecto de la versión anterior:
 *
 * ▸ **El color sigue al nivel, no a su posición en el arreglo.** Antes se
 *   asignaba por índice, así que una muestra en la que solo aparece «Transición»
 *   la pintaba de rojo —el color del primer elemento— y el panel decía lo
 *   contrario de lo que pasaba.
 *
 * ▸ **La rampa es secuencial, de un solo tono.** Los niveles son una escala
 *   ordinal, no categorías independientes: van de claro a oscuro conforme sube
 *   la madurez. El semáforo rojo/ámbar/verde sugería «malo/bueno» donde lo que
 *   hay es una etapa.
 *
 * La animación de entrada está desactivada a propósito: dejaba el gráfico en
 * cero durante segundo y medio y aparecía vacío en capturas e impresiones.
 *
 * ▲ No poner `fill` en el `style` del `<Pie>`. Recharts lo aplica a la figura y
 * pisa el `fill` de cada `<Cell>`, con lo que el anillo entero sale de un solo
 * color y la codificación por nivel se pierde sin ningún error visible.
 */

interface LevelData {
    name: string
    value: number
}

const COLOR_NIVEL: Record<string, string> = {
    Incipiente: '#EDE7F5',
    'Transición': '#B9A6D9',
    Consolidado: '#3C2660',
}

const BORDE_NIVEL: Record<string, string> = {
    Incipiente: '#C9B9E0',
    'Transición': '#8F76BE',
    Consolidado: '#3C2660',
}

export function LevelDistributionChart({ data }: { data: LevelData[] }) {
    const validos = data.filter((d) => d.value > 0)
    const total = validos.reduce((a, d) => a + d.value, 0)

    if (validos.length === 0) {
        return (
            <div className="h-[260px] flex items-center justify-center text-sm text-[#6b6480] bg-morado-50 rounded-md">
                Sin evaluaciones todavía.
            </div>
        )
    }

    return (
        <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={validos}
                        cx="50%"
                        cy="50%"
                        innerRadius={52}
                        outerRadius={92}
                        paddingAngle={2}
                        dataKey="value"
                        isAnimationActive={false}
                    >
                        {validos.map((d) => (
                            <Cell
                                key={d.name}
                                fill={COLOR_NIVEL[d.name] ?? '#B9A6D9'}
                                stroke={BORDE_NIVEL[d.name] ?? '#8F76BE'}
                                strokeWidth={1}
                            />
                        ))}
                    </Pie>
                    <text
                        x="50%"
                        y="47%"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        style={{ fontSize: 26, fontWeight: 700, fill: '#3C2660' }}
                    >
                        {total}
                    </text>
                    <text
                        x="50%"
                        y="60%"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        style={{ fontSize: 10, fill: '#6b6480' }}
                    >
                        {total === 1 ? 'evaluación' : 'evaluaciones'}
                    </text>
                    <Tooltip
                        formatter={(v, n) => [`${Number(v ?? 0)} de ${total}`, String(n ?? '')]}
                        contentStyle={{
                            borderRadius: 8,
                            border: '1px solid #DEDAE6',
                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.08)',
                            fontSize: 13,
                        }}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    )
}
