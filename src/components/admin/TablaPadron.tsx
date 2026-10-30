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
                    className="h-9 rounded-md border border-input bg-white px-2 text-sm"
                >
                    <option value="todos">Todos ({filas.length})</option>
                    {ESTADOS_PADRON.map((e) => (
                        <option key={e} value={e}>{e} ({filas.filter((f) => f.estado === e).length})</option>
                    ))}
                </select>
                <span className="text-[#6b6480]">Se muestran {visibles.length}.</span>
            </label>
            <TablaCaja minimo={640}>
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
