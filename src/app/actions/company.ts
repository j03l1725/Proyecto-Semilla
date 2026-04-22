'use server'

import prisma from '@/lib/prisma'

interface CompanyData {
    name: string
    contactName: string
    email: string
    phone?: string
    sector?: string
    province?: string
    city?: string
}

export async function registerCompany(data: CompanyData) {
    try {
        // 1 y 2. Verificar si el correo existe y actualizar sus datos con lo nuevo, o crearlo si es nuevo
        const company = await prisma.company.upsert({
            where: { email: data.email },
            update: {
                name: data.name,
                contactName: data.contactName,
                phone: data.phone,
                sector: data.sector,
                province: data.province,
                city: data.city,
            },
            create: {
                name: data.name,
                contactName: data.contactName,
                email: data.email,
                phone: data.phone,
                sector: data.sector,
                province: data.province,
                city: data.city,
            },
        })

        return { success: true, companyId: company.id, message: 'Registro/Actualización exitosa.' }
    } catch (error) {
        console.error('Error en registerCompany:', error)
        return { success: false, error: 'Ocurrió un error al registrar la empresa.' }
    }
}
