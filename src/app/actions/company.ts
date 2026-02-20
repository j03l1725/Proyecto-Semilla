'use server'

import prisma from '@/lib/prisma'

export async function registerCompany(data: { name: string; email: string; sector?: string; contactName?: string }) {
    try {
        // 1. Verificar si el correo ya existe
        const existingCompany = await prisma.company.findUnique({
            where: { email: data.email },
        })

        if (existingCompany) {
            // Si existe, podemos retornar el ID existente para que continúe, 
            // o lanzar un error si queremos forzar a que sea único por intento.
            // Retornaremos el existente para "Zero-Friction" si retoma la prueba.
            return { success: true, companyId: existingCompany.id, message: 'Compañía existente encontrada.' }
        }

        // 2. Crear nueva compañía
        const newCompany = await prisma.company.create({
            data: {
                name: data.name,
                email: data.email,
                sector: data.sector,
                contactName: data.contactName,
            },
        })

        return { success: true, companyId: newCompany.id, message: 'Registro exitoso.' }
    } catch (error) {
        console.error('Error en registerCompany:', error)
        return { success: false, error: 'Ocurrió un error al registrar la empresa.' }
    }
}
