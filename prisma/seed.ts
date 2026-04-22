import "dotenv/config";
import { PrismaClient } from '@prisma/client'

import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'

const connectionString = process.env["DIRECT_URL"] || process.env["DATABASE_URL"]

const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
    console.log('🌱 Iniciando el sembrado de datos (seed) con el Cuestionario v2.0 (21 preguntas)...')

    // 0. Limpiar datos antiguos para evitar duplicidad
    console.log('Purgando registros de catálogo anteriores...')
    await prisma.option.deleteMany({})
    await prisma.question.deleteMany({})
    await prisma.dimension.deleteMany({})

    // 1. Crear 6 Dimensiones Oficiales
    const dimensiones = [
        { name: 'Tecnologías y habilidades digitales', description: 'Equipamiento informático, internet y software' },
        { name: 'Comunicaciones y canales de venta', description: 'Transaccionalidad digital, métodos de pago y atención' },
        { name: 'Organización y personas', description: 'Capacitación, plan de desarrollo, coordinación de trabajo interno y soporte' },
        { name: 'Estrategia y transformación digital', description: 'Planificación tecnológica, gobernanza, IA, ciberseguridad y protección de datos' },
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

    // 2. Crear Array de Preguntas y Opciones (Cuestionario v2.0 — 21 Preguntas)
    const seedData = [
        // ═══════════════════════════════════════════════════════════════
        // Dimensión 1: Tecnologías y habilidades digitales (3 preguntas)
        // ═══════════════════════════════════════════════════════════════
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

        // ═══════════════════════════════════════════════════════════════
        // Dimensión 2: Comunicaciones y canales de venta (3 preguntas)
        // ═══════════════════════════════════════════════════════════════
        {
            // 🔄 REFORMULADA v2: Se eliminó "transaccionalidad" por lenguaje accesible
            dimensionId: d2.id, text: '¿Qué pueden hacer sus clientes a través de sus canales digitales (redes sociales, página web)?',
            options: [
                { text: 'Solo pueden ver información sobre nuestros productos o servicios.', weight: 0 },
                { text: 'Pueden hacer pedidos por redes o WhatsApp, pero el pago y la gestión los hacemos manualmente.', weight: 1 },
                { text: 'Pueden buscar productos, hacer pedidos y pagar directamente en línea sin necesidad de contactarnos.', weight: 2 }
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

        // ═══════════════════════════════════════════════════════════════
        // Dimensión 3: Organización y personas (4 preguntas — +1 nueva)
        // ═══════════════════════════════════════════════════════════════
        {
            // 🔄 REFORMULADA v2: Enfocada en acción concreta de capacitación
            dimensionId: d3.id, text: '¿Usted o su equipo han aprendido a usar alguna herramienta digital nueva en el último año?',
            options: [
                { text: 'No, no hemos aprendido nada nuevo en tecnología.', weight: 0 },
                { text: 'Sí, hemos aprendido por cuenta propia o con tutoriales gratuitos de Internet.', weight: 1 },
                { text: 'Sí, hemos tomado cursos o talleres organizados (pagados o con certificación).', weight: 2 }
            ]
        },
        {
            // ➕ NUEVA v2: Plan de desarrollo de habilidades (derivada de P3.1 original)
            dimensionId: d3.id, text: '¿Tiene su negocio un plan para seguir desarrollando las habilidades digitales de su equipo?',
            options: [
                { text: 'No, no hemos pensado en eso.', weight: 0 },
                { text: 'Tenemos la intención de capacitarnos, pero no hay un plan o presupuesto definido.', weight: 1 },
                { text: 'Tenemos un plan con temas, fechas y presupuesto asignado para capacitaciones periódicas.', weight: 2 }
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

        // ═══════════════════════════════════════════════════════════════
        // Dimensión 4: Estrategia y transformación digital (5 preguntas — +2 nuevas)
        // ═══════════════════════════════════════════════════════════════
        {
            // 🔄 REFORMULADA v2: Se añadió explicación entre paréntesis
            dimensionId: d4.id, text: '¿Tiene su negocio un plan para incorporar o mejorar el uso de tecnología? (Por ejemplo: qué herramientas implementar, en qué orden, cuánto invertir y para cuándo)',
            options: [
                { text: 'No, vamos resolviendo las necesidades tecnológicas conforme aparecen.', weight: 0 },
                { text: 'Tenemos algunas ideas de lo que queremos lograr con tecnología, pero sin fechas ni presupuesto definido.', weight: 1 },
                { text: 'Tenemos un plan escrito con objetivos claros, herramientas a implementar, presupuesto asignado y fechas de ejecución.', weight: 2 }
            ]
        },
        {
            // ➕ NUEVA v2: Liderazgo y gobernanza digital
            dimensionId: d4.id, text: '¿Quién toma las decisiones sobre tecnología en su negocio y cómo se implementan los cambios?',
            options: [
                { text: 'Nadie en particular; los cambios tecnológicos se hacen solo cuando es urgente.', weight: 0 },
                { text: 'El dueño o gerente decide, pero no hay un proceso claro para implementar los cambios.', weight: 1 },
                { text: 'Hay una persona o equipo responsable de evaluar, planificar e implementar mejoras tecnológicas.', weight: 2 }
            ]
        },
        {
            // 🔄 REFORMULADA v2: Enfocada en uso productivo concreto de IA
            dimensionId: d4.id, text: '¿Utiliza herramientas de Inteligencia Artificial (como ChatGPT, Gemini, Copilot) para actividades productivas de su negocio?',
            options: [
                { text: 'No las conozco o no las he utilizado para mi negocio.', weight: 0 },
                { text: 'Las uso de vez en cuando para tareas puntuales (redactar textos, generar ideas, crear imágenes).', weight: 1 },
                { text: 'Las uso regularmente como parte de mis procesos del negocio (análisis de datos, atención al cliente, creación de contenido, automatización).', weight: 2 }
            ]
        },
        {
            // 🔄 REFORMULADA v2: Lenguaje cotidiano para ciberseguridad
            dimensionId: d4.id, text: '¿Qué hace su negocio para protegerse de ataques informáticos, virus o pérdida de información?',
            options: [
                { text: 'Nada en especial; no usamos contraseñas seguras ni programas de protección.', weight: 0 },
                { text: 'Usamos antivirus y de vez en cuando hacemos copias de nuestros archivos importantes.', weight: 1 },
                { text: 'Usamos contraseñas seguras, copias automáticas en la nube y mantenemos el software actualizado.', weight: 2 }
            ]
        },
        {
            // ➕ NUEVA v2: Protección de Datos Personales (PDP)
            dimensionId: d4.id, text: '¿Cómo maneja su negocio la información personal de sus clientes (nombres, correos, direcciones, compras)?',
            options: [
                { text: 'No tenemos un manejo especial; guardamos los datos sin reglas claras.', weight: 0 },
                { text: 'Tenemos cuidado con los datos, pero no hay una política escrita ni reglas formales.', weight: 1 },
                { text: 'Tenemos reglas claras sobre qué datos recopilamos, cómo los protegemos, y pedimos autorización a los clientes para usarlos.', weight: 2 }
            ]
        },

        // ═══════════════════════════════════════════════════════════════
        // Dimensión 5: Datos y analítica (3 preguntas)
        // ═══════════════════════════════════════════════════════════════
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

        // ═══════════════════════════════════════════════════════════════
        // Dimensión 6: Procesos (3 preguntas)
        // ═══════════════════════════════════════════════════════════════
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

    console.log(`Insertando ${seedData.length} preguntas y ${seedData.length * 3} opciones...`)

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

    console.log(`✅ Cuestionario v2.0: ${seedData.length} preguntas oficiales insertadas correctamente con sus pesos (0-2).`)
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
