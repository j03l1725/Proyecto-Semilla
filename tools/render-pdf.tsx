/**
 * Renderiza el reporte PDF fuera de la aplicación, con perfiles sintéticos
 * construidos sobre las preguntas y opciones reales de la base. Sirve para
 * revisar el documento sin pasar por el navegador y para comprobar que las
 * acciones por ítem se disparan con los textos de producción.
 *
 *   npx tsx tools/render-pdf.tsx [carpeta]
 */
import 'dotenv/config'
import React from 'react'
import fs from 'node:fs'
import path from 'node:path'
import { Pool } from 'pg'
import ReactPDF from '@react-pdf/renderer'
import { AssessmentReport } from '../src/components/pdf/AssessmentReport'
import { computeAssessmentResult, type ScoringAnswer } from '../src/lib/scoring'

const RAIZ = path.resolve(__dirname, '..')
const LOGO = path.join(RAIZ, 'public/indoamerica-membrete.png')

interface PreguntaBD {
    text: string
    dimension: string
    opciones: { text: string; weight: number }[]
}

/** Perfil de respuesta: qué peso elegir en el ítem n de cada dimensión. */
interface Perfil {
    archivo: string
    empresa: string
    contacto: string
    sector: string
    ciudad: string
    provincia: string
    /** Pesos por dimensión, un valor por ítem, en el orden del cuestionario. */
    pesos: Record<string, number[]>
}

const DIMS = [
    'Tecnologías y habilidades digitales',
    'Comunicaciones y canales de venta',
    'Organización y personas',
    'Estrategia y transformación digital',
    'Datos y analítica',
    'Procesos',
]

const PERFILES: Perfil[] = [
    {
        archivo: '1-incipiente',
        empresa: 'Panadería Doña Rosa',
        contacto: 'Rosa Vaca Quishpe',
        sector: 'Alimentos',
        ciudad: 'Cayambe',
        provincia: 'Pichincha',
        pesos: {
            [DIMS[0]]: [0, 1, 0],
            [DIMS[1]]: [1, 0, 0],
            [DIMS[2]]: [1, 0, 0, 0],
            [DIMS[3]]: [0, 0, 0, 0, 0],
            [DIMS[4]]: [0, 0, 0],
            [DIMS[5]]: [0, 0, 1],
        },
    },
    {
        archivo: '2-transicion',
        empresa: 'Cafetería Aroma Andino',
        contacto: 'María Salazar',
        sector: 'Alimentos y bebidas',
        ciudad: 'Quito',
        provincia: 'Pichincha',
        pesos: {
            [DIMS[0]]: [2, 1, 1],
            [DIMS[1]]: [1, 1, 1],
            [DIMS[2]]: [1, 0, 1, 0],
            [DIMS[3]]: [1, 1, 1, 0, 0],
            [DIMS[4]]: [1, 0, 0],
            [DIMS[5]]: [1, 1, 1],
        },
    },
    {
        archivo: '3-consolidado',
        empresa: 'Tecno Servicios Quito',
        contacto: 'Andrés Puma',
        sector: 'Servicios TI',
        ciudad: 'Quito',
        provincia: 'Pichincha',
        pesos: {
            [DIMS[0]]: [2, 2, 2],
            [DIMS[1]]: [2, 2, 2],
            [DIMS[2]]: [2, 2, 2, 1],
            [DIMS[3]]: [2, 2, 2, 2, 1],
            [DIMS[4]]: [2, 1, 2],
            [DIMS[5]]: [2, 1, 2],
        },
    },
    {
        archivo: '4-perfecto',
        empresa: 'Empresa Modelo del Techo',
        contacto: 'Ana Torres',
        sector: 'Tecnología',
        ciudad: 'Ambato',
        provincia: 'Tungurahua',
        pesos: Object.fromEntries(DIMS.map((d, i) => [d, Array(([3, 3, 4, 5, 3, 3])[i]).fill(2)])),
    },
    {
        archivo: '5-cero',
        empresa: 'Emprendimiento en Cero',
        contacto: 'Luis Mena',
        sector: 'Artesanías',
        ciudad: 'Otavalo',
        provincia: 'Imbabura',
        pesos: Object.fromEntries(DIMS.map((d, i) => [d, Array(([3, 3, 4, 5, 3, 3])[i]).fill(0)])),
    },
    {
        archivo: '6-nombre-largo',
        empresa: 'Asociación de Producción Textil Artesanal Manos Unidas del Cantón Pujilí',
        contacto: 'María de los Ángeles Chuquimarca Tenelema',
        sector: 'Manufactura textil y confección de prendas de vestir por encargo',
        ciudad: 'Pujilí',
        provincia: 'Cotopaxi',
        pesos: {
            [DIMS[0]]: [1, 1, 1],
            [DIMS[1]]: [0, 1, 0],
            [DIMS[2]]: [0, 0, 1, 0],
            [DIMS[3]]: [0, 1, 0, 1, 0],
            [DIMS[4]]: [1, 1, 0],
            [DIMS[5]]: [0, 1, 0],
        },
    },
]

