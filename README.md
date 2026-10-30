# Medición del Nivel de Madurez Digital en Emprendimientos

Una plataforma web SaaS diseñada para evaluar y diagnosticar el estado tecnológico de pequeños y medianos emprendimientos, actuando como puente técnico entre la metodología académica y la realidad del usuario.

## Características Principales
1. **Captura y Registro (Fricción Cero)**: Landing page con captura inicial rápida.
2. **Motor de Evaluación**: Formulario interactivo de 21 ítems que puntúa cada respuesta y calcula el nivel de madurez en tiempo real.
3. **Entrega de Valor**: Panel de resultados, enlace permanente recuperable y reporte en PDF membretado con plan de acción priorizado.
4. **Panel de investigación**: avance de la muestra, clasificación por niveles, dimensiones e ítems críticos, segmentación y exportación a CSV.

## Integridad del dato — lo que no se puede romper

Tres reglas que sostienen la validez de la muestra. Si alguna se toca, el índice
deja de ser comparable entre emprendimientos y el análisis no vale.

▸ **Un diagnóstico se guarda completo o no se guarda.** `submitAssessment` cuenta
las preguntas cubiertas contra `Question.count()` y rechaza el envío si falta
alguna. No es pulcritud: `Nᵢ` normaliza cada dimensión por el número de ítems
**respondidos**, así que una pregunta saltada produce un DMI que parece válido y
no lo es, y el reporte no distingue un caso del otro.

▲▲ **Esto ocurrió de verdad.** El avance automático del cuestionario encadenaba
dos saltos si llegaban dos clics seguidos, y el botón «Finalizar» solo miraba si
la pregunta *actual* estaba respondida. El 2026-09-01 una prueba guardó un
diagnóstico con 20 de 21 respuestas y la plataforma lo dio por bueno. Corregido en
las dos capas: el temporizador de avance se cancela antes de reprogramarse, el
botón exige las 21 y lleva a la primera que falte, y el servidor valida igual.

▸ **El histórico no se borra.** Antes cada nueva evaluación eliminaba las
anteriores del mismo emprendimiento. Eso contradecía la promesa del reporte
—«repita el diagnóstico para medir su avance»— y destruía el único dato
longitudinal que el proyecto puede producir. La muestra toma la evaluación más
reciente de cada emprendimiento; las anteriores quedan marcadas «superada».

▸ **Las respuestas del emprendedor sobreviven a una recarga.** Se guardan en
`localStorage` bajo `semilla_respuestas` y se recuperan al volver. En móvil con
datos inestables, perder veinte respuestas es perder al participante.

## Herramientas de verificación

```bash
npx tsx tools/verificar-catalogo.ts       # las 21 preguntas emparejan con su acción
npx tsx tools/render-pdf.tsx              # renderiza 6 perfiles de ejemplo a PDF
node tools/respaldo-y-limpieza.mjs        # respalda la base a CSV (sin borrar)
node tools/respaldo-y-limpieza.mjs --aplicar   # respalda y borra datos de participantes
```

▲ `tools/respaldos/` y `tools/salida-pdf/` están en `.gitignore`. Los respaldos
llevan correos y teléfonos y **este repositorio es público**.

▸ **`verificar-catalogo` es obligatorio si se toca el texto de una pregunta.** Las
acciones del reporte se emparejan con los ítems por un prefijo del texto
normalizado (`src/lib/acciones.ts`). Si un texto cambia y deja de emparejar, el
reporte cae en la recomendación genérica de la dimensión sin avisar de nada.

## Tecnologías Utilizadas
- **Frontend / Backend**: Next.js (App Router), React
- **Estilos**: Tailwind CSS, shadcn/ui
- **Base de Datos**: PostgreSQL en Supabase, Prisma ORM
- **Exportación**: React PDF

## Operación

### Dos despliegues, dos bases distintas

| Despliegue | Base de datos | Uso |
|---|---|---|
| `semilla.indoamericatech.com` | Postgres propio en el VPS | ★ El enlace citado en el artículo del TICEC desde la versión final del 2026-08-30. Despliegue institucional |
| `proyecto-semilla-5upp.vercel.app` | Supabase | Despliegue previo. Fue el enlace del artículo durante la revisión por pares. Desde el 2026-10-30 redirige con 308 a la URL oficial y ya no recoge datos. |

No comparten datos: un diagnóstico creado en uno no existe en el otro. Ambos se
despliegan solos con un `push` a `main` —Vercel por su integración con Git, el
VPS por `.github/workflows/deploy.yml`—.

▲▲ **El despliegue al VPS depende de que este repositorio sea público, y falla en
silencio si vuelve a privado.** `deploy.sh` hace `git fetch` con el remoto en HTTPS
y el servidor no tiene credenciales de GitHub: mientras el repositorio fue privado,
el paso moría con `could not read Username for 'https://github.com'` y exit 128.
Estuvo así del 2026-08-16 al 2026-08-30 sin que nadie lo notara —el sitio seguía en
pie sirviendo el build viejo, que es justo lo que lo hace difícil de ver—. Si hay
que volver a hacerlo privado, antes hay que darle credencial al servidor: una
*deploy key* SSH de solo lectura y el remoto cambiado a `git@github.com:`.

▸ **Cómo comprobar que un despliegue entró de verdad:** `gh run list --limit 1`, y
contrastar `git log --oneline -1` en `~/semilla-app` del VPS contra `origin/main`.

### Variables de entorno

| Variable | Obligatoria | Para qué |
|---|---|---|
| `DATABASE_URL` · `DIRECT_URL` | sí | Conexión a la base |
| `ADMIN_PASSWORD` | sí | Contraseña del panel. **Sin ella el panel queda inaccesible**: ya no existe contraseña por defecto en el código |
| `ADMIN_SESSION_SECRET` | no | Secreto de firma de la sesión. Si falta se usa `ADMIN_PASSWORD` |

### Mantener viva la base

El plan gratuito de Supabase pausa el proyecto tras siete días sin actividad, y
una vez pausado **solo se reactiva a mano** desde su panel. La versión final del
artículo ya no cita esta URL, pero sí lo hacen las versiones enviadas durante la
revisión, así que un cron en el VPS llama cada seis horas a `/api/health`,
que hace un `SELECT 1` y no devuelve ningún dato:

```
17 */6 * * * /home/joel-superadmin/keepalive-semilla/keepalive.sh
```

El registro queda en `~/keepalive-semilla/keepalive.log`.
