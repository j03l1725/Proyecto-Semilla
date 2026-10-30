'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ControlMuestra } from './ControlMuestra'
import { TablaCaja, TH, TD } from './Seccion'
import { ESTADOS_MUESTRA, ROTULO_ESTADO, type EstadoMuestra } from '@/lib/estadosMuestra'

export interface FilaRegistro {
    id: string
    empresa: string
    reporte: string
    fecha: string
    dmi: string
    estado: string
    motivo: string | null
    superada: boolean
}

const rotulo = (e: string) => ROTULO_ESTADO[e as EstadoMuestra] ?? { texto: e, marca: '?' }

function Cambiar({ f }: { f: FilaRegistro }) {
    return (
        <details>
            <summary
                aria-label={`Cambiar estado de ${f.empresa}`}
                className="cursor-pointer inline-flex items-center min-h-11 text-sm text-morado-700 underline underline-offset-2 whitespace-nowrap"
            >
                Cambiar estado
            </summary>
            <div className="mt-2">
                <ControlMuestra assessmentId={f.id} estado={f.estado} motivo={f.motivo} />
            </div>
        </details>
    )
}

/** Todas las evaluaciones con filtro por estado: tarjetas en móvil, tabla en pantallas anchas. */
export function RegistrosEvaluaciones({ filas }: { filas: FilaRegistro[] }) {
    const [filtro, setFiltro] = useState<'todos' | EstadoMuestra>('todos')
    const visibles = filas.filter((f) => filtro === 'todos' || f.estado === filtro)
    return (
        <div className="space-y-3">
            <label className="flex flex-wrap items-center gap-2 text-sm text-[#3a3547]">
                Filtrar por estado
                <select
                    value={filtro}
                    onChange={(e) => setFiltro(e.target.value as 'todos' | EstadoMuestra)}
                    className="h-11 rounded-md border border-input bg-white px-2 text-sm"
                >
                    <option value="todos">Todos ({filas.length})</option>
                    {ESTADOS_MUESTRA.map((e) => (
                        <option key={e} value={e}>{rotulo(e).texto} ({filas.filter((f) => f.estado === e).length})</option>
                    ))}
                </select>
                <span className="text-[#6b6480]">Se muestran {visibles.length}.</span>
            </label>

            <ul className="md:hidden space-y-3">
                {visibles.map((f) => (
                    <li key={f.id} className="rounded-lg border border-border bg-white p-3 text-sm">
                        <div className="flex justify-between gap-3">
                            <Link href={`/admin/${f.id}`} className="inline-flex items-center min-h-11 min-w-11 font-semibold text-morado-700 underline underline-offset-2">{f.empresa}</Link>
                            <span className="tabular-nums font-semibold">DMI {f.dmi}</span>
                        </div>
                        <p className="mt-1">
                            <span aria-hidden className="mr-1.5">{rotulo(f.estado).marca}</span>
                            {rotulo(f.estado).texto}
                            {f.superada ? ' · reemplazada por otra más reciente' : ''}
                        </p>
                        <p className="text-xs text-[#6b6480] mt-1">{f.fecha} · <span className="font-mono">{f.reporte}</span></p>
                        {f.motivo ? <p className="text-xs text-[#5a5566] mt-1">Motivo: {f.motivo}</p> : null}
                        <div className="mt-1 print:hidden"><Cambiar f={f} /></div>
                    </li>
                ))}
            </ul>

            <TablaCaja minimo={880} etiqueta="Todas las evaluaciones" className="hidden md:block">
                <thead>
                    <tr>
                        <th className={TH}>Emprendimiento</th>
                        <th className={TH}>Reporte</th>
                        <th className={TH}>Fecha</th>
                        <th className={`${TH} text-right`}>DMI</th>
                        <th className={TH}>Estado</th>
                        <th className={TH}>Motivo</th>
                        <th className={`${TH} print:hidden`}>Cambiar</th>
                    </tr>
                </thead>
                <tbody>
                    {visibles.map((f) => (
                        <tr key={f.id}>
                            <td className={TD}>
                                <Link href={`/admin/${f.id}`} className="inline-flex items-center min-h-11 min-w-11 text-morado-700 underline underline-offset-2">{f.empresa}</Link>
                            </td>
                            <td className={`${TD} font-mono text-[11px] text-[#6b6480]`}>{f.reporte}</td>
                            <td className={`${TD} text-xs whitespace-nowrap`}>{f.fecha}</td>
                            <td className={`${TD} text-right tabular-nums font-semibold`}>{f.dmi}</td>
                            <td className={`${TD} whitespace-nowrap`}>
                                <span aria-hidden className="mr-1.5">{rotulo(f.estado).marca}</span>
                                {rotulo(f.estado).texto}
                                {f.superada ? <div className="text-xs text-[#6b6480]">Reemplazada por otra más reciente</div> : null}
                            </td>
                            <td className={`${TD} text-xs text-[#5a5566] max-w-[260px]`}>{f.motivo ?? '—'}</td>
                            <td className={`${TD} print:hidden`}><Cambiar f={f} /></td>
                        </tr>
                    ))}
                </tbody>
            </TablaCaja>
        </div>
    )
}
