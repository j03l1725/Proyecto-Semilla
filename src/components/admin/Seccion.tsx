export function Seccion({
    id,
    titulo,
    descripcion,
    children,
}: {
    id: string
    titulo: string
    descripcion?: string
    children: React.ReactNode
}) {
    return (
        <section id={id} aria-labelledby={`${id}-t`} className="scroll-mt-20 lg:scroll-mt-6 space-y-4">
            <div>
                <h2 id={`${id}-t`} className="text-xl font-bold text-morado-700">{titulo}</h2>
                {descripcion ? <p className="text-sm text-[#5a5566] mt-1 max-w-3xl">{descripcion}</p> : null}
            </div>
            {children}
            <p className="print:hidden lg:hidden">
                <a href="#indice" className="inline-flex items-center min-h-11 text-sm text-morado-700 underline underline-offset-2">
                    ↑ Volver a las secciones
                </a>
            </p>
        </section>
    )
}

/** Caja blanca de contenido; no se parte entre páginas al imprimir. */
export function Caja({
    titulo,
    children,
    className = '',
}: {
    titulo?: string
    children: React.ReactNode
    className?: string
}) {
    return (
        <div className={`rounded-xl border border-border bg-white p-4 sm:p-5 print:break-inside-avoid ${className}`}>
            {titulo ? <h3 className="text-sm font-semibold text-tinta mb-3">{titulo}</h3> : null}
            {children}
        </div>
    )
}

/** Tabla que hace scroll dentro de su caja, nunca en la página. */
export function TablaCaja({
    children,
    minimo = 560,
    etiqueta = 'Tabla',
    className = '',
}: {
    children: React.ReactNode
    minimo?: number
    etiqueta?: string
    className?: string
}) {
    return (
        <div tabIndex={0} role="region" aria-label={etiqueta} className={`overflow-x-auto rounded-md border border-border bg-white ${className}`}>
            <table className="w-full text-sm" style={{ minWidth: minimo }}>
                {children}
            </table>
        </div>
    )
}

export const TH = 'text-left font-semibold text-[#3a3547] bg-morado-50 px-3 py-2 text-xs whitespace-nowrap'
export const TD = 'px-3 py-2 border-t border-border align-top'
