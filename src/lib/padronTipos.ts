/** Tipos y constantes del padrón, sin dependencias de servidor (los usan componentes de cliente). */

export type EstadoPadron = 'Oficial' | 'Pendiente' | 'Registrado sin diagnóstico' | 'Sin registro'
export const ESTADOS_PADRON: EstadoPadron[] = ['Oficial', 'Pendiente', 'Registrado sin diagnóstico', 'Sin registro']

export interface FilaPadron {
    id: string
    nombre: string
    companyId: string | null
    enListado: boolean
    firmo: boolean
    rol: string
    emprendimiento: string | null
    telefono: string | null
    autoidentificacion: string | null
    estado: EstadoPadron
}

const palabras = (s: string) =>
    s
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .split(/[^a-z]+/)
        .filter((w) => w.length > 2)

/** Sugiere a quién del padrón corresponde un contacto: al menos dos palabras en común. */
export function sugerirParticipante(contacto: string, opciones: { id: string; nombre: string }[]): string {
    const buscadas = new Set(palabras(contacto))
    let mejor = { id: '', comunes: 1 }
    for (const o of opciones) {
        const comunes = palabras(o.nombre).filter((w) => buscadas.has(w)).length
        if (comunes > mejor.comunes) mejor = { id: o.id, comunes }
    }
    return mejor.id
}
