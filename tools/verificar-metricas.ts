/**
 * Verifica las métricas de la muestra contra una base real.
 *
 *   DATABASE_URL=postgresql://... npx ts-node --compiler-options '{"module":"CommonJS"}' tools/verificar-metricas.ts
 *
 * Sale con código 1 si alguna cifra no coincide con la esperada. Los valores
 * esperados son los de la muestra del 2026-10-29 (n = 24). Para ver que la
 * prueba puede fallar, `VERIFICAR_ALTERAR=dmiMedio` suma 1 al esperado de esa
 * cifra y debe salir rojo.
 */
import { cargarCrudas } from '../src/lib/cargarEvaluaciones'
import { calcularMetricas, tCritico95 } from '../src/lib/metricas'

const r1 = (x: number) => Math.round(x * 10) / 10
const alterar = process.env.VERIFICAR_ALTERAR

interface Caso {
    clave: string
    nombre: string
    esperado: number | string
    obtenido: number | string | null
    tolerancia?: number
}

async function main() {
    const m = calcularMetricas(await cargarCrudas())
    const dim = (n: string) => m.porDimension.find((d) => d.nombre.startsWith(n))?.media ?? null
    const nivel = (n: string) => m.porNivel.find((x) => x.clave === n)?.n ?? null

    const casos: Caso[] = [
        { clave: 'n', nombre: 'n de la muestra', esperado: 24, obtenido: m.n },
        { clave: 'dmiMedio', nombre: 'DMI media', esperado: 18.8, obtenido: m.dmiMedio },
        { clave: 'dmiMediana', nombre: 'DMI mediana', esperado: 17.2, obtenido: m.dmiMediana },
        { clave: 'dmiDE', nombre: 'DMI desviación', esperado: 13.3, obtenido: m.dmiDesviacion },
        { clave: 'dmiMin', nombre: 'DMI mínimo', esperado: 2.8, obtenido: r1(m.dmiMin) },
        { clave: 'dmiMax', nombre: 'DMI máximo', esperado: 42.8, obtenido: r1(m.dmiMax) },
        { clave: 'icInf', nombre: 'IC95 inferior', esperado: 13.2, obtenido: m.dmiIC95?.inferior ?? null },
        { clave: 'icSup', nombre: 'IC95 superior', esperado: 24.4, obtenido: m.dmiIC95?.superior ?? null },
        { clave: 't24', nombre: 't crítico para n = 24', esperado: 2.069, obtenido: tCritico95(23), tolerancia: 0.002 },
        { clave: 'incipiente', nombre: 'Nivel Incipiente', esperado: 19, obtenido: nivel('Incipiente') },
        { clave: 'transicion', nombre: 'Nivel Transición', esperado: 5, obtenido: nivel('Transición') },
        { clave: 'consolidado', nombre: 'Nivel Consolidado', esperado: 0, obtenido: nivel('Consolidado') },
        { clave: 'procesos', nombre: 'Dimensión Procesos', esperado: 9.7, obtenido: dim('Procesos') },
        { clave: 'datos', nombre: 'Dimensión Datos', esperado: 14.6, obtenido: dim('Datos') },
        { clave: 'estrategia', nombre: 'Dimensión Estrategia', esperado: 18.3, obtenido: dim('Estrategia') },
        { clave: 'organizacion', nombre: 'Dimensión Organización', esperado: 18.8, obtenido: dim('Organización') },
        { clave: 'tecnologias', nombre: 'Dimensión Tecnologías', esperado: 24.3, obtenido: dim('Tecnologías') },
        { clave: 'comunicaciones', nombre: 'Dimensión Comunicaciones', esperado: 27.1, obtenido: dim('Comunicaciones') },
        { clave: 'alfa', nombre: 'Alfa de Cronbach, 21 ítems', esperado: 0.87, obtenido: m.alfaCronbach, tolerancia: 0.0005 },
        { clave: 'pctCero', nombre: '% de respuestas en 0', esperado: 64.7, obtenido: m.pctRespuestasEnCero },
        { clave: 'pctDos', nombre: '% de respuestas en 2', esperado: 2.2, obtenido: m.pctRespuestasEnDos },
        { clave: 'pendientes', nombre: 'Evaluaciones pendientes', esperado: 1, obtenido: m.nPendientes },
        { clave: 'excluidas', nombre: 'Evaluaciones excluidas', esperado: 9, obtenido: m.nExcluidas },
    ]

    let fallos = 0
    for (const c of casos) {
        const esperado = typeof c.esperado === 'number' && alterar === c.clave ? c.esperado + 1 : c.esperado
        const tol = c.tolerancia ?? 0.0001
        const ok =
            typeof esperado === 'number' && typeof c.obtenido === 'number'
                ? Math.abs(c.obtenido - esperado) <= tol
                : esperado === c.obtenido
        if (!ok) fallos++
        console.log(`${ok ? '✓' : '✗'} ${c.nombre}: esperado ${esperado}, obtenido ${c.obtenido}`)
    }
    console.log(fallos ? `\n${fallos} de ${casos.length} no cuadran` : `\n${casos.length} de ${casos.length} cuadran`)
    process.exit(fallos ? 1 : 0)
}

main().catch((e) => {
    console.error(e)
    process.exit(2)
})
