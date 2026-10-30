import { LEVEL_THRESHOLDS } from '@/lib/scoring'
import { TONO } from '@/lib/panel'

/**
 * Histograma del DMI en intervalos de 10 puntos. SVG con viewBox: escala con el
 * ancho de la caja sin depender de medidas del navegador, y se imprime tal cual.
 * Los umbrales de nivel llevan línea y rótulo; el recuento va escrito sobre cada barra.
 */
export function Histograma({ datos }: { datos: { desde: number; hasta: number; n: number }[] }) {
    const W = 360, H = 300
    const m = { l: 26, r: 8, t: 34, b: 62 }
    const iw = W - m.l - m.r, ih = H - m.t - m.b
    const maxN = Math.max(4, ...datos.map((d) => d.n))
    const techo = Math.ceil(maxN / 2) * 2
    const x = (v: number) => m.l + (v / 100) * iw
    const y = (n: number) => m.t + ih - (n / techo) * ih
    const ticks = Array.from({ length: techo / 2 + 1 }, (_, i) => i * 2)
    const u1 = LEVEL_THRESHOLDS.incipiente, u2 = LEVEL_THRESHOLDS.transicion
    const descripcion = `Histograma del DMI. ${datos.filter((d) => d.n > 0).map((d) => `${d.desde} a ${d.hasta}: ${d.n}`).join('; ')}.`

    return (
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={descripcion} className="w-full h-auto min-h-[220px]">
            {ticks.map((t) => (
                <g key={t}>
                    <line x1={m.l} x2={W - m.r} y1={y(t)} y2={y(t)} stroke={TONO.rejilla} strokeWidth={1} />
                    <text x={m.l - 6} y={y(t) + 4} textAnchor="end" fontSize={11} fill={TONO.apagado}>{t}</text>
                </g>
            ))}
            {datos.map((d) => {
                const h = (d.n / techo) * ih
                return (
                    <g key={d.desde}>
                        <title>{`DMI de ${d.desde} a ${d.hasta}: ${d.n} emprendimientos`}</title>
                        {d.n > 0 && (
                            <rect x={x(d.desde) + 1} y={y(d.n)} width={iw / 10 - 2} height={h} fill="#5e4590" rx={3} />
                        )}
                        {d.n > 0 && (
                            <text x={x(d.desde) + iw / 20} y={y(d.n) - 5} textAnchor="middle" fontSize={12} fontWeight={600} fill={TONO.tinta}>
                                {d.n}
                            </text>
                        )}
                        <text x={x(d.desde)} y={H - m.b + 15} textAnchor="middle" fontSize={11} fill={TONO.apagado}>{d.desde}</text>
                    </g>
                )
            })}
            <text x={x(100)} y={H - m.b + 15} textAnchor="middle" fontSize={11} fill={TONO.apagado}>100</text>
            <line x1={m.l} x2={W - m.r} y1={m.t + ih} y2={m.t + ih} stroke={TONO.apagado} strokeWidth={1} />
            {[u1, u2].map((u) => (
                <g key={u}>
                    <line x1={x(u)} x2={x(u)} y1={m.t - 8} y2={m.t + ih} stroke={TONO.tinta} strokeWidth={1.5} />
                    <text x={x(u)} y={m.t - 12} textAnchor="middle" fontSize={11} fontWeight={600} fill={TONO.tinta}>
                        {String(u).replace('.', ',')}
                    </text>
                </g>
            ))}
            <text x={(x(0) + x(u1)) / 2} y={H - 6} textAnchor="middle" fontSize={11} fill={TONO.tinta}>Incipiente</text>
            <text x={(x(u1) + x(u2)) / 2} y={H - 6} textAnchor="middle" fontSize={11} fill={TONO.tinta}>Transición</text>
            <text x={(x(u2) + x(100)) / 2} y={H - 6} textAnchor="middle" fontSize={11} fill={TONO.tinta}>Consolidado</text>
            <text x={m.l + iw / 2} y={H - 28} textAnchor="middle" fontSize={11} fill={TONO.apagado}>DMI (0-100) en tramos de 10; eje vertical: emprendimientos</text>
        </svg>
    )
}
