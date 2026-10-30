'use client'

import { useState, useTransition } from 'react'
import { marcarMuestra } from '@/app/actions/muestra'
import { ESTADOS_MUESTRA, ROTULO_ESTADO, type EstadoMuestra } from '@/lib/estadosMuestra'

/** Cambia el estado de una evaluación; excluir exige escribir el motivo. */
export function ControlMuestra({
    assessmentId,
    estado,
    motivo,
}: {
    assessmentId: string
    estado: string
    motivo: string | null
}) {
    const [nuevo, setNuevo] = useState<EstadoMuestra>((ESTADOS_MUESTRA as readonly string[]).includes(estado) ? (estado as EstadoMuestra) : 'pendiente')
    const [texto, setTexto] = useState(motivo ?? '')
    const [mensaje, setMensaje] = useState<{ ok: boolean; texto: string } | null>(null)
    const [ocupado, empezar] = useTransition()
    const cambio = nuevo !== estado || (texto.trim() || null) !== (motivo ?? null)
    const falta = nuevo === 'excluida' && texto.trim().length < 3

    function guardar() {
        setMensaje(null)
        empezar(async () => {
            const r = await marcarMuestra(assessmentId, nuevo, texto)
            setMensaje(r.success ? { ok: true, texto: 'Guardado' } : { ok: false, texto: r.error ?? 'No se pudo guardar' })
        })
    }

    return (
        <div className="flex flex-col gap-1.5 min-w-[230px]">
            <div className="flex gap-1.5">
                <select
                    aria-label="Estado en la muestra"
                    value={nuevo}
                    onChange={(e) => setNuevo(e.target.value as EstadoMuestra)}
                    disabled={ocupado}
                    className="h-9 rounded-md border border-input bg-white px-2 text-sm"
                >
                    {ESTADOS_MUESTRA.map((e) => (
                        <option key={e} value={e}>{ROTULO_ESTADO[e].marca} {ROTULO_ESTADO[e].texto}</option>
                    ))}
                </select>
                <button
                    type="button"
                    onClick={guardar}
                    disabled={ocupado || !cambio || falta}
                    className="h-9 rounded-md bg-naranja-500 px-3 text-sm font-semibold text-morado-950 hover:bg-naranja-400 disabled:bg-morado-100 disabled:text-[#6b6480]"
                >
                    {ocupado ? 'Guardando…' : 'Guardar'}
                </button>
            </div>
            <input
                aria-label={nuevo === 'excluida' ? 'Motivo (obligatorio al excluir)' : 'Motivo (opcional)'}
                placeholder={nuevo === 'excluida' ? 'Motivo (obligatorio)' : 'Motivo (opcional)'}
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                maxLength={500}
                disabled={ocupado}
                className="h-9 rounded-md border border-input bg-white px-2 text-sm"
            />
            {falta ? <p className="text-xs text-naranja-700">Escribe el motivo para excluir.</p> : null}
            {mensaje ? (
                <p role="status" className={`text-xs ${mensaje.ok ? 'text-morado-700' : 'text-[#c62828]'}`}>
                    {mensaje.ok ? '✓' : '✗'} {mensaje.texto}
                </p>
            ) : null}
        </div>
    )
}
