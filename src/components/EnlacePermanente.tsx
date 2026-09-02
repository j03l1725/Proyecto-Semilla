'use client'

import { useState } from 'react'
import { Check, Copy, Link2, MessageCircle } from 'lucide-react'

/**
 * Enlace recuperable del diagnóstico.
 *
 * Antes el reporte solo existía mientras la pestaña estuviera abierta: se
 * descargaba con un botón y nadie le daba la dirección al emprendedor. Quien
 * cerraba la ventana perdía su diagnóstico sin forma de recuperarlo, y con una
 * convocatoria por WhatsApp eso ocurre siempre. Aquí se muestra la dirección,
 * se copia de un clic y se puede reenviar por WhatsApp al propio teléfono.
 */
export function EnlacePermanente({ url, codigo }: { url: string; codigo: string }) {
    const [copiado, setCopiado] = useState(false)

    const copiar = async () => {
        try {
            await navigator.clipboard.writeText(url)
        } catch {
            // Navegadores sin permiso de portapapeles: se deja seleccionable a mano.
            return
        }
        setCopiado(true)
        setTimeout(() => setCopiado(false), 2500)
    }

    const mensaje = encodeURIComponent(
        `Mi diagnóstico de madurez digital — Proyecto Semilla, Universidad Indoamérica.\nReporte ${codigo}\n${url}`
    )

    return (
        <div className="rounded-2xl border border-white/10 bg-[#131b17]/70 backdrop-blur-md p-5">
            <div className="flex items-center gap-2 mb-2">
                <Link2 className="w-4 h-4 text-emerald-400" />
                <p className="text-sm font-semibold text-white">Guarde este enlace</p>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">
                Es la única forma de volver a abrir su diagnóstico. Reporte{' '}
                <span className="font-semibold text-slate-300">{codigo}</span>.
            </p>

            <p className="text-[11px] text-emerald-300/90 break-all bg-black/40 border border-white/5 rounded-lg px-3 py-2 mb-3 font-mono">
                {url}
            </p>

            <div className="flex gap-2">
                <button
                    type="button"
                    onClick={copiar}
                    className="flex-1 inline-flex items-center justify-center gap-2 h-10 rounded-xl bg-white/10 hover:bg-white/15 text-white text-sm font-semibold transition-colors"
                >
                    {copiado ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    {copiado ? 'Copiado' : 'Copiar enlace'}
                </button>
                <a
                    href={`https://wa.me/?text=${mensaje}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 inline-flex items-center justify-center gap-2 h-10 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-sm font-semibold transition-colors"
                >
                    <MessageCircle className="w-4 h-4" />
                    Enviármelo
                </a>
            </div>
        </div>
    )
}
