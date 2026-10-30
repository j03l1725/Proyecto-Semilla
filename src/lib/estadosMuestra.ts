/** Estados posibles de una evaluación respecto de la muestra (lista cerrada). */
export const ESTADOS_MUESTRA = ['oficial', 'pendiente', 'excluida'] as const
export type EstadoMuestra = (typeof ESTADOS_MUESTRA)[number]

/** Rótulo y marca de forma: el estado nunca se distingue solo por color. */
export const ROTULO_ESTADO: Record<EstadoMuestra, { texto: string; marca: string }> = {
    oficial: { texto: 'Oficial', marca: '✓' },
    pendiente: { texto: 'Pendiente', marca: '○' },
    excluida: { texto: 'Excluida', marca: '✗' },
}
