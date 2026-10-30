import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Histograma } from '@/components/charts/Histograma'
import { BarraNiveles } from '@/components/charts/BarraNiveles'
import { PuntosDimension } from '@/components/charts/PuntosDimension'
import { ItemsApilados } from '@/components/charts/ItemsApilados'
import { MapaCalor } from '@/components/charts/MapaCalor'
import { Embudo } from '@/components/charts/Embudo'
import { Seccion, Caja, TablaCaja, TH, TD } from '@/components/admin/Seccion'
import { Navegacion } from '@/components/admin/Navegacion'
import { ControlMuestra } from '@/components/admin/ControlMuestra'
import { TablaPadron } from '@/components/admin/TablaPadron'
import { calcularMetricas, revisionCalidad, META_MUESTRA, type TipoAviso } from '@/lib/metricas'
import { cargarCrudas } from '@/lib/cargarEvaluaciones'
import { cargarPadron, embudo, autoidentificacionAgregada } from '@/lib/padron'
import { ROTULO_ESTADO, type EstadoMuestra } from '@/lib/estadosMuestra'
import { corta, fechaCorta, n1 } from '@/lib/panel'
import { reportCode } from '@/lib/reporte'
import { logoutAdmin } from '@/app/actions/auth'
import { Download } from 'lucide-react'

// Panel con datos en vivo: se renderiza en cada petición, nunca se prerenderiza.
export const dynamic = 'force-dynamic'

const AVISO: Record<TipoAviso, string> = {
    repeticion: 'Repetición',
    'envio-rapido': 'Envío muy rápido',
    'dato-de-prueba': 'Posible dato de prueba',
    pendiente: 'Pendiente de decisión',
    'sector-vacio': 'Sector vacío',
}

function Tarjeta({ titulo, valor, pie }: { titulo: string; valor: string; pie: string }) {
    return (
        <div className="rounded-xl border border-border bg-white p-4 print:break-inside-avoid">
            <p className="text-xs font-medium text-[#5a5566]">{titulo}</p>
            <p className="mt-1 text-2xl font-bold text-tinta tabular-nums">{valor}</p>
            <p className="mt-1 text-xs text-[#6b6480] leading-snug">{pie}</p>
        </div>
    )
}

