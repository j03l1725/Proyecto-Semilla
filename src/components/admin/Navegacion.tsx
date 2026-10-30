export const SECCIONES = [
    { id: 'resumen', rotulo: 'Resumen' },
    { id: 'niveles', rotulo: 'Niveles' },
    { id: 'dimensiones', rotulo: 'Dimensiones' },
    { id: 'items', rotulo: 'Ítems' },
    { id: 'perfiles', rotulo: 'Perfiles' },
    { id: 'participantes', rotulo: 'Participantes' },
    { id: 'calidad', rotulo: 'Calidad y registros' },
]

/** Barra lateral en pantallas anchas; en móvil, una franja con scroll propio. */
export function Navegacion({ pendientes }: { pendientes: number }) {
    return (
        <nav
            aria-label="Secciones del panel"
            className="print:hidden sticky top-0 z-20 -mx-4 sm:-mx-6 px-4 sm:px-6 py-2 bg-white/95 backdrop-blur border-b border-border lg:static lg:mx-0 lg:px-0 lg:py-0 lg:bg-transparent lg:border-0 lg:sticky lg:top-6 lg:self-start"
        >
            <ul className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible">
                {SECCIONES.map((s) => (
                    <li key={s.id} className="shrink-0">
                        <a
                            href={`#${s.id}`}
                            className="flex items-center min-h-11 rounded-md px-3 text-sm font-medium text-morado-700 hover:bg-morado-100 focus-visible:outline-2 focus-visible:outline-morado-500 whitespace-nowrap"
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
