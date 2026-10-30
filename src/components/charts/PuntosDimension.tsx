import { corta, n1, TONO } from '@/lib/panel'
import { LEVEL_THRESHOLDS } from '@/lib/scoring'

interface Dim { nombre: string; media: number; desviacion: number; min: number; max: number }

/**
 * Gráfico de puntos por dimensión, de la más débil a la más fuerte: punto en la
 * media, trazo grueso de ± una desviación y trazo fino del mínimo al máximo.
 */
export function PuntosDimension({ datos }: { datos: Dim[] }) {
    const W = 360, fila = 46
    const m = { l: 96, r: 14, t: 22, b: 30 }
    const H = m.t + m.b + fila * datos.length
    const iw = W - m.l - m.r
    const x = (v: number) => m.l + (Math.max(0, Math.min(100, v)) / 100) * iw
    return (
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={datos.map((d) => `${d.nombre}: media ${n1(d.media)}`).join('; ')} className="w-full h-auto min-h-[260px]">
            {[0, 25, 50, 75, 100].map((t) => (
                <g key={t}>
                    <line x1={x(t)} x2={x(t)} y1={m.t - 6} y2={H - m.b} stroke={TONO.rejilla} strokeWidth={1} />
                    <text x={x(t)} y={H - m.b + 16} textAnchor="middle" fontSize={11} fill={TONO.apagado}>{t}</text>
                </g>
            ))}
            {[LEVEL_THRESHOLDS.incipiente, LEVEL_THRESHOLDS.transicion].map((u) => (
                <line key={u} x1={x(u)} x2={x(u)} y1={m.t - 6} y2={H - m.b} stroke={TONO.tinta} strokeWidth={1} opacity={0.35} />
            ))}
            {datos.map((d, i) => {
                const cy = m.t + fila * i + fila / 2 - 4
                const a = Math.max(0, d.media - d.desviacion), b = Math.min(100, d.media + d.desviacion)
                return (
                    <g key={d.nombre}>
                        <title>{`${d.nombre}: media ${n1(d.media)}, DE ${n1(d.desviacion)}, mínimo ${n1(d.min)}, máximo ${n1(d.max)}`}</title>
                        <text x={m.l - 8} y={cy + 4} textAnchor="end" fontSize={12} fill={TONO.tinta}>{corta(d.nombre)}</text>
                        <line x1={x(d.min)} x2={x(d.max)} y1={cy} y2={cy} stroke="#8570b8" strokeWidth={1.5} />
                        <line x1={x(a)} x2={x(b)} y1={cy} y2={cy} stroke="#5e4590" strokeWidth={6} strokeLinecap="round" />
                        <circle cx={x(d.media)} cy={cy} r={6} fill="#ffffff" stroke="#3c235f" strokeWidth={2.5} />
                        <text x={x(d.media)} y={cy - 12} textAnchor="middle" fontSize={11} fontWeight={600} fill={TONO.tinta}>{n1(d.media)}</text>
                    </g>
                )
            })}
        </svg>
    )
}
