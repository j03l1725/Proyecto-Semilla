/**
 * Verifica que cada uno de los 21 ítems de la base empareje con una entrada del
 * catálogo de acciones, y que ninguna entrada quede huérfana. Si esto falla, el
 * reporte cae en textos genéricos sin avisar, que es exactamente lo que el
 * catálogo v4.0 viene a corregir.
 */
import 'dotenv/config'
import { Pool } from 'pg'
import { CATALOGO, buscarItem, normalizar } from '../src/lib/acciones'
import { DIMENSION_ORDER } from '../src/lib/scoring'

const pool = new Pool({
    connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
})

async function main() {
    const { rows } = await pool.query(
        `select q.text, d.name as dimension, q."createdAt"
         from "Question" q join "Dimension" d on d.id = q."dimensionId"
         order by q."createdAt" asc`
    )

    let fallos = 0
    const emparejados = new Set<string>()

    console.log(`Preguntas en la base: ${rows.length}\n`)
    for (const r of rows) {
        const item = buscarItem(r.text)
        if (!item) {
            fallos++
            console.log(`✗ SIN EMPAREJAR  [${r.dimension}]`)
            console.log(`  texto      : ${r.text.slice(0, 90)}`)
            console.log(`  normalizado: ${normalizar(r.text).slice(0, 90)}\n`)
            continue
        }
        if (emparejados.has(item.codigo)) {
            fallos++
            console.log(`✗ DUPLICADO ${item.codigo} — dos preguntas emparejan con la misma entrada`)
            continue
        }
        emparejados.add(item.codigo)
        if (item.dimension !== r.dimension) {
            fallos++
            console.log(`✗ DIMENSIÓN ${item.codigo}: catálogo dice "${item.dimension}", base dice "${r.dimension}"`)
            continue
        }
        console.log(`✓ ${item.codigo}  ${item.etiqueta}`)
    }

    const huerfanas = CATALOGO.filter((i) => !emparejados.has(i.codigo))
    if (huerfanas.length) {
        fallos += huerfanas.length
        console.log(`\n✗ Entradas del catálogo sin pregunta en la base: ${huerfanas.map((i) => i.codigo).join(', ')}`)
    }

    const dimsMal = CATALOGO.filter((i) => !DIMENSION_ORDER.includes(i.dimension as never))
    if (dimsMal.length) {
        fallos += dimsMal.length
        console.log(`\n✗ Entradas con dimensión fuera de DIMENSION_ORDER: ${dimsMal.map((i) => i.codigo).join(', ')}`)
    }

    console.log(`\n${fallos === 0 ? '✓ Catálogo íntegro: 21/21' : `✗ ${fallos} fallo(s)`}`)
    await pool.end()
    process.exit(fallos === 0 ? 0 : 1)
}

main()
