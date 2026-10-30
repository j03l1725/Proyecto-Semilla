'use client'

import { useState, useTransition } from 'react'
import { vincularParticipante } from '@/app/actions/muestra'
import { sugerirParticipante } from '@/lib/padronTipos'

/** Liga un emprendimiento nuevo con la persona del padrón que le corresponde. */
export function VincularParticipante({
    companyId,
    contacto,
    opciones,
}: {
    companyId: string
    contacto: string
    opciones: { id: string; nombre: string }[]
}) {
    const [elegida, setElegida] = useState(() => sugerirParticipante(contacto, opciones))
    const [error, setError] = useState('')
    const [ocupado, iniciar] = useTransition()

    if (opciones.length === 0) return null

    return (
        <form
            className="flex flex-wrap items-center gap-2"
            onSubmit={(e) => {
                e.preventDefault()
                setError('')
                iniciar(async () => {
                    const r = await vincularParticipante(elegida, companyId)
                    if (!r.success) setError(r.error ?? 'No se pudo vincular.')
                })
            }}
        >
            <select
                aria-label={`Persona del padrón para ${contacto}`}
                value={elegida}
                onChange={(e) => setElegida(e.target.value)}
                className="h-11 max-w-64 rounded-md border border-input bg-white px-2 text-sm"
            >
                <option value="">Sigue fuera del listado</option>
                {opciones.map((o) => (
                    <option key={o.id} value={o.id}>
                        {o.nombre}
                    </option>
                ))}
            </select>
            <button
                type="submit"
                disabled={ocupado || !elegida}
                className="h-11 rounded-md bg-morado-700 px-3 text-sm font-semibold text-white disabled:opacity-50"
            >
                {ocupado ? 'Vinculando…' : 'Vincular'}
            </button>
            {error ? <p role="alert" className="w-full text-xs text-naranja-700">{error}</p> : null}
        </form>
    )
}