async function cargarPreguntas(): Promise<PreguntaBD[]> {
    // El servidor remoto exige SSL; el contenedor de pruebas local no lo
    // soporta y la conexion fallaba antes de leer una sola pregunta.
    const cadena = process.env.DIRECT_URL || process.env.DATABASE_URL
    const esLocal = /@(localhost|127\.0\.0\.1)[:/]/.test(cadena ?? '')
    const pool = new Pool({
        connectionString: cadena,
        ssl: esLocal ? false : { rejectUnauthorized: false },
    })
    const { rows } = await pool.query(
        `select q.text, d.name as dimension, o.text as opcion, o.weight
         from "Question" q
         join "Dimension" d on d.id = q."dimensionId"
         join "Option" o on o."questionId" = q.id
         order by q."createdAt" asc, o.weight asc`
    )
    await pool.end()

    const mapa = new Map<string, PreguntaBD>()
    for (const r of rows) {
        if (!mapa.has(r.text)) mapa.set(r.text, { text: r.text, dimension: r.dimension, opciones: [] })
        mapa.get(r.text)!.opciones.push({ text: r.opcion, weight: r.weight })
    }
    return [...mapa.values()]
}

function respuestasDe(perfil: Perfil, preguntas: PreguntaBD[]): ScoringAnswer[] {
    const contador: Record<string, number> = {}
    return preguntas.map((q) => {
        const i = contador[q.dimension] ?? 0
        contador[q.dimension] = i + 1
        const peso = perfil.pesos[q.dimension]?.[i] ?? 0
        const opcion = q.opciones.find((o) => o.weight === peso) ?? q.opciones[0]
        return {
            dimension: q.dimension,
            weight: opcion.weight,
            questionText: q.text,
            optionText: opcion.text,
        }
    })
}

async function main() {
    const salida = path.resolve(process.argv[2] || 'tools/salida-pdf')
    fs.mkdirSync(salida, { recursive: true })

    const preguntas = await cargarPreguntas()
    console.log(`Preguntas cargadas de la base: ${preguntas.length}\n`)

    for (const perfil of PERFILES) {
        const respuestas = respuestasDe(perfil, preguntas)
        const r = computeAssessmentResult(respuestas)
        const archivo = path.join(salida, `${perfil.archivo}.pdf`)

        const doc = React.createElement(AssessmentReport, {
            companyName: perfil.empresa,
            contactName: perfil.contacto,
            sector: perfil.sector,
            city: perfil.ciudad,
            province: perfil.provincia,
            date: '1 de septiembre de 2026',
            dmi: r.dmi,
            level: r.level,
            totalRawScore: r.totalRawScore,
            maxRawScore: respuestas.length * 2,
            dimensions: r.dimensions,
            priorities: r.priorities,
            reportCode: `PS-2026-${perfil.archivo.slice(0, 8).toUpperCase().padEnd(8, 'X')}`,
            verifyUrl: 'semilla.indoamericatech.com/dashboard/ejemplo',
            verifyHref: 'https://semilla.indoamericatech.com/dashboard/ejemplo',
            logoSrc: LOGO,
        })

        // @ts-expect-error - la firma de ReactPDF.render no está tipada para Node
        await ReactPDF.render(doc, archivo)

        const conAccion = respuestas.filter((a) => a.weight < 2).length
        console.log(
            `${perfil.archivo.padEnd(16)} DMI ${String(r.dmi).padStart(5)}  ${r.level.padEnd(12)}` +
            `  ítems mejorables ${String(conAccion).padStart(2)}/21  -> ${path.basename(archivo)}`
        )
    }
}

main()
