import { colorEscala, corta, n1 } from '@/lib/panel'
import { DIMENSION_ORDER } from '@/lib/scoring'

export interface FilaCalor { codigo: string; dmi: number; porDimension: Record<string, number> }

/** Mapa de calor participantes × dimensiones, con la cifra escrita en cada celda. */
export function MapaCalor({ filas }: { filas: FilaCalor[] }) {
    return (
        <div tabIndex={0} role="region" aria-label="Mapa de calor de participantes por dimensión" className="overflow-x-auto rounded-md border border-border">
            <table className="w-full min-w-[520px] border-separate border-spacing-[2px] text-xs">
                <thead>
                    <tr>
                        <th scope="col" className="text-left font-semibold text-[#3a3547] px-2 py-1 whitespace-nowrap">Participante</th>
                        <th scope="col" className="font-semibold text-[#3a3547] px-1 py-1">DMI</th>
                        {DIMENSION_ORDER.map((d) => (
                            <th key={d} scope="col" className="font-semibold text-[#3a3547] px-1 py-1">{corta(d)}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {filas.map((f) => (
                        <tr key={f.codigo}>
                            <th scope="row" className="text-left font-mono font-medium text-tinta px-2 py-1">{f.codigo}</th>
                            <td className="text-center font-semibold tabular-nums text-tinta">{n1(f.dmi)}</td>
                            {DIMENSION_ORDER.map((d) => {
                                const v = f.porDimension[d] ?? 0
                                const c = colorEscala(v)
                                return (
                                    <td
                                        key={d}
                                        title={`${f.codigo} · ${corta(d)}: ${n1(v)}`}
                                        className="text-center tabular-nums rounded-sm py-1.5 min-w-[56px]"
                                        style={{ background: c.fondo, color: c.texto }}
                                    >
                                        {n1(v)}
                                    </td>
                                )
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
