/**
 * Sesión de administración firmada.
 *
 * Antes la cookie valía la constante "authenticated": bastaba escribirla a mano
 * para entrar al panel y descargar el CSV con los datos de contacto. El valor
 * ahora es un token aleatorio firmado con HMAC-SHA256, imposible de fabricar sin
 * el secreto del servidor.
 *
 * Se usa Web Crypto —no el módulo `crypto` de Node— porque este archivo también
 * corre en el middleware, que se ejecuta en el runtime Edge.
 */

export const ADMIN_COOKIE = 'admin_session'
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 // 1 día

/**
 * Secreto de firma. `ADMIN_SESSION_SECRET` si existe; si no, la contraseña de
 * administración. Sin ninguno de los dos no se emite ni se acepta sesión: es
 * preferible un panel inaccesible a uno abierto con un secreto conocido.
 */
function getSecret(): string | null {
    return process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD || null
}

function toBase64Url(bytes: Uint8Array): string {
    let binary = ''
    for (const byte of bytes) binary += String.fromCharCode(byte)
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

async function sign(payload: string, secret: string): Promise<string> {
    const key = await crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode(secret),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
    )
    const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload))
    return toBase64Url(new Uint8Array(signature))
}

/** Comparación en tiempo constante: no revela el prefijo correcto por temporización. */
function timingSafeEqual(a: string, b: string): boolean {
    if (a.length !== b.length) return false
    let diff = 0
    for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
    return diff === 0
}

/** Token con la forma `expiración.nonce.firma`. Devuelve null si no hay secreto. */
export async function createSessionToken(): Promise<string | null> {
    const secret = getSecret()
    if (!secret) return null

    const expiresAt = Math.floor(Date.now() / 1000) + SESSION_MAX_AGE_SECONDS
    const nonce = toBase64Url(crypto.getRandomValues(new Uint8Array(24)))
    const payload = `${expiresAt}.${nonce}`
    return `${payload}.${await sign(payload, secret)}`
}

export async function verifySessionToken(token: string | undefined): Promise<boolean> {
    const secret = getSecret()
    if (!secret || !token) return false

    const parts = token.split('.')
    if (parts.length !== 3) return false

    const [expiresAt, nonce, signature] = parts
    const expiry = Number(expiresAt)
    if (!Number.isSafeInteger(expiry) || expiry <= Math.floor(Date.now() / 1000)) return false

    return timingSafeEqual(signature, await sign(`${expiresAt}.${nonce}`, secret))
}
