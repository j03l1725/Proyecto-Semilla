import React from 'react'
import { Svg, Polygon, Line, Circle, Text, G } from '@react-pdf/renderer'

/**
 * Gráfico radar hexagonal dibujado con primitivas SVG nativas de
 * @react-pdf/renderer. Recharts no se puede renderizar dentro de un PDF,
 * por eso el radar se reconstruye aquí a partir de las 6 dimensiones
 * normalizadas (Nᵢ 0-100).
 */

interface RadarDatum {
    name: string
    normalized: number
}

// Etiquetas cortas para que quepan alrededor del hexágono.
const SHORT_LABELS: Record<string, string> = {
    'Tecnologías y habilidades digitales': 'Tecnologías',
    'Comunicaciones y canales de venta': 'Comunicaciones',
    'Organización y personas': 'Organización',
    'Estrategia y transformación digital': 'Estrategia',
    'Datos y analítica': 'Datos',
    'Procesos': 'Procesos',
}

export function RadarChartPdf({ data }: { data: RadarDatum[] }) {
    const width = 420
    const height = 300
    const cx = width / 2
    const cy = height / 2
    const R = 92
    const n = data.length || 6

    // Ángulo de cada eje: arranca arriba (-90°) y avanza en pasos iguales.
    const angle = (i: number) => ((-90 + (360 / n) * i) * Math.PI) / 180
    const point = (i: number, radius: number) => ({
        x: cx + radius * Math.cos(angle(i)),
        y: cy + radius * Math.sin(angle(i)),
    })
    const polyString = (radiusOf: (i: number) => number) =>
        data.map((_, i) => {
            const p = point(i, radiusOf(i))
            return `${p.x.toFixed(2)},${p.y.toFixed(2)}`
        }).join(' ')

    const rings = [25, 50, 75, 100]

    return (
        <Svg width={width} height={height}>
            {/* Mallas hexagonales concéntricas (25/50/75/100 %) */}
            {rings.map((r) => (
                <Polygon
                    key={r}
                    points={polyString(() => (R * r) / 100)}
                    fill="none"
                    stroke="#d8dee8"
                    strokeWidth={0.7}
                />
            ))}

            {/* Radios (uno por dimensión) */}
            {data.map((_, i) => {
                const p = point(i, R)
                return (
                    <Line
                        key={`spoke-${i}`}
                        x1={cx}
                        y1={cy}
                        x2={p.x}
                        y2={p.y}
                        stroke="#d8dee8"
                        strokeWidth={0.7}
                    />
                )
            })}

            {/* Polígono de datos */}
            <Polygon
                points={polyString((i) => (R * data[i].normalized) / 100)}
                fill="#10b981"
                fillOpacity={0.35}
                stroke="#059669"
                strokeWidth={1.5}
            />

            {/* Vértices del polígono de datos */}
            {data.map((d, i) => {
                const p = point(i, (R * d.normalized) / 100)
                return <Circle key={`pt-${i}`} cx={p.x} cy={p.y} r={2.4} fill="#047857" />
            })}

            {/* Etiquetas de dimensión + valor */}
            {data.map((d, i) => {
                const p = point(i, R + 16)
                const anchor = p.x > cx + 5 ? 'start' : p.x < cx - 5 ? 'end' : 'middle'
                return (
                    <G key={`lbl-${i}`}>
                        <Text
                            x={p.x}
                            y={p.y}
                            textAnchor={anchor}
                            fill="#475569"
                            style={{ fontSize: 7.5 }}
                        >
                            {SHORT_LABELS[d.name] ?? d.name}
                        </Text>
                        <Text
                            x={p.x}
                            y={p.y + 9}
                            textAnchor={anchor}
                            fill="#047857"
                            style={{ fontSize: 8.5 }}
                        >
                            {Math.round(d.normalized)}%
                        </Text>
                    </G>
                )
            })}
        </Svg>
    )
}
