/**
 * Categorías cerradas de actividad del emprendimiento. El campo libre anterior
 * se llenó con barrios y lugares porque su etiqueta era ambigua; con una lista
 * cerrada los repartos por sector son comparables.
 */
export const SECTORES = [
    'Alimentos y bebidas',
    'Artesanía, flores y plantas',
    'Comercio',
    'Servicios',
    'Textil y confección',
    'Tecnología',
    'Arte y entretenimiento',
    'Otro',
] as const

export type Sector = (typeof SECTORES)[number]

export function esSector(v: unknown): v is Sector {
    return typeof v === 'string' && (SECTORES as readonly string[]).includes(v)
}
