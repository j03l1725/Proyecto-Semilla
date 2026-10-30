/** Tipos y constantes del padrón, sin dependencias de servidor (los usan componentes de cliente). */

export type EstadoPadron = 'Oficial' | 'Pendiente' | 'Registrado sin diagnóstico' | 'Sin registro'
export const ESTADOS_PADRON: EstadoPadron[] = ['Oficial', 'Pendiente', 'Registrado sin diagnóstico', 'Sin registro']

export interface FilaPadron {
    id: string
    nombre: string
    enListado: boolean
    firmo: boolean
    rol: string
    emprendimiento: string | null
    telefono: string | null
    autoidentificacion: string | null
    estado: EstadoPadron
}

