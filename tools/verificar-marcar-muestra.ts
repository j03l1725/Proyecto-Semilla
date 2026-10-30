/**
 * Verifica que la acción marcarMuestra rechaza lo que debe rechazar, llamándola
 * directamente (sin pasar por el middleware, que de otro modo la taparía).
 *
 *   DATABASE_URL=... ADMIN_PASSWORD=... npx ts-node --compiler-options '{"module":"CommonJS"}' tools/verificar-marcar-muestra.ts
 *
 * Crea una evaluación temporal para no tocar los datos reales y la borra al final.
 */
/* eslint-disable @typescript-eslint/no-require-imports */
const Module = require('module')
const path = require('path')

let cookieActual: string | undefined
const original = Module._load
const resolver = Module._resolveFilename
Module._resolveFilename = function (req: string, ...rest: unknown[]) {
    if (req.startsWith('@/')) req = path.join(__dirname, '..', 'src', req.slice(2))
    return resolver.call(this, req, ...rest)
}
Module._load = function (req: string, ...rest: unknown[]) {
    if (req === 'next/headers') return { cookies: async () => ({ get: () => (cookieActual ? { value: cookieActual } : undefined) }) }
    if (req === 'next/cache') return { revalidatePath: () => {} }
    return original.call(this, req, ...rest)
}

async function main() {
    const { marcarMuestra } = require('../src/app/actions/muestra')
    const { createSessionToken } = require('../src/lib/adminSession')
    const prisma = require('../src/lib/prisma').default

    const empresa = await prisma.company.create({ data: { name: 'tmp-verificacion', contactName: 'tmp', email: `tmp-${Date.now()}@ejemplo.invalid` } })
    const ev = await prisma.assessment.create({ data: { companyId: empresa.id } })
    const estado = async () => (await prisma.assessment.findUnique({ where: { id: ev.id } }))?.estadoMuestra
    let fallos = 0
    const caso = (nombre: string, ok: boolean) => {
        if (!ok) fallos++
        console.log(`${ok ? '✓' : '✗'} ${nombre}`)
    }

    try {
        caso('una evaluación nueva entra como pendiente', (await estado()) === 'pendiente')

        cookieActual = undefined
        caso('sin sesión: rechaza', (await marcarMuestra(ev.id, 'oficial', '')).success === false && (await estado()) === 'pendiente')
        cookieActual = 'basura.basura.basura'
        caso('con cookie falsa: rechaza', (await marcarMuestra(ev.id, 'oficial', '')).success === false && (await estado()) === 'pendiente')

        cookieActual = await createSessionToken()
        caso('con sesión, estado fuera de la lista: rechaza', (await marcarMuestra(ev.id, 'hackeado', '')).success === false)
        caso('con sesión, excluir sin motivo: rechaza', (await marcarMuestra(ev.id, 'excluida', '  ')).success === false && (await estado()) === 'pendiente')
        caso('con sesión, excluir con motivo: acepta', (await marcarMuestra(ev.id, 'excluida', 'prueba')).success === true && (await estado()) === 'excluida')
        caso('con sesión, pasar a oficial: acepta', (await marcarMuestra(ev.id, 'oficial', '')).success === true && (await estado()) === 'oficial')
    } finally {
        await prisma.company.delete({ where: { id: empresa.id } })
    }
    console.log(fallos ? `\n${fallos} fallos` : '\nTodo en orden')
    process.exit(fallos ? 1 : 0)
}
main().catch((e) => { console.error(e); process.exit(2) })
