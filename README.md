# Medición del Nivel de Madurez Digital en Emprendimientos

Una plataforma web SaaS diseñada para evaluar y diagnosticar el estado tecnológico de pequeños y medianos emprendimientos, actuando como puente técnico entre la metodología académica y la realidad del usuario.

## Características Principales
1. **Captura y Registro (Fricción Cero)**: Landing page con captura inicial rápida.
2. **Motor de Evaluación**: Formulario interactivo, dinámico y condicional que asigna puntajes a las respuestas y calcula el nivel de madurez en tiempo real.
3. **Entrega de Valor**: Dashboard visual (Incipiente, Transición, Consolidado) y exportación de reporte en PDF con recomendaciones.

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
| `proyecto-semilla-5upp.vercel.app` | Supabase | Despliegue previo. Fue el enlace del artículo durante la revisión por pares; se mantiene en pie porque las versiones ya enviadas lo citan |

No comparten datos: un diagnóstico creado en uno no existe en el otro. Ambos se
despliegan solos con un `push` a `main` —Vercel por su integración con Git, el
VPS por `.github/workflows/deploy.yml`—.

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
