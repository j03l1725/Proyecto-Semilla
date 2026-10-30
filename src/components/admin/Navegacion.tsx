'use client'

import { useEffect, useState } from 'react'

export const SECCIONES = [
    { id: 'resumen', rotulo: 'Resumen' },
    { id: 'niveles', rotulo: 'Niveles' },
    { id: 'dimensiones', rotulo: 'Dimensiones' },
    { id: 'items', rotulo: 'Ítems' },
    { id: 'perfiles', rotulo: 'Perfiles' },
    { id: 'participantes', rotulo: 'Participantes' },
    { id: 'calidad', rotulo: 'Calidad y registros' },
]

/**
 * Barra lateral en pantallas anchas; en móvil, botones que se reparten en filas
 * (sin scroll oculto: se ven todas las secciones). Marca la sección que se está leyendo.
 */
export function Navegacion({ pendientes }: { pendientes: number }) {
    const [activa, setActiva] = useState('resumen')

    useEffect(() => {
        const secciones = SECCIONES.map((s) => document.getElementById(s.id)).filter((e): e is HTMLElement => !!e)
        const obs = new IntersectionObserver(
            (entradas) => {
                const visibles = entradas.filter((e) => e.isIntersecting)
                if (visibles.length) setActiva(visibles[0].target.id)
            },
            { rootMargin: '-10% 0px -70% 0px' }
        )
        secciones.forEach((s) => obs.observe(s))
        return () => obs.disconnect()
    }, [])

    return (
        <nav
            id="indice"
            aria-label="Secciones del panel"
            className="print:hidden scroll-mt-4 lg:sticky lg:top-6 lg:self-start"
        >
            <ul className="flex flex-wrap lg:flex-col gap-1.5 lg:gap-1">
                {SECCIONES.map((s) => (
                    <li key={s.id}>
                        <a
                            href={`#${s.id}`}
                            aria-current={activa === s.id ? 'location' : undefined}
                            className={`flex items-center min-h-11 rounded-md px-3 text-sm text-morado-700 border border-border bg-white lg:border-0 lg:bg-transparent hover:bg-morado-100 focus-visible:outline-2 focus-visible:outline-morado-500 ${
                                activa === s.id ? 'font-bold lg:bg-morado-100 border-morado-700' : 'font-medium'
                            }`}
                        >
                            {s.rotulo}
                            {s.id === 'calidad' && pendientes > 0 ? (
                                <span className="ml-2 rounded-full bg-naranja-100 text-naranja-700 px-1.5 text-xs font-semibold">
                                    {pendientes} por revisar
                                </span>
                            ) : null}
                        </a>
                    </li>
                ))}
            </ul>
        </nav>
    )
}
