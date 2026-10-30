import type { Reparto } from '@/lib/metricas'
import { n1 } from '@/lib/panel'

const ESTILO: Record<string, { fondo: string; texto: string }> = {
    Incipiente: { fondo: '#ddd3ec', texto: '#1b1826' },
    'Transición': { fondo: '#8570b8', texto: '#ffffff' },
    Consolidado: { fondo: '#3c235f', texto: '#ffffff' },
}

/** Barra horizontal apilada con el reparto por nivel; cada tramo lleva su cifra escrita. */
export function BarraNiveles({ datos }: { datos: Reparto[] }) {
    const total = datos.reduce((a, d) => a + d.n, 0)
    return (
        <div>
            <div
                className="flex h-12 w-full overflow-hidden rounded-md gap-[2px] bg-white"
                role="img"
                aria-label={datos.map((d) => `${d.clave}: ${d.n}`).join('; ')}
            >
                {datos
                    .filter((d) => d.n > 0)
                    .map((d) => (
                        <div
                            key={d.clave}
                            title={`${d.clave}: ${d.n} (${n1(d.pct)} %)`}
                            className="flex items-center justify-center text-sm font-semibold"
                            style={{ width: `${(d.n / total) * 100}%`, background: ESTILO[d.clave].fondo, color: ESTILO[d.clave].texto }}
                        >
                            {d.n}
                        </div>
                    ))}
            </div>
            <ul className="mt-3 space-y-1.5 text-sm">
                {datos.map((d) => (
                    <li key={d.clave} className="flex items-center gap-2">
                        <span
                            aria-hidden
                            className="inline-block h-3.5 w-3.5 rounded-sm border border-morado-700/30"
                            style={{ background: ESTILO[d.clave].fondo }}
                        />
                        <span className="font-medium text-tinta">{d.clave}</span>
                        <span className="text-[#5a5566] tabular-nums">
                            {d.n} de {total} · {n1(d.pct)} %{d.n > 0 ? ` · DMI medio ${n1(d.dmiMedio)}` : ''}
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    )
}