export default async function AdminDashboardPage() {
    const [crudas, padron] = await Promise.all([cargarCrudas(), cargarPadron()])
    const m = calcularMetricas(crudas)
    const avisos = revisionCalidad(m.todas)
    const emb = embudo(padron)
    const avance = Math.min(100, Math.round((m.n / META_MUESTRA) * 100))
    const faltan = Math.max(0, META_MUESTRA - m.n)
    const pendientes = m.todas.filter((e) => e.estadoMuestra === 'pendiente')
    const debil = m.porDimension[0]
    const critico = m.itemsCriticos[0]

    // Códigos anónimos para el mapa de calor: E01 es el DMI más alto.
    const perfiles = [...m.muestra]
        .sort((a, b) => b.dmi - a.dmi)
        .map((e, i) => ({ codigo: `E${String(i + 1).padStart(2, '0')}`, dmi: e.dmi, porDimension: e.porDimension }))

    const porContactar = padron.filter(
        (f) => f.rol === 'emprendedor' && f.enListado && (f.estado === 'Sin registro' || f.estado === 'Registrado sin diagnóstico')
    )
    const auto = autoidentificacionAgregada(padron)

    return (
        <div className="min-h-screen bg-morado-50">
            <header className="bg-[linear-gradient(100deg,#3c235f_0%,#241348_55%,#2c1852_100%)] px-4 sm:px-6 md:px-10 py-5 print:bg-white print:px-0">
                <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-5">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="/uti-oscuro-con-nombre.png" alt="Universidad Indoamérica" className="h-9 w-auto print:hidden" />
                        <div className="h-9 w-px bg-white/20 hidden sm:block print:hidden" />
                        <div>
                            <h1 className="text-2xl font-bold text-white print:text-black tracking-tight">Panel de investigación</h1>
                            <p className="text-sm text-morado-200/80 print:text-black">01/2026 · Madurez digital en microemprendimientos</p>
                        </div>
                    </div>
                    <form action={logoutAdmin} className="print:hidden">
                        <Button variant="outline" className="bg-transparent border-white/25 text-white hover:bg-naranja-500 hover:text-morado-950 hover:border-naranja-500">
                            Cerrar sesión
                        </Button>
                    </form>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 py-6 lg:grid lg:grid-cols-[200px_minmax(0,1fr)] lg:gap-10">
                <Navegacion pendientes={pendientes.length} />

                <main className="min-w-0 space-y-14 mt-6 lg:mt-0">
                    {/* 1. Resumen */}
                    <Seccion id="resumen" titulo="Resumen" descripcion="Avance de la muestra, cobertura del listado y las cifras principales. Solo cuentan las evaluaciones marcadas como oficiales.">
                        <Caja titulo="Avance de la muestra">
                            <div className="flex items-end justify-between mb-2">
                                <span className="text-4xl font-bold text-tinta tabular-nums">
                                    {m.n}
                                    <span className="text-xl text-[#6b6480] font-medium"> / {META_MUESTRA}</span>
                                </span>
                                <span className="text-sm font-semibold text-[#5a5566]">{avance} %</span>
                            </div>
                            <div className="w-full h-3 bg-morado-100 rounded-full overflow-hidden" role="progressbar" aria-valuenow={m.n} aria-valuemin={0} aria-valuemax={META_MUESTRA} aria-label="Avance de la muestra">
                                <div className="h-full bg-morado-700 rounded-full" style={{ width: `${avance}%` }} />
                            </div>
                            <p className="text-sm text-[#5a5566] mt-2">
                                {faltan > 0
                                    ? `Faltan ${faltan} emprendimientos para la muestra mínima de ${META_MUESTRA} comprometida en el proyecto.`
                                    : 'Muestra mínima alcanzada.'}
                                {pendientes.length > 0 ? ` Hay ${pendientes.length} evaluación pendiente de decisión, que no cuenta todavía.` : ''}
                            </p>
                        </Caja>

                        <Caja titulo="Cobertura del listado">
                            <Embudo
                                base={emb.listado}
                                etapas={[
                                    { rotulo: 'En el listado', n: emb.listado },
                                    { rotulo: 'Registrados en la plataforma', n: emb.registrados },
                                    { rotulo: 'Con diagnóstico oficial', n: emb.oficiales, detalle: m.n !== emb.oficiales ? `(la muestra tiene ${m.n}: ${m.n - emb.oficiales} sin vincular al listado)` : undefined },
                                    { rotulo: 'Con diagnóstico pendiente', n: emb.pendientes },
                                ]}
                            />
                            <p className="mt-3 text-sm text-[#5a5566]">
                                Aparte: {emb.firmas} firmas de asistencia en la sesión (incluye equipo de apoyo y personas fuera del listado).
                            </p>
                        </Caja>

                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                            <Tarjeta
                                titulo="DMI medio"
                                valor={n1(m.dmiMedio)}
                                pie={m.dmiIC95 ? `IC 95 % (t de Student, n = ${m.n}): ${n1(m.dmiIC95.inferior)} a ${n1(m.dmiIC95.superior)}` : 'Sin datos suficientes'}
                            />
                            <Tarjeta titulo="Mediana y desviación estándar" valor={`${n1(m.dmiMediana)} · ${n1(m.dmiDesviacion)}`} pie={`Rango ${n1(m.dmiMin)} a ${n1(m.dmiMax)}`} />
                            <Tarjeta
                                titulo="Alfa de Cronbach"
                                valor={m.alfaCronbach === null ? '—' : n1(m.alfaCronbach, 3)}
                                pie={`21 ítems, ${m.nParaAlfa} cuestionarios completos`}
                            />
                            <Tarjeta titulo="Dimensión más débil" valor={debil ? n1(debil.media) : '—'} pie={debil ? debil.nombre : 'Sin datos'} />
                            <Tarjeta
                                titulo="Ítem más crítico"
                                valor={critico ? `${critico.codigo} · ${n1(critico.media, 2)}` : '—'}
                                pie={critico ? `${critico.etiqueta}: ${critico.pctEnCero} % respondió 0 (media sobre 2)` : 'Sin datos'}
                            />
                            <Tarjeta titulo="Respuestas en 0 y en 2" valor={`${n1(m.pctRespuestasEnCero)} % · ${n1(m.pctRespuestasEnDos)} %`} pie="Del total de respuestas de la muestra" />
                        </div>

                        <div className="flex flex-wrap gap-3 print:hidden">
                            <a href="/api/export" download>
                                <Button size="sm" variant="outline"><Download className="h-4 w-4 mr-2" /> Exportación completa (CSV)</Button>
                            </a>
                            <a href="/api/export?anonima=1" download>
                                <Button size="sm" variant="outline"><Download className="h-4 w-4 mr-2" /> Exportación anónima (CSV)</Button>
                            </a>
                        </div>
                    </Seccion>

                    {/* 2. Niveles */}
                    <Seccion id="niveles" titulo="Niveles" descripcion="Dónde cae cada emprendimiento en el índice de madurez digital (DMI) y cómo se reparte entre los tres niveles.">
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                            <Caja titulo="Distribución del DMI">
                                <Histograma datos={m.histogramaDmi} />
                            </Caja>
                            <Caja titulo="Reparto por nivel">
                                <BarraNiveles datos={m.porNivel} />
                                <p className="mt-4 text-xs text-[#6b6480]">Umbrales: Incipiente hasta 33,33; Transición hasta 66,66; Consolidado por encima.</p>
                            </Caja>
                        </div>
                    </Seccion>

                    {/* 3. Dimensiones */}
                    <Seccion id="dimensiones" titulo="Dimensiones" descripcion="Media, dispersión y consistencia de las seis dimensiones, de la más débil a la más fuerte. Punto: media. Trazo grueso: más y menos una desviación estándar. Trazo fino: mínimo y máximo.">
                        <div className="space-y-4">
                            <Caja titulo="Media por dimensión (0-100)" className="max-w-2xl">
                                <PuntosDimension datos={m.porDimension} />
                            </Caja>
                            <TablaCaja minimo={520}>
                                <thead>
                                    <tr>
                                        <th className={TH}>Dimensión</th>
                                        <th className={`${TH} text-right`}>Media</th>
                                        <th className={`${TH} text-right`}>Mediana</th>
                                        <th className={`${TH} text-right`}>DE</th>
                                        <th className={`${TH} text-right`}>Máx.</th>
                                        <th className={`${TH} text-right`}>En cero</th>
                                        <th className={`${TH} text-right`}>Alfa</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {m.porDimension.map((d) => (
                                        <tr key={d.nombre}>
                                            <td className={TD}>{corta(d.nombre)}</td>
                                            <td className={`${TD} text-right tabular-nums font-semibold`}>{n1(d.media)}</td>
                                            <td className={`${TD} text-right tabular-nums`}>{n1(d.mediana)}</td>
                                            <td className={`${TD} text-right tabular-nums`}>{n1(d.desviacion)}</td>
                                            <td className={`${TD} text-right tabular-nums`}>{n1(d.max)}</td>
                                            <td className={`${TD} text-right tabular-nums`}>{d.enCero} de {m.n}</td>
                                            <td className={`${TD} text-right tabular-nums`}>{d.alfa === null ? '—' : n1(d.alfa, 2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </TablaCaja>
                        </div>
                    </Seccion>

                    {/* 4. Ítems */}
                    <Seccion id="items" titulo="Ítems" descripcion="Reparto de las respuestas 0, 1 y 2 en cada uno de los 21 ítems, del de menor al de mayor promedio. Las cifras dentro de las barras son recuentos.">
                        <Caja>
                            <ItemsApilados datos={m.distribucionItems} />
                        </Caja>
                        <Caja titulo="Los diez ítems más críticos">
                            <TablaCaja minimo={560}>
                                <thead>
                                    <tr>
                                        <th className={TH}>Ítem</th>
                                        <th className={TH}>Dimensión</th>
                                        <th className={`${TH} text-right`}>Media (0-2)</th>
                                        <th className={`${TH} text-right`}>En cero</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {m.itemsCriticos.slice(0, 10).map((it) => (
                                        <tr key={it.codigo}>
                                            <td className={TD}>
                                                <span className="font-mono text-[11px] text-[#6b6480] mr-2">{it.codigo}</span>
                                                {it.etiqueta}
                                            </td>
                                            <td className={`${TD} text-xs text-[#5a5566]`}>{corta(it.dimension)}</td>
                                            <td className={`${TD} text-right tabular-nums font-semibold`}>{n1(it.media, 2)}</td>
                                            <td className={`${TD} text-right tabular-nums`}>{it.enCero} ({n1(it.pctEnCero)} %)</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </TablaCaja>
                        </Caja>
                    </Seccion>

                    {/* 5. Perfiles */}
                    <Seccion id="perfiles" titulo="Perfiles" descripcion="Cada fila es un emprendimiento con código anónimo, ordenado del DMI más alto al más bajo. Más oscuro, mayor madurez.">
                        <MapaCalor filas={perfiles} />
                        <Caja titulo="Por sector">
                            <TablaCaja minimo={460}>
                                <thead>
                                    <tr>
                                        <th className={TH}>Sector</th>
                                        <th className={`${TH} text-right`}>n</th>
                                        <th className={`${TH} text-right`}>DMI medio</th>
                                        <th className={TH}>Lectura</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {m.porSector.map((s) => (
                                        <tr key={s.clave}>
                                            <td className={TD}>{s.clave}</td>
                                            <td className={`${TD} text-right tabular-nums`}>{s.n}</td>
                                            <td className={`${TD} text-right tabular-nums font-semibold`}>{n1(s.dmiMedio)}</td>
                                            <td className={`${TD} text-xs text-[#5a5566]`}>{s.n < 5 ? '▲ Solo descriptivo (n menor que 5)' : 'Comparable'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </TablaCaja>
                        </Caja>
                    </Seccion>

                    {/* 6. Participantes */}
                    <Seccion id="participantes" titulo="Participantes" descripcion="Padrón de la sesión con el estado de cada persona frente a la plataforma.">
                        <Caja titulo={`A quién falta contactar (${porContactar.length})`}>
                            {porContactar.length === 0 ? (
                                <p className="text-sm text-[#5a5566]">Todas las personas del listado tienen diagnóstico.</p>
                            ) : (
                                <ul className="divide-y divide-border text-sm">
                                    {porContactar.map((f) => (
                                        <li key={f.id} className="py-2 flex flex-wrap justify-between gap-x-4 gap-y-0.5">
                                            <span className="text-tinta">{f.nombre}</span>
                                            <span className="text-[#5a5566] text-xs">
                                                {f.estado}
                                                {f.telefono ? ` · ${f.telefono}` : ''}
                                                {f.firmo ? ' · firmó la asistencia' : ' · no firmó'}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </Caja>
                        <Caja titulo="Autoidentificación de los emprendedores del padrón">
                            <ul className="text-sm space-y-1">
                                {auto.visibles.map((a) => (
                                    <li key={a.grupo} className="tabular-nums">{a.grupo}: {a.n}</li>
                                ))}
                                {auto.otras ? <li className="text-[#5a5566]">Otras autoidentificaciones: {auto.otras}</li> : null}
                            </ul>
                            <p className="mt-2 text-xs text-[#6b6480]">Los grupos de menos de 5 personas no se muestran por separado.</p>
                        </Caja>
                        <TablaPadron filas={padron} />
                    </Seccion>

                    {/* 7. Calidad y registros */}
                    <Seccion id="calidad" titulo="Calidad y registros" descripcion="Avisos automáticos que no cambian nada por sí solos, bandeja de evaluaciones pendientes y el estado de cada registro.">
                        <Caja titulo={`Bandeja de entrada: pendientes de decisión (${pendientes.length})`} className={pendientes.length ? 'border-naranja-500 border-2' : ''}>
                            {pendientes.length === 0 ? (
                                <p className="text-sm text-[#5a5566]">No hay evaluaciones pendientes.</p>
                            ) : (
                                <ul className="space-y-4">
                                    {pendientes.map((e) => (
                                        <li key={e.id} className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                                            <div className="text-sm">
                                                <p className="font-semibold text-tinta">{e.companyName}</p>
                                                <p className="text-[#5a5566]">
                                                    {fechaCorta(e.createdAt)} · DMI {n1(e.dmi)} · {e.level}
                                                </p>
                                                {e.motivoMuestra ? <p className="text-xs text-[#6b6480] mt-1 max-w-md">{e.motivoMuestra}</p> : null}
                                                <Link href={`/admin/${e.id}`} className="text-xs text-morado-600 underline">Ver detalle</Link>
                                            </div>
                                            <ControlMuestra assessmentId={e.id} estado={e.estadoMuestra} motivo={e.motivoMuestra} />
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </Caja>

                        <Caja titulo={`Avisos de revisión (${avisos.length})`}>
                            {avisos.length === 0 ? (
                                <p className="text-sm text-[#5a5566]">Sin avisos.</p>
                            ) : (
                                <ul className="space-y-1.5 text-sm">
                                    {avisos.map((a, i) => (
                                        <li key={i}>
                                            <span aria-hidden className="text-naranja-600 mr-1.5">▲</span>
                                            <span className="font-semibold text-tinta">{AVISO[a.tipo]}.</span> {a.companyName}: {a.texto}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </Caja>

                        <TablaCaja minimo={880}>
                            <thead>
                                <tr>
                                    <th className={TH}>Emprendimiento</th>
                                    <th className={TH}>Reporte</th>
                                    <th className={TH}>Fecha</th>
                                    <th className={`${TH} text-right`}>DMI</th>
                                    <th className={TH}>Estado</th>
                                    <th className={TH}>Motivo</th>
                                    <th className={`${TH} print:hidden`}>Cambiar</th>
                                </tr>
                            </thead>
                            <tbody>
                                {m.todas.map((e) => {
                                    const r = ROTULO_ESTADO[e.estadoMuestra as EstadoMuestra] ?? { texto: e.estadoMuestra, marca: '?' }
                                    return (
                                        <tr key={e.id}>
                                            <td className={TD}>
                                                <Link href={`/admin/${e.id}`} className="text-morado-700 underline underline-offset-2">{e.companyName}</Link>
                                            </td>
                                            <td className={`${TD} font-mono text-[11px] text-[#6b6480]`}>{reportCode(e.id, e.createdAt)}</td>
                                            <td className={`${TD} text-xs whitespace-nowrap`}>{fechaCorta(e.createdAt)}</td>
                                            <td className={`${TD} text-right tabular-nums font-semibold`}>{n1(e.dmi)}</td>
                                            <td className={`${TD} whitespace-nowrap`}>
                                                <span aria-hidden className="mr-1.5">{r.marca}</span>
                                                {r.texto}
                                                {e.superada ? <div className="text-xs text-[#6b6480]">Reemplazada por otra más reciente</div> : null}
                                            </td>
                                            <td className={`${TD} text-xs text-[#5a5566] max-w-[260px]`}>{e.motivoMuestra ?? '—'}</td>
                                            <td className={`${TD} print:hidden`}>
                                                <details>
                                                    <summary className="cursor-pointer text-sm text-morado-700 underline underline-offset-2">Cambiar estado</summary>
                                                    <div className="mt-2">
                                                        <ControlMuestra assessmentId={e.id} estado={e.estadoMuestra} motivo={e.motivoMuestra} />
                                                    </div>
                                                </details>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </TablaCaja>
                    </Seccion>
                </main>
            </div>
        </div>
    )
}
