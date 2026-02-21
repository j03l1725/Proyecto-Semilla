import "dotenv/config";
import { PrismaClient } from '@prisma/client'

import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'

const connectionString = process.env["DIRECT_URL"] || process.env["DATABASE_URL"]

const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
    console.log('🌱 Iniciando el sembrado de datos (seed) con la Matriz Real (Sprint 5.1)...')

    // 0. Limpiar datos antiguos (Opcional, útil para resetear en desarrollo)
    console.log('Purgando registros de catálogo anteriores...')
    await prisma.option.deleteMany({})
    await prisma.question.deleteMany({})
    await prisma.dimension.deleteMany({})

    // 1. Crear Dimensiones Oficiales
    const dimensiones = [
        { name: 'Estrategia y Presencia Digital', description: 'Visibilidad online, canales de venta y marketing' },
        { name: 'Gestión de Clientes (CRM) y Ventas', description: 'Almacenamiento de datos, fidelización y seguimiento' },
        { name: 'Operaciones y Automatización', description: 'Inventario, reservas y flujos de trabajo repetitivos' },
        { name: 'Cultura de Innovación y Análisis de Datos (IA)', description: 'Capacitación del equipo, uso de IA y métricas' }
    ]

    for (const d of dimensiones) {
        await prisma.dimension.create({
            data: d,
        })
    }

    const d1 = await prisma.dimension.findFirst({ where: { name: 'Estrategia y Presencia Digital' } })
    const d2 = await prisma.dimension.findFirst({ where: { name: 'Gestión de Clientes (CRM) y Ventas' } })
    const d3 = await prisma.dimension.findFirst({ where: { name: 'Operaciones y Automatización' } })
    const d4 = await prisma.dimension.findFirst({ where: { name: 'Cultura de Innovación y Análisis de Datos (IA)' } })

    if (!d1 || !d2 || !d3 || !d4) {
        throw new Error("No se pudieron crear o encontrar las dimensiones.")
    }

    // 2. Crear Array de Preguntas y Opciones (Matriz Real)
    // Se elimina campo 'order' ya que no existe en el schema, Prisma las ordena por Date (createdAt)
    const seedData = [
        // --- Dimensión 1 ---
        {
            dimensionId: d1.id, text: '¿Cuál es el canal principal de ventas o captación de clientes de su emprendimiento?',
            options: [
                { text: 'Local físico o ventas de boca en boca sin canales digitales.', weight: 0 },
                { text: 'Redes sociales (Facebook, Instagram, TikTok) y WhatsApp estándar.', weight: 1 },
                { text: 'Comercio electrónico propio, catálogos integrados o aplicaciones de delivery.', weight: 2 }
            ]
        },
        {
            dimensionId: d1.id, text: '¿Cómo gestiona la creación de contenido y publicidad digital?',
            options: [
                { text: 'No realizo publicidad ni creo contenido.', weight: 0 },
                { text: 'Publico esporádicamente usando herramientas básicas de mi teléfono.', weight: 1 },
                { text: 'Uso herramientas profesionales (Canva, CapCut) y planifico campañas con presupuesto.', weight: 2 }
            ]
        },
        {
            dimensionId: d1.id, text: '¿Qué métodos de pago digitales ofrece a sus clientes?',
            options: [
                { text: 'Solo efectivo.', weight: 0 },
                { text: 'Efectivo y transferencias bancarias directas.', weight: 1 },
                { text: 'Pasarelas de pago (tarjetas de crédito/débito) y links de cobro online.', weight: 2 }
            ]
        },

        // --- Dimensión 2 ---
        {
            dimensionId: d2.id, text: '¿Cómo almacena y gestiona la información de sus clientes?',
            options: [
                { text: 'En una libreta física o no guardo información.', weight: 0 },
                { text: 'En hojas de cálculo (Excel/Google Sheets) o contactos del teléfono.', weight: 1 },
                { text: 'Utilizo un software CRM especializado (HubSpot, Zoho, etc.).', weight: 2 }
            ]
        },
        {
            dimensionId: d2.id, text: '¿Cómo maneja el seguimiento post-venta o la fidelización?',
            options: [
                { text: 'No hago seguimiento después de la venta.', weight: 0 },
                { text: 'Envío mensajes manuales a clientes frecuentes.', weight: 1 },
                { text: 'Tengo campañas automatizadas de email marketing o mensajes programados.', weight: 2 }
            ]
        },
        {
            dimensionId: d2.id, text: '¿Qué nivel de personalización ofrece en su atención al cliente?',
            options: [
                { text: 'Trato a todos los clientes por igual sin registrar su historial.', weight: 0 },
                { text: 'Reviso conversaciones pasadas manualmente antes de responder.', weight: 1 },
                { text: 'El sistema me muestra el historial de compras y preferencias automáticamente.', weight: 2 }
            ]
        },

        // --- Dimensión 3 ---
        {
            dimensionId: d3.id, text: '¿Cómo controla el inventario de sus productos o la agenda de servicios?',
            options: [
                { text: 'Control visual o manual.', weight: 0 },
                { text: 'Registro en hojas de cálculo actualizadas periódicamente.', weight: 1 },
                { text: 'Software de gestión (ERP), punto de venta (POS) o agenda online sincronizada.', weight: 2 }
            ]
        },
        {
            dimensionId: d3.id, text: '¿Utiliza alguna herramienta de automatización para tareas repetitivas?',
            options: [
                { text: 'No, todo el trabajo operativo se hace de forma 100% manual.', weight: 0 },
                { text: 'Uso herramientas básicas como respuestas rápidas en WhatsApp Business.', weight: 1 },
                { text: 'Uso integraciones avanzadas (Zapier, Make) o flujos de trabajo automatizados.', weight: 2 }
            ]
        },
        {
            dimensionId: d3.id, text: '¿Cómo maneja la atención al cliente fuera del horario comercial?',
            options: [
                { text: 'El cliente debe esperar al día siguiente sin recibir respuesta.', weight: 0 },
                { text: 'Tengo un mensaje automático de ausencia configurado.', weight: 1 },
                { text: 'Utilizo un Chatbot automatizado para precalificar o resolver dudas 24/7.', weight: 2 }
            ]
        },

        // --- Dimensión 4 ---
        {
            dimensionId: d4.id, text: '¿Utiliza modelos de Inteligencia Artificial (ChatGPT, Gemini, Claude) en su negocio?',
            options: [
                { text: 'No conozco o no utilizo herramientas de IA.', weight: 0 },
                { text: 'Las he probado esporádicamente para redactar textos o ideas.', weight: 1 },
                { text: 'La IA está integrada en mis procesos diarios de creatividad, análisis o atención.', weight: 2 }
            ]
        },
        {
            dimensionId: d4.id, text: '¿Cómo toma decisiones estratégicas para el crecimiento de su negocio?',
            options: [
                { text: 'Basado en la intuición y la experiencia diaria.', weight: 0 },
                { text: 'Reviso ingresos básicos y "likes" en redes sociales.', weight: 1 },
                { text: 'Analizo métricas clave (conversiones, retorno de inversión, costos de adquisición).', weight: 2 }
            ]
        },
        {
            dimensionId: d4.id, text: '¿Qué nivel de capacitación digital tiene el equipo de trabajo?',
            options: [
                { text: 'Conocimientos informáticos muy básicos.', weight: 0 },
                { text: 'Saben usar las herramientas actuales pero cuesta adaptar nuevas tecnologías.', weight: 1 },
                { text: 'Existe una cultura de aprendizaje continuo y adaptación rápida a nuevas herramientas.', weight: 2 }
            ]
        }
    ]

    console.log('Insertando preguntas y opciones...')


    // Inserción secuencial para asegurar que en la UI mantengan este mismo orden de inserción visual
    for (const item of seedData) {
        // Hacemos await artificial de 100ms para asegurar el orden temporal createdAt en la DB Postgres
        await new Promise(r => setTimeout(r, 100))
        await prisma.question.create({
            data: {
                text: item.text,
                dimensionId: item.dimensionId,
                options: {
                    create: item.options
                }
            }
        })
    }

    console.log('✅ Matriz de 12 preguntas oficiales insertadas correctamente con sus pesos (0-2).')
    console.log('🏁 Sembrado completado.')
}

main()
    .catch((e) => {
        console.error('❌ Error durante el seed:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
