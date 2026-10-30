'use server'

import prisma from '@/lib/prisma'
import { esSector } from '@/lib/sectores'

interface CompanyData {
    name: string
    contactName: string
    email: string
    phone?: string
    sector: string
    province?: string
    city?: string
    /** El consentimiento se aceptó en el formulario; el servidor pone la hora. */
    consent: boolean
}

export async function registerCompany(data: CompanyData) {
    try {
        // El correo es la clave del registro: sin espacios ni mayúsculas, para que
        // “Ana@Correo.com ” y “ana@correo.com” sean el mismo emprendimiento.
        const email = data.email.trim().toLowerCase()

        if (!esSector(data.sector)) {
            return { success: false, error: 'Selecciona a qué se dedica tu negocio.' }
        }
        if (data.consent !== true) {
            return { success: false, error: 'Debes aceptar el consentimiento para continuar.' }
        }

        // El mismo valor en `sector` y `sectorCodigo`; la hora del consentimiento
        // la fija el servidor, no el navegador.
        const campos = {
            name: data.name,
            contactName: data.contactName,
            phone: data.phone,
            sector: data.sector,
            sectorCodigo: data.sector,
            province: data.province,
            city: data.city,
            consentimientoAt: new Date(),
        }

        const company = await prisma.company.upsert({
            where: { email },
            update: campos,
            create: { ...campos, email },
        })

        return { success: true, companyId: company.id, message: 'Registro/Actualización exitosa.' }
    } catch (error) {
        console.error('Error en registerCompany:', error)
        return { success: false, error: 'Ocurrió un error al registrar la empresa.' }
    }
}
