import "dotenv/config";
import { PrismaClient } from '@prisma/client'

import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'

const connectionString = process.env["DIRECT_URL"] || process.env["DATABASE_URL"]

const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
    console.log('🌱 Iniciando el sembrado de datos (seed)...')

    // 1. Crear Dimensiones
    const dimensiones = [
        { name: 'Infraestructura Tecnológica', description: 'Hardware, redes y herramientas base' },
        { name: 'Procesos y Operaciones', description: 'Automatización y flujos de trabajo internos' },
        { name: 'Gestión de Clientes (CRM)', description: 'Canales de venta, atención y relación con clientes' },
        { name: 'Cultura e Innovación', description: 'Mentalidad digital y capacitación del equipo' }
    ]

    for (const d of dimensiones) {
        await prisma.dimension.create({ data: d })
    }

    const dimClientes = await prisma.dimension.findFirst({ where: { name: 'Gestión de Clientes (CRM)' } })
    const dimProcesos = await prisma.dimension.findFirst({ where: { name: 'Procesos y Operaciones' } })

    // 2. Crear Preguntas de Prueba
    if (dimClientes && dimProcesos) {
        const p1 = await prisma.question.create({
            data: {
                text: '¿Cómo manejas actualmente la base de datos de tus clientes?',
                dimensionId: dimClientes.id,
                options: {
                    create: [
                        { text: 'En una libreta de papel o en mi cabeza.', weight: 1 },
                        { text: 'En hojas de cálculo (Excel, Google Sheets).', weight: 5 },
                        { text: 'Uso un software CRM especializado (HubSpot, Zoho, etc).', weight: 10 }
                    ]
                }
            }
        })

        const p2 = await prisma.question.create({
            data: {
                text: '¿Ofreces opciones de pago digital o pasarelas de pago?',
                dimensionId: dimClientes.id,
                options: {
                    create: [
                        { text: 'Solo recibo efectivo.', weight: 1 },
                        { text: 'Acepto transferencias bancarias y efectivo.', weight: 4 },
                        { text: 'Tengo pasarela de pago (tarjetas) y links de cobro online.', weight: 10 }
                    ]
                }
            }
        })

        const p3 = await prisma.question.create({
            data: {
                text: '¿Utilizas alguna herramienta de automatización o Chatbots (IA) para atención?',
                dimensionId: dimProcesos.id,
                options: {
                    create: [
                        { text: 'No, respondo todo manualmente una por una.', weight: 1 },
                        { text: 'Tengo respuestas rápidas configuradas en WhatsApp Business.', weight: 5 },
                        { text: 'Uso un chatbot automatizado o IA para precalificar clientes 24/7.', weight: 10 }
                    ]
                }
            }
        })

        console.log('✅ Preguntas de prueba insertadas correctamente.')
    }

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
