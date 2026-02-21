import "dotenv/config";
import { PrismaClient } from '@prisma/client'

import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'

const connectionString = process.env["DIRECT_URL"] || process.env["DATABASE_URL"]

const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
    console.log('🌱 Iniciando el sembrado de datos (seed) con la Matriz Hexagonal (Sprint 5.1 Final)...')

    // 0. Limpiar datos antiguos para evitar duplicidad
    console.log('Purgando registros de catálogo anteriores...')
    await prisma.option.deleteMany({})
    await prisma.question.deleteMany({})
    await prisma.dimension.deleteMany({})

    // 1. Crear 6 Dimensiones Oficiales
    const dimensiones = [
        { name: 'Tecnologías y habilidades digitales', description: 'Equipamiento informático, internet y software' },
        { name: 'Comunicaciones y canales de venta', description: 'Transaccionalidad digital, métodos de pago y atención' },
        { name: 'Organización y personas', description: 'Capacitación, coordinación de trabajo interno y soporte' },
        { name: 'Estrategia y transformación digital', description: 'Planificación tecnológica, IA y ciberseguridad' },
        { name: 'Datos y analítica', description: 'Recopilación de datos de clientes, tipos de datos y análisis' },
        { name: 'Procesos', description: 'Control de inventario, finanzas y automatización de flujos' }
    ]

    for (const d of dimensiones) {
        await prisma.dimension.create({
            data: d,
        })
    }

    const d1 = await prisma.dimension.findFirst({ where: { name: 'Tecnologías y habilidades digitales' } })
    const d2 = await prisma.dimension.findFirst({ where: { name: 'Comunicaciones y canales de venta' } })
    const d3 = await prisma.dimension.findFirst({ where: { name: 'Organización y personas' } })
    const d4 = await prisma.dimension.findFirst({ where: { name: 'Estrategia y transformación digital' } })
    const d5 = await prisma.dimension.findFirst({ where: { name: 'Datos y analítica' } })
    const d6 = await prisma.dimension.findFirst({ where: { name: 'Procesos' } })

    if (!d1 || !d2 || !d3 || !d4 || !d5 || !d6) {
        throw new Error("No se pudieron crear o encontrar todas las 6 dimensiones.")
    }

    // 2. Crear Array de Preguntas y Opciones (Matriz Hexagonal - 18 Preguntas)
    const seedData = [
        // --- Dimensión 1: Tecnologías y habilidades digitales ---
        {
            dimensionId: d1.id, text: '¿Cómo describiría el equipamiento informático (computadoras, celulares) dedicado a su negocio?',
            options: [
                { text: 'Uso dispositivos personales básicos y antiguos.', weight: 0 },
                { text: 'Cuento con equipos dedicados, pero requieren actualización para usar software moderno.', weight: 1 },
                { text: 'Cuento con equipos modernos, actualizados y suficientes para la operación.', weight: 2 }
            ]
        },
        {
            dimensionId: d1.id, text: '¿Qué tipo de conexión a Internet utiliza en la empresa?',
            options: [
                { text: 'No tenemos internet fijo; usamos planes de datos móviles personales.', weight: 0 },
                { text: 'Conexión fija básica (ADSL o móvil) compartida con uso doméstico.', weight: 1 },
                { text: 'Conexión de fibra óptica o banda ancha de alta velocidad exclusiva para el negocio.', weight: 2 }
            ]
        },
        {
            dimensionId: d1.id, text: '¿Qué tipo de programas o aplicaciones de uso general utiliza diariamente?',
            options: [
                { text: 'Ninguno, o solo herramientas integradas en el celular (ej. notas, calculadora).', weight: 0 },
                { text: 'Programas básicos instalados en la computadora (Word, Excel tradicional).', weight: 1 },
                { text: 'Ecosistemas en la nube colaborativos (Google Workspace, Microsoft 365, almacenamiento en nube).', weight: 2 }
            ]
        },

        // --- Dimensión 2: Comunicaciones y canales de venta ---
        {
            dimensionId: d2.id, text: '¿Qué nivel de transaccionalidad tienen sus canales digitales (Redes, Web)?',
            options: [
                { text: 'Solo los usamos como vitrina informativa.', weight: 0 },
                { text: 'Recibimos pedidos por redes o WhatsApp, pero la gestión y pago es manual.', weight: 1 },
                { text: 'Los clientes cotizan, piden y pagan de forma autónoma (E-commerce integrado).', weight: 2 }
            ]
        },
        {
            dimensionId: d2.id, text: '¿Cuáles medios de pago tiene disponibles para sus clientes?',
            options: [
                { text: 'Solo aceptamos efectivo.', weight: 0 },
                { text: 'Efectivo y transferencias bancarias directas.', weight: 1 },
                { text: 'Billeteras electrónicas, pasarelas de pago (tarjetas) y links de cobro online.', weight: 2 }
            ]
        },
        {
            dimensionId: d2.id, text: '¿Cómo maneja la atención al cliente digital, especialmente fuera de horario?',
            options: [
                { text: 'Respondemos manualmente solo en horario laboral.', weight: 0 },
                { text: 'Tenemos mensajes de ausencia o respuestas rápidas configuradas.', weight: 1 },
                { text: 'Usamos Chatbots automatizados o Inteligencia Artificial para atención 24/7.', weight: 2 }
            ]
        },

        // --- Dimensión 3: Organización y personas ---
        {
            dimensionId: d3.id, text: '¿Se han capacitado los empleados (o usted) en temas digitales en los últimos 12 meses?',
            options: [
                { text: 'No nos hemos capacitado.', weight: 0 },
                { text: 'Aprendemos empíricamente o tomamos cursos gratuitos esporádicos.', weight: 1 },
                { text: 'Tenemos un presupuesto/plan para capacitaciones frecuentes (trimestrales/semestrales).', weight: 2 }
            ]
        },
        {
            dimensionId: d3.id, text: '¿La empresa utiliza software para coordinar el trabajo interno o proyectos?',
            options: [
                { text: 'No, coordinamos todo verbalmente o por mensajes personales.', weight: 0 },
                { text: 'Usamos grupos de WhatsApp o correos electrónicos.', weight: 1 },
                { text: 'Usamos software especializado de gestión de tareas (Asana, Trello, Planner).', weight: 2 }
            ]
        },
        {
            dimensionId: d3.id, text: '¿Cómo gestiona el soporte técnico o desarrollo tecnológico de la empresa?',
            options: [
                { text: 'Lo intentamos resolver nosotros mismos buscando en internet.', weight: 0 },
                { text: 'Pedimos ayuda informal a conocidos cuando algo se daña.', weight: 1 },
                { text: 'Contratamos servicios especializados (internos o tercerizados) para soporte o desarrollo.', weight: 2 }
            ]
        },

        // --- Dimensión 4: Estrategia y transformación digital ---
        {
            dimensionId: d4.id, text: '¿Existe un plan definido para aprovechar las tecnologías digitales en su empresa?',
            options: [
                { text: 'No tenemos un plan; implementamos cosas a medida que surgen emergencias.', weight: 0 },
                { text: 'Tenemos ideas aisladas de lo que queremos lograr (ej. vender más por redes).', weight: 1 },
                { text: 'Tenemos un plan estratégico con presupuesto e hitos de implementación tecnológica.', weight: 2 }
            ]
        },
        {
            dimensionId: d4.id, text: '¿Utiliza modelos de Inteligencia Artificial (ChatGPT, Gemini, etc.) estratégicamente?',
            options: [
                { text: 'No conozco o no utilizo herramientas de IA.', weight: 0 },
                { text: 'Las uso esporádicamente para redactar textos o buscar ideas.', weight: 1 },
                { text: 'La IA está integrada en procesos clave (creación, análisis, innovación).', weight: 2 }
            ]
        },
        {
            dimensionId: d4.id, text: '¿Qué medidas de ciberseguridad aplica en su negocio?',
            options: [
                { text: 'Ninguna, no usamos contraseñas seguras ni antivirus.', weight: 0 },
                { text: 'Usamos antivirus básico y respaldos manuales en USB de vez en cuando.', weight: 1 },
                { text: 'Políticas estrictas de contraseñas, respaldos automáticos en la nube y protección de datos.', weight: 2 }
            ]
        },

        // --- Dimensión 5: Datos y analítica ---
        {
            dimensionId: d5.id, text: '¿Cómo maneja actualmente la base de datos de sus clientes?',
            options: [
                { text: 'En papel o confiando en la memoria.', weight: 0 },
                { text: 'En hojas de cálculo estándar (Excel, Sheets).', weight: 1 },
                { text: 'En un software CRM especializado (HubSpot, Zoho, Salesforce).', weight: 2 }
            ]
        },
        {
            dimensionId: d5.id, text: '¿Qué tipos de datos recopila regularmente la empresa?',
            options: [
                { text: 'Solo lo necesario para la factura (nombre y cédula).', weight: 0 },
                { text: 'Datos de contacto y redes sociales para enviar promociones generales.', weight: 1 },
                { text: 'Historial de compras, preferencias, efectividad de campañas y calidad de servicio.', weight: 2 }
            ]
        },
        {
            dimensionId: d5.id, text: '¿Cómo utiliza esos datos para la toma de decisiones?',
            options: [
                { text: 'No realizamos análisis de datos.', weight: 0 },
                { text: 'Revisamos reportes básicos de ventas a fin de mes.', weight: 1 },
                { text: 'Usamos tableros (dashboards) en tiempo real para personalizar interacciones y optimizar procesos.', weight: 2 }
            ]
        },

        // --- Dimensión 6: Procesos ---
        {
            dimensionId: d6.id, text: '¿Cómo controla el inventario de productos o la agenda de servicios?',
            options: [
                { text: 'Control completamente manual o visual.', weight: 0 },
                { text: 'Registro en hojas de cálculo que se actualizan periódicamente.', weight: 1 },
                { text: 'Software de punto de venta (POS) o agenda online conectada en tiempo real.', weight: 2 }
            ]
        },
        {
            dimensionId: d6.id, text: '¿Utiliza software especializado para la gestión financiera y contable?',
            options: [
                { text: 'Llevamos las cuentas en un cuaderno.', weight: 0 },
                { text: 'Usamos Excel para llevar ingresos y egresos básicos.', weight: 1 },
                { text: 'Usamos software financiero/contable que automatiza facturación, impuestos y flujo de caja.', weight: 2 }
            ]
        },
        {
            dimensionId: d6.id, text: '¿Utiliza herramientas para la automatización de flujos de trabajo?',
            options: [
                { text: 'No, todas las tareas operativas son manuales.', weight: 0 },
                { text: 'Automatizaciones muy básicas (ej. correos programados).', weight: 1 },
                { text: 'Integración entre sistemas (ej. Zapier) donde una acción dispara múltiples procesos automáticos sin intervención humana.', weight: 2 }
            ]
        }
    ]

    console.log('Insertando 18 preguntas y 54 opciones...')

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

    console.log('✅ Matriz de 18 preguntas oficiales insertadas correctamente con sus pesos (0-2).')
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
