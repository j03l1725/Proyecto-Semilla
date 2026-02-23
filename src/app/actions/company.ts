'use server'

import prisma from '@/lib/prisma'

export async function registerCompany(data: { name: string; email: string; sector?: string; contactName?: string }) {
    try {
        // 1 y 2. Verificar si el correo existe y actualizar sus datos con lo nuevo, o crearlo si es nuevo
        const company = await prisma.company.upsert({
            where: { email: data.email },
            update: {
                name: data.name,
                sector: data.sector,
                contactName: data.contactName,
            },
            create: {
                name: data.name,
                email: data.email,
                sector: data.sector,
                contactName: data.contactName,
            },
        })

        return { success: true, companyId: company.id, message: 'Registro/Actualización exitosa.' }
    } catch (error) {
        console.error('Error en registerCompany:', error)
        return { success: false, error: 'Ocurrió un error al registrar la empresa.' }
    }
}
