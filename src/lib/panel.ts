/**
 * Utilidades de presentación del panel: formato de números en español y
 * nombres cortos de las dimensiones.
 */

/** Número con coma decimal. */
export function n1(x: number | null | undefined, decimales = 1): string {
    if (x === null || x === undefined || Number.isNaN(x)) return '—'
    return x.toFixed(decimales).replace('.', ',')
}

export const DIM_CORTA: Record<string, string> = {
    'Tecnologías y habilidades digitales': 'Tecnologías',
    'Comunicaciones y canales de venta': 'Comunicaciones',
    'Organización y personas': 'Organización',
    'Estrategia y transformación digital': 'Estrategia',
    'Datos y analítica': 'Datos',
    Procesos: 'Procesos',
}
export const corta = (nombre: string) => DIM_CORTA[nombre] ?? nombre

/** Rampa secuencial de un solo tono (morado institucional), de claro a oscuro. */
export const TONO = {
    claro: '#ddd3ec',
    medio: '#8570b8',
    oscuro: '#3c235f',
    tinta: '#1b1826',
    apagado: '#6b6480',
    rejilla: '#e4dfee',
}

/** Color de celda para un valor 0-100: mezcla lineal entre lila muy claro y morado oscuro. */
export function colorEscala(v: number): { fondo: string; texto: string } {
    const t = Math.max(0, Math.min(1, v / 70))
    const a = [247, 245, 250]
    const b = [60, 35, 95]
    const c = a.map((x, i) => Math.round(x + (b[i] - x) * t))
    return { fondo: `rgb(${c[0]} ${c[1]} ${c[2]})`, texto: t > 0.55 ? '#ffffff' : TONO.tinta }
}

export function fechaCorta(d: Date): string {
    return d.toLocaleString('es-EC', {
        timeZone: 'America/Guayaquil',
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
    })
}
