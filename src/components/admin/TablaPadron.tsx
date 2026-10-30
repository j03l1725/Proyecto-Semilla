'use client'

import { useState } from 'react'
import { ESTADOS_PADRON, type EstadoPadron, type FilaPadron } from '@/lib/padronTipos'
import { TablaCaja, TH, TD } from './Seccion'

const MARCA: Record<EstadoPadron, string> = {
    Oficial: '✓',
    Pendiente: '○',
    'Registrado sin diagnóstico': '◐',
    'Sin registro': '✗',
}

/** Padrón completo con filtro por estado. */
export function TablaPadron({ filas }: { filas: FilaPadron[] }) {
    const [filtro, setFiltro] = useState<'todos' | EstadoPadron>('todos')
    const visibles = filas.filter((f) => filtro === 'todos' || f.estado === filtro)
    return (
        <div className="space-y-3">
            <label className="flex flex-wrap items-center gap-2 text-sm text-[#3a3547]">
                Filtrar por estado
                <select
                    value={filtro}
                    onChange={(e) => setFiltro(e.target.value as 'todos' | EstadoPadron)}
                    className="h-11 rounded-md border border-input bg-white px-2 text-sm"
                >
                    <option value="todos">Todos ({filas.length})</option>
                    {ESTADOS_PADRON.map((e) => (
                        <option key={e} value={e}>{e} ({filas.filter((f) => f.estado === e).length})</option>
                    ))}
                </select>
                <span className="text-[#6b6480]">Se muestran {visibles.length}.</span>
            </label>
            <ul className="md:hidden space-y-2">
                {visibles.map((f) => (
                    <li key={f.id} className="rounded-lg border border-border bg-white p-3 text-sm">
                        <p className="font-semibold text-tinta">{f.nombre}</p>
                        <p className="mt-0.5">
                            <span aria-hidden className="mr-1.5">{MARCA[f.estado]}</span>
                            {f.estado}
                        </p>
                        <p className="text-xs text-[#5a5566] mt-0.5">
                            {f.emprendimiento ?? 'Sin emprendimiento'} · {f.rol} · {f.enListado ? 'en listado' : 'fuera del listado'} · {f.firmo ? 'firmó' : 'no firmó'}
                        </p>
                    </li>
                ))}
            </ul>
            <TablaCaja minimo={640} etiqueta="Padrón de participantes" className="hidden md:block">
                <thead>
                    <tr>
                        <th className={TH}>Nombre</th>
                        <th className={TH}>Rol</th>
                        <th className={TH}>En listado</th>
                        <th className={TH}>Firmó</th>
                        <th className={TH}>Emprendimiento</th>
                        <th className={TH}>Estado</th>
                    </tr>
                </thead>
                <tbody>
                    {visibles.map((f) => (
                        <tr key={f.id}>
                            <td className={TD}>{f.nombre}</td>
                            <td className={`${TD} text-xs text-[#5a5566]`}>{f.rol}</td>
                            <td className={TD}>{f.enListado ? 'Sí' : 'No'}</td>
                            <td className={TD}>{f.firmo ? 'Sí' : 'No'}</td>
                            <td className={TD}>{f.emprendimiento ?? '—'}</td>
                            <td className={`${TD} whitespace-nowrap`}>
                                <span aria-hidden className="mr-1.5">{MARCA[f.estado]}</span>
                                {f.estado}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </TablaCaja>
        </div>
    )
}
