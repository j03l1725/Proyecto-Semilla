/**
 * Catálogo de recomendaciones v3.0
 *
 * Texto accionable por dimensión y nivel de madurez. El reporte prioriza
 * las dimensiones con mayor brecha (análisis importancia-desempeño) y
 * muestra la recomendación correspondiente a su nivel actual.
 */

import type { MaturityLevel } from './scoring'

/** Recomendación específica por dimensión y nivel. */
export const RECOMMENDATIONS: Record<string, Record<MaturityLevel, string>> = {
    'Tecnologías y habilidades digitales': {
        Incipiente:
            'Renueve el equipamiento básico y asegure una conexión a internet estable y dedicada al negocio. Migre sus archivos a herramientas en la nube gratuitas (por ejemplo Google Workspace) para no depender de un único dispositivo.',
        'Transición':
            'Actualice los equipos que limitan el uso de software moderno y formalice un ecosistema colaborativo en la nube para todo el equipo de trabajo.',
        Consolidado:
            'Mantenga un plan de renovación tecnológica y aproveche su infraestructura para incorporar herramientas avanzadas de productividad e integración.',
    },
    'Comunicaciones y canales de venta': {
        Incipiente:
            'Habilite un canal de venta digital donde los clientes puedan al menos realizar pedidos (WhatsApp Business, redes sociales) e incorpore transferencias bancarias como medio de pago.',
        'Transición':
            'Integre una pasarela de pago o links de cobro en línea y configure respuestas rápidas o mensajes automáticos para la atención fuera de horario.',
        Consolidado:
            'Automatice la atención con chatbots o IA y consolide un canal donde el cliente complete todo el proceso de compra y pago sin intervención manual.',
    },
    'Organización y personas': {
        Incipiente:
            'Dedique tiempo a capacitación digital básica (tutoriales gratuitos) y empiece a coordinar el trabajo interno con herramientas digitales en lugar de mensajes informales.',
        'Transición':
            'Elabore un plan de desarrollo de habilidades digitales con temas y fechas, y adopte software de gestión de tareas para coordinar proyectos.',
        Consolidado:
            'Asigne presupuesto a capacitaciones certificadas periódicas y formalice el soporte técnico con servicios especializados, internos o tercerizados.',
    },
    'Estrategia y transformación digital': {
        Incipiente:
            'Defina un plan escrito mínimo de tecnología (qué herramientas, en qué orden y cuánto invertir) y establezca prácticas básicas de seguridad: contraseñas seguras y copias de respaldo.',
        'Transición':
            'Designe un responsable de las decisiones tecnológicas, incorpore el uso productivo de IA en tareas concretas y redacte una política de protección de datos personales de sus clientes.',
        Consolidado:
            'Consolide la gobernanza digital, integre la IA en sus procesos clave y mantenga una política formal de ciberseguridad y protección de datos alineada a la normativa ecuatoriana.',
    },
    'Datos y analítica': {
        Incipiente:
            'Deje de depender del papel o la memoria: registre la base de clientes en hojas de cálculo y guarde sus datos de contacto de forma ordenada.',
        'Transición':
            'Recopile historial de compras y preferencias de sus clientes, y revise reportes periódicos de ventas para apoyar sus decisiones.',
        Consolidado:
            'Adopte un CRM especializado y utilice tableros en tiempo real para personalizar la relación con el cliente y optimizar sus procesos.',
    },
    'Procesos': {
        Incipiente:
            'Sustituya el control manual de inventario y de cuentas por hojas de cálculo que se actualicen de forma periódica.',
        'Transición':
            'Implemente software de punto de venta o de gestión financiera que automatice inventario, facturación e impuestos.',
        Consolidado:
            'Integre sus sistemas para que una acción dispare procesos automáticos (por ejemplo con Zapier) y elimine tareas operativas repetitivas.',
    },
}

/** Mensaje global de encuadre según el nivel de madurez del DMI. */
export const GLOBAL_SUMMARY: Record<MaturityLevel, string> = {
    Incipiente:
        'Su negocio está en una etapa inicial de digitalización, con un uso mínimo y desarticulado de la tecnología. Las recomendaciones priorizadas a continuación marcan los primeros pasos de mayor impacto.',
    'Transición':
        'Su negocio incorpora tecnología de forma parcial y con objetivos definidos. El siguiente paso es integrar y profundizar las herramientas en las dimensiones más rezagadas.',
    Consolidado:
        'Su negocio integra la tecnología de forma estratégica. Mantenga la innovación y atienda las dimensiones con menor desempeño relativo para sostener su madurez digital.',
}

/** Devuelve la recomendación de una dimensión según su nivel. */
export function getRecommendation(dimension: string, level: MaturityLevel): string {
    return (
        RECOMMENDATIONS[dimension]?.[level] ??
        'Continúe fortaleciendo esta dimensión con herramientas digitales adecuadas al tamaño de su negocio.'
    )
}
