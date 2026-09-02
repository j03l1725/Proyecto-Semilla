import React from 'react'
import { Svg, Line } from '@react-pdf/renderer'
import { C } from './estilos'

/**
 * Barras diagonales — el elemento gráfico de INSIDEEBB, en registro discreto.
 *
 * Es el mismo motivo de las portadas de la casa, pero aquí no manda: el
 * documento es de la Universidad Indoamérica y la marca del desarrollador
 * aparece como firma de esquina, no como identidad. Por eso va en el morado
 * institucional de Indoamérica y no en el violeta de INSIDEEBB —el color de un
 * proveedor no se apropia del documento de su cliente—, y por eso sustituye a
 * la marca de agua diagonal grande, que competía con el texto.
 *
 * ▲ Cada barra es un trazo grueso con extremo redondo, no un `<Rect rx>`:
 * @react-pdf **ignora `rx`/`ry`** y devuelve esquinas cuadradas sin avisar, que
 * es lo contrario del motivo.
 */

/** Extremos de cada barra y su opacidad relativa, en cascada. */
const BARRAS = [
    { x1: 24, y1: 92, x2: 46, y2: 56, o: 1 },
    { x1: 52, y1: 74, x2: 74, y2: 38, o: 0.62 },
    { x1: 80, y1: 60, x2: 96, y2: 34, o: 0.34 },
]

export function Ornamento({ opacidad = 0.2, tamano = 92 }: { opacidad?: number; tamano?: number }) {
    return (
        <Svg width={tamano} height={tamano} viewBox="0 0 110 110">
            {BARRAS.map((b, i) => (
                <Line
                    key={i}
                    x1={b.x1}
                    y1={b.y1}
                    x2={b.x2}
                    y2={b.y2}
                    stroke={C.morado}
                    strokeOpacity={opacidad * b.o}
                    strokeWidth={15}
                    strokeLinecap="round"
                />
            ))}
        </Svg>
    )
}
