/**
 * Identidad y recuperación del reporte.
 *
 * El diagnóstico solo existía mientras la pestaña estuviera abierta: el PDF se
 * descargaba con un botón y el enlace no se le daba a nadie. Quien cerraba la
 * ventana perdía su reporte sin forma de recuperarlo. Estas dos funciones dan
 * al reporte un código legible y una dirección estable que el emprendedor puede
 * guardar o reenviarse por WhatsApp.
 */

/** Dirección pública de la plataforma, sin barra final. */
export function baseUrl(): string {
    const raw = process.env.NEXT_PUBLIC_APP_URL || 'https://semilla.indoamericatech.com'
    return raw.replace(/\/+$/, '')
}

/**
 * Código verificable a partir del identificador de la evaluación.
 * `PS-<año>-<8 caracteres>`, en mayúsculas y sin guiones internos, para que se
 * pueda dictar por teléfono o buscar en el panel.
 */
export function reportCode(assessmentId: string, createdAt: Date): string {
    const limpio = assessmentId.replace(/-/g, '').slice(0, 8).toUpperCase()
    return `PS-${createdAt.getFullYear()}-${limpio}`
}

/** Dirección donde se vuelve a consultar un diagnóstico ya emitido. */
export function reportUrl(assessmentId: string): string {
    return `${baseUrl()}/dashboard/${assessmentId}`
}

/** La misma dirección, recortada para mostrarla dentro del PDF. */
export function reportUrlCorta(assessmentId: string): string {
    return reportUrl(assessmentId).replace(/^https?:\/\//, '')
}
