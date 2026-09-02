/**
 * Respalda a CSV y borra los datos de prueba de una base.
 *
 * Se ejecuta con la cadena de conexión en DIRECT_URL. Sin --aplicar solo
 * diagnostica: imprime qué se borraría y escribe el respaldo, pero no toca
 * nada. El respaldo se escribe SIEMPRE, incluso en modo diagnóstico.
 *
 *   node tools/respaldo-y-limpieza.mjs              # solo diagnostica
 *   node tools/respaldo-y-limpieza.mjs --aplicar    # respalda y borra
 */
import 'dotenv/config'
import fs from 'node:fs'
import path from 'node:path'
import { Pool } from 'pg'

const aplicar = process.argv.includes('--aplicar')
const etiqueta = process.env.ETIQUETA || 'base'
const cs = process.env.DIRECT_URL || process.env.DATABASE_URL
if (!cs) throw new Error('Falta DIRECT_URL o DATABASE_URL')

const pool = new Pool({
    connectionString: cs,
    ssl: cs.includes('localhost') || cs.includes('semilla-db') ? false : { rejectUnauthorized: false },
})
const q = async (s, p = []) => (await pool.query(s, p)).rows

const csv = (filas) => {
    if (!filas.length) return ''
    const cols = Object.keys(filas[0])
    const esc = (v) => {
        if (v === null || v === undefined) return ''
        const t = v instanceof Date ? v.toISOString() : String(v)
        return /[",\n]/.test(t) ? `"${t.replace(/"/g, '""')}"` : t
    }
    return [cols.join(','), ...filas.map((f) => cols.map((c) => esc(f[c])).join(','))].join('\n')
}

const empresas = await q('select * from "Company" order by "createdAt"')
const evaluaciones = await q(
    `select a.*, c.name as empresa, c.email
     from "Assessment" a join "Company" c on c.id = a."companyId" order by a."createdAt"`
)
const respuestas = await q(
    `select aa.*, q.text as pregunta, o.text as opcion, o.weight
     from "AssessmentAnswer" aa
     join "Question" q on q.id = aa."questionId"
     join "Option" o on o.id = aa."optionId"`
)

const dir = path.resolve('tools/respaldos')
fs.mkdirSync(dir, { recursive: true })
const sello = new Date().toISOString().slice(0, 10)
const escrito = []
for (const [nombre, filas] of [
    ['empresas', empresas],
    ['evaluaciones', evaluaciones],
    ['respuestas', respuestas],
]) {
    const f = path.join(dir, `${sello}-${etiqueta}-${nombre}.csv`)
    fs.writeFileSync(f, csv(filas))
    escrito.push(`${path.basename(f)} (${filas.length} filas)`)
}

console.log(`Base: ${etiqueta}`)
console.log(`  empresas      ${empresas.length}`)
console.log(`  evaluaciones  ${evaluaciones.length}`)
console.log(`  respuestas    ${respuestas.length}`)
console.log(`\nRespaldo escrito en tools/respaldos/:`)
escrito.forEach((e) => console.log(`  ${e}`))

if (!aplicar) {
    console.log('\nModo diagnóstico. Nada se borró. Añada --aplicar para ejecutar el borrado.')
    await pool.end()
    process.exit(0)
}

// El catálogo (Dimension / Question / Option) NO se toca: es el instrumento.
await pool.query('BEGIN')
const { rowCount: nResp } = await pool.query('delete from "AssessmentAnswer"')
const { rowCount: nEval } = await pool.query('delete from "Assessment"')
const { rowCount: nEmp } = await pool.query('delete from "Company"')
await pool.query('COMMIT')

console.log(`\nBorrado aplicado: ${nResp} respuestas, ${nEval} evaluaciones, ${nEmp} empresas.`)
const quedan = await q(
    'select (select count(*) from "Dimension") dims, (select count(*) from "Question") qs, (select count(*) from "Option") opts'
)
console.log(`Instrumento intacto: ${quedan[0].dims} dimensiones, ${quedan[0].qs} preguntas, ${quedan[0].opts} opciones.`)
await pool.end()
