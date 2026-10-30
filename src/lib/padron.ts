import prisma from './prisma'

import type { EstadoPadron, FilaPadron } from './padronTipos'

/**
 * Estado derivado de cada persona del padrón según sus evaluaciones:
 * con alguna oficial es Oficial; si no, con alguna pendiente es Pendiente;
 * registrada pero sin ninguna de las dos, Registrado sin diagnóstico; sin
 * emprendimiento vinculado, Sin registro.
 */
export async function cargarPadron(): Promise<FilaPadron[]> {
    const ps = await prisma.participante.findMany({
        include: { company: { include: { assessments: { select: { estadoMuestra: true } } } } },
        orderBy: [{ enListado: 'desc' }, { nombre: 'asc' }],
    })
    return ps.map((p) => {
        const evs = p.company?.assessments ?? []
        const estado: EstadoPadron = !p.company
            ? 'Sin registro'
            : evs.some((e) => e.estadoMuestra === 'oficial')
              ? 'Oficial'
              : evs.some((e) => e.estadoMuestra === 'pendiente')
                ? 'Pendiente'
                : 'Registrado sin diagnóstico'
        return {
            id: p.id,
            nombre: p.nombre,
            companyId: p.companyId,
            enListado: p.enListado,
            firmo: p.filaAsistencia !== null,
            rol: p.rol,
            emprendimiento: p.company?.name ?? null,
            telefono: p.company?.phone ?? null,
            autoidentificacion: p.autoidentificacion,
            estado,
        }
    })
}

/** Embudo de cobertura sobre las personas del listado de emprendedores. */
export function embudo(filas: FilaPadron[]) {
    const listado = filas.filter((f) => f.enListado)
    const registrados = listado.filter((f) => f.estado !== 'Sin registro')
    const oficiales = listado.filter((f) => f.estado === 'Oficial')
    const pendientes = listado.filter((f) => f.estado === 'Pendiente')
    return {
        listado: listado.length,
        registrados: registrados.length,
        oficiales: oficiales.length,
        pendientes: pendientes.length,
        firmas: filas.filter((f) => f.firmo).length,
    }
}

/** Reparto de autoidentificación; los grupos de menos de 5 no se muestran por separado. */
export function autoidentificacionAgregada(filas: FilaPadron[]) {
    const cuenta = new Map<string, number>()
    for (const f of filas.filter((x) => x.rol === 'emprendedor')) {
        const k = f.autoidentificacion?.trim() || 'Sin dato'
        cuenta.set(k, (cuenta.get(k) ?? 0) + 1)
    }
    const visibles: { grupo: string; n: number }[] = []
    let ocultas = 0
    for (const [grupo, n] of cuenta) {
        if (n >= 5) visibles.push({ grupo, n })
        else ocultas += n
    }
    visibles.sort((a, b) => b.n - a.n)
    return { visibles, otras: ocultas === 0 ? null : ocultas >= 5 ? String(ocultas) : 'menos de 5' }
}
