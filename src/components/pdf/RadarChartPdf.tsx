import React from 'react'
import { Svg, Polygon, Line, Circle, Text, G } from '@react-pdf/renderer'
import { C } from './estilos'

/**
 * Perfil radial de las 6 dimensiones, dibujado con primitivas SVG nativas de
 * @react-pdf. Recharts no se puede renderizar dentro de un PDF.
 *
 * Es una serie única, así que no lleva leyenda: cada eje se rotula directamente
 * con su nombre y su valor, de modo que el gráfico se lee sin depender del
 * color. Las etiquetas se anclan según el cuadrante para que no se pisen entre
 * sí ni invadan el polígono, que era el defecto de la versión anterior.
 */

interface RadarDatum {
    name: string
    normalized: number
}

const CORTAS: Record<string, string> = {
    'Tecnologías y habilidades digitales': 'Tecnologías',
    'Comunicaciones y canales de venta': 'Comunicaciones',
    'Organización y personas': 'Organización',
    'Estrategia y transformación digital': 'Estrategia',
    'Datos y analítica': 'Datos',
    'Procesos': 'Procesos',
}

export function RadarChartPdf({ data }: { data: RadarDatum[] }) {
    const width = 430
    const height = 258
    const cx = width / 2
    const cy = height / 2 + 2
    const R = 88
    const n = data.length || 6

    const angulo = (i: number) => ((-90 + (360 / n) * i) * Math.PI) / 180
    const punto = (i: number, radio: number) => ({
        x: cx + radio * Math.cos(angulo(i)),
        y: cy + radio * Math.sin(angulo(i)),
    })
    const poligono = (radioDe: (i: number) => number) =>
        data
            .map((_, i) => {
                const p = punto(i, radioDe(i))
                return `${p.x.toFixed(2)},${p.y.toFixed(2)}`
            })
            .join(' ')

    return (
        <Svg width={width} height={height}>
            {/* Malla concéntrica al 25 / 50 / 75 / 100 % */}
            {[25, 50, 75, 100].map((r) => (
                <Polygon
                    key={r}
                    points={poligono(() => (R * r) / 100)}
                    fill="none"
                    stroke={r === 100 ? C.linea : C.lineaSuave}
                    strokeWidth={r === 100 ? 0.9 : 0.6}
                />
            ))}

            {/* Un radio por dimensión */}
            {data.map((_, i) => {
                const p = punto(i, R)
                return (
                    <Line key={`eje-${i}`} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke={C.lineaSuave} strokeWidth={0.6} />
                )
            })}

            {/* Perfil del emprendimiento */}
            <Polygon
                points={poligono((i) => (R * data[i].normalized) / 100)}
                fill={C.moradoMedio}
                fillOpacity={0.28}
                stroke={C.morado}
                strokeWidth={1.4}
            />

            {/* Vértices, con anillo blanco para que no se fundan con la malla */}
            {data.map((d, i) => {
                const p = punto(i, (R * d.normalized) / 100)
                return (
                    <G key={`v-${i}`}>
                        <Circle cx={p.x} cy={p.y} r={3.4} fill={C.blanco} />
                        <Circle cx={p.x} cy={p.y} r={2.2} fill={C.morado} />
                    </G>
                )
            })}

            {/* Rótulo directo de cada eje: nombre arriba, valor debajo */}
            {data.map((d, i) => {
                const p = punto(i, R + 15)
                const ancla = p.x > cx + 6 ? 'start' : p.x < cx - 6 ? 'end' : 'middle'
                // El vértice inferior necesita bajar un poco más para no rozar la malla.
                const dy = p.y > cy + R ? 6 : 0
                return (
                    <G key={`rot-${i}`}>
                        <Text
                            x={p.x}
                            y={p.y + dy}
                            textAnchor={ancla}
                            fill={C.secundario}
                            style={{ fontSize: 7.5, fontFamily: 'Helvetica' }}
                        >
                            {CORTAS[d.name] ?? d.name}
                        </Text>
                        <Text
                            x={p.x}
                            y={p.y + dy + 9.5}
                            textAnchor={ancla}
                            fill={C.morado}
                            style={{ fontSize: 8.5, fontFamily: 'Helvetica-Bold' }}
                        >
                            {`${Math.round(d.normalized)}%`}
                        </Text>
                    </G>
                )
            })}
        </Svg>
    )
}
