import type { DistribucionItem } from '@/lib/metricas'

/** Tres tonos de un mismo morado, de claro a oscuro; el cero lleva además trama y rótulo. */
const TRAMA_CERO =
    'repeating-linear-gradient(135deg, #ddd3ec 0 4px, #c7b9df 4px 6px)'

const SEG = [
    { clave: 'n0' as const, nombre: '0 · No lo hace', fondo: TRAMA_CERO, texto: '#1b1826' },
    { clave: 'n1' as const, nombre: '1 · A medias', fondo: '#6c55a2', texto: '#ffffff' },
    { clave: 'n2' as const, nombre: '2 · Sí lo hace', fondo: '#3c235f', texto: '#ffffff' },
]

/** Barras apiladas al 100 % del reparto 0/1/2 de cada ítem, de menor a mayor media. */
export function ItemsApilados({ datos }: { datos: DistribucionItem[] }) {
    const orden = [...datos].sort((a, b) => a.media - b.media || b.n0 - a.n0)
    return (
        <div>
            <ul className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-[#3a3547] mb-4" aria-label="Leyenda">
                {SEG.map((s) => (
                    <li key={s.clave} className="flex items-center gap-1.5">
                        <span aria-hidden className="inline-block h-3.5 w-5 rounded-sm border border-morado-700/30" style={{ background: s.fondo }} />
                        {s.nombre}
                    </li>
                ))}
            </ul>
            <ol className="space-y-2.5">
                {orden.map((d) => {
                    const total = d.n0 + d.n1 + d.n2
                    return (
                        <li key={d.codigo} className="grid grid-cols-1 sm:grid-cols-[220px_1fr_52px] gap-x-3 gap-y-1 items-center">
                            <div className="text-xs text-tinta leading-tight">
                                <span className="font-mono text-[11px] text-[#6b6480] mr-1.5">{d.codigo}</span>
                                {d.etiqueta}
                            </div>
                            <div
                                className="flex h-7 w-full gap-[2px] rounded-sm overflow-hidden bg-white"
                                role="img"
                                aria-label={`${d.codigo} ${d.etiqueta}: ${d.n0} en 0, ${d.n1} en 1, ${d.n2} en 2`}
                            >
                                {SEG.map((s) =>
                                    d[s.clave] > 0 ? (
                                        <div
                                            key={s.clave}
                                            title={`${s.nombre}: ${d[s.clave]} de ${total}`}
                                            className="flex items-center justify-center text-[11px] font-semibold"
                                            style={{ width: `${(d[s.clave] / total) * 100}%`, background: s.fondo, color: s.texto }}
                                        >
                                            {d[s.clave]}
                                        </div>
                                    ) : null
                                )}
                            </div>
                            <div className="text-xs tabular-nums text-[#5a5566] sm:text-right">
                                <span className="sm:hidden">Media </span>
                                {(total ? (d.n1 + 2 * d.n2) / total : 0).toFixed(2).replace('.', ',')}
                            </div>
                        </li>
                    )
                })}
            </ol>
        </div>
    )
}
