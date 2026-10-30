export interface EtapaEmbudo { rotulo: string; n: number; detalle?: string }

/** Embudo de cobertura: barras horizontales decrecientes con la cifra escrita. */
export function Embudo({ etapas, base }: { etapas: EtapaEmbudo[]; base: number }) {
    return (
        <ol className="space-y-2">
            {etapas.map((e, i) => (
                <li key={e.rotulo} className="grid grid-cols-1 sm:grid-cols-[210px_1fr] gap-x-3 gap-y-1 items-center">
                    <div className="text-sm text-tinta">
                        <span className="text-[#6b6480] mr-1.5">{i + 1}.</span>
                        {e.rotulo}
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="h-6 flex-1 rounded-sm bg-white">
                            <div
                                className="h-full rounded-sm"
                                style={{ width: `${base ? Math.max(1.5, (e.n / base) * 100) : 0}%`, background: ['#3c235f', '#5e4590', '#8570b8', '#b9a6d9'][i % 4] }}
                            />
                        </div>
                        <span className="w-28 text-sm font-semibold tabular-nums text-tinta">
                            {e.n}
                            {e.detalle ? <span className="font-normal text-[#6b6480] text-xs"> {e.detalle}</span> : null}
                        </span>
                    </div>
                </li>
            ))}
        </ol>
    )
}
