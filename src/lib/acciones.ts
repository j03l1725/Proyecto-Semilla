/**
 * Catálogo de acciones por ítem — v4.0
 *
 * El catálogo v3.0 tenía 18 textos: 6 dimensiones × 3 niveles. Eso significaba
 * que un negocio que falla en ciberseguridad y otro que falla en protección de
 * datos personales recibían exactamente el mismo párrafo, porque ambos ítems
 * viven en la dimensión «Estrategia». El emprendedor leía un consejo que no se
 * parecía a su respuesta.
 *
 * Aquí cada uno de los 21 ítems tiene una acción concreta para cada nivel de
 * respuesta en el que se puede mejorar (0 = no lo hace, 1 = lo hace a medias).
 * Un ítem respondido con 2 no genera acción: ya está en el techo de la escala.
 *
 * Cada acción declara esfuerzo, costo y plazo sugerido, de modo que el reporte
 * pueda componer una hoja de ruta de 30/60/90 días en lugar de una lista plana.
 */

import { DIMENSION_ORDER } from './scoring'

export type Esfuerzo = 'bajo' | 'medio' | 'alto'
export type Costo = 'gratis' | 'bajo' | 'medio'
export type Plazo = 30 | 60 | 90

export interface Accion {
    /** Qué hacer, en imperativo y en una línea. */
    titulo: string
    /** Cómo hacerlo, concreto y verificable. */
    detalle: string
    /** Herramientas nombradas. Vacío cuando la acción no requiere ninguna. */
    herramientas: string[]
    esfuerzo: Esfuerzo
    costo: Costo
    plazo: Plazo
}

export interface ItemCatalogo {
    /** Código estable del ítem: D<dimensión>.<orden dentro de la dimensión>. */
    codigo: string
    /** Dimensión a la que pertenece (debe existir en DIMENSION_ORDER). */
    dimension: string
    /** Etiqueta corta del ítem, para encabezar la acción en el reporte. */
    etiqueta: string
    /** Prefijo normalizado del texto de la pregunta, usado para el emparejamiento. */
    claveTexto: string
    /** Acción cuando la respuesta fue 0. */
    nivel0: Accion
    /** Acción cuando la respuesta fue 1. */
    nivel1: Accion
}

const [D1, D2, D3, D4, D5, D6] = DIMENSION_ORDER

export const CATALOGO: ItemCatalogo[] = [
    /* ── D1 · Tecnologías y habilidades digitales ─────────────────────── */
    {
        codigo: 'D1.1',
        dimension: D1,
        etiqueta: 'Equipamiento informático',
        claveTexto: 'como describiria el equipamiento informatico',
        nivel0: {
            titulo: 'Separe un equipo para el negocio',
            detalle:
                'Trabajar desde un celular personal mezcla la información del negocio con la familiar y se pierde cuando el equipo falla. Destine un computador —aunque sea de segunda mano— exclusivamente al negocio, y defina un monto mensual fijo de reserva para su reposición.',
            herramientas: [],
            esfuerzo: 'medio',
            costo: 'medio',
            plazo: 90,
        },
        nivel1: {
            titulo: 'Priorice qué equipo renovar primero',
            detalle:
                'Liste sus equipos con su antigüedad e identifique cuál es el que hoy le impide usar un software que necesita. Renueve ese primero, no todos a la vez.',
            herramientas: [],
            esfuerzo: 'bajo',
            costo: 'medio',
            plazo: 90,
        },
    },
    {
        codigo: 'D1.2',
        dimension: D1,
        etiqueta: 'Conexión a internet',
        claveTexto: 'que tipo de conexion a internet utiliza',
        nivel0: {
            titulo: 'Contrate internet fijo en el local',
            detalle:
                'Depender de datos móviles limita las ventas en línea, la facturación electrónica y las copias de respaldo. Cotice un plan fijo básico con al menos dos proveedores de su zona antes de contratar.',
            herramientas: [],
            esfuerzo: 'bajo',
            costo: 'bajo',
            plazo: 30,
        },
        nivel1: {
            titulo: 'Separe la conexión del negocio de la doméstica',
            detalle:
                'Si la misma conexión sirve a la casa y al negocio, la atención al cliente compite con el consumo familiar. Configure una red aparte para el negocio en el router, o suba de plan si el ancho de banda se satura en horas de venta.',
            herramientas: [],
            esfuerzo: 'bajo',
            costo: 'bajo',
            plazo: 60,
        },
    },
    {
        codigo: 'D1.3',
        dimension: D1,
        etiqueta: 'Programas de uso diario',
        claveTexto: 'que tipo de programas o aplicaciones de uso general',
        nivel0: {
            titulo: 'Abra una cuenta en la nube para el negocio',
            detalle:
                'Cree una cuenta gratuita a nombre del negocio y mueva ahí sus documentos, precios y listas de clientes. Deja de depender de un solo teléfono y le permite trabajar desde cualquier equipo.',
            herramientas: ['Google Workspace (gratuito)', 'Microsoft 365 básico'],
            esfuerzo: 'bajo',
            costo: 'gratis',
            plazo: 30,
        },
        nivel1: {
            titulo: 'Suba sus archivos de trabajo a la nube',
            detalle:
                'Tener Word y Excel instalados en una sola máquina significa que si esa máquina falla, el negocio se detiene. Traslade las hojas de cálculo que usa a diario a Google Drive o OneDrive y compártalas con quien las necesite.',
            herramientas: ['Google Drive', 'OneDrive'],
            esfuerzo: 'bajo',
            costo: 'gratis',
            plazo: 30,
        },
    },

    /* ── D2 · Comunicaciones y canales de venta ───────────────────────── */
    {
        codigo: 'D2.1',
        dimension: D2,
        etiqueta: 'Qué puede hacer el cliente en sus canales',
        claveTexto: 'que pueden hacer sus clientes a traves de sus canales digitales',
        nivel0: {
            titulo: 'Permita que le hagan pedidos, no solo que lo vean',
            detalle:
                'Un canal donde solo se exhibe información obliga al cliente a dar un paso más para comprar, y ahí se pierde la venta. Habilite pedidos por WhatsApp Business con catálogo de productos y precios visibles.',
            herramientas: ['WhatsApp Business', 'Catálogo de Instagram'],
            esfuerzo: 'bajo',
            costo: 'gratis',
            plazo: 30,
        },
        nivel1: {
            titulo: 'Cierre la venta sin intervención manual',
            detalle:
                'Hoy el pedido llega solo y el cobro lo hace usted a mano. Publique un catálogo con link de pago por producto para que el cliente complete la compra sin esperarlo.',
            herramientas: ['Tienda de WhatsApp Business', 'Links de cobro de su banco'],
            esfuerzo: 'medio',
            costo: 'bajo',
            plazo: 60,
        },
    },
    {
        codigo: 'D2.2',
        dimension: D2,
        etiqueta: 'Medios de pago',
        claveTexto: 'cuales medios de pago tiene disponibles',
        nivel0: {
            titulo: 'Acepte transferencias además de efectivo',
            detalle:
                'Cobrar solo en efectivo excluye a quien no lleva billetes y no deja rastro para su contabilidad. Abra una cuenta bancaria del negocio y publique el número de cuenta en sus canales.',
            herramientas: ['Cuenta de ahorros o corriente del negocio', 'DeUna', 'Peigo'],
            esfuerzo: 'bajo',
            costo: 'gratis',
            plazo: 30,
        },
        nivel1: {
            titulo: 'Añada un medio de cobro con tarjeta',
            detalle:
                'La transferencia obliga al cliente a salir de la conversación y volver con el comprobante. Un link de cobro o una billetera electrónica reduce ese abandono. Compare la comisión por transacción antes de elegir.',
            herramientas: ['Kushki', 'Datafast', 'PayPhone', 'DeUna'],
            esfuerzo: 'medio',
            costo: 'bajo',
            plazo: 60,
        },
    },
    {
        codigo: 'D2.3',
        dimension: D2,
        etiqueta: 'Atención fuera de horario',
        claveTexto: 'como maneja la atencion al cliente digital',
        nivel0: {
            titulo: 'Configure respuestas automáticas',
            detalle:
                'Un mensaje sin responder de noche suele ser una venta perdida. Active el mensaje de ausencia y tres respuestas rápidas con lo que más le preguntan: precios, horarios y ubicación.',
            herramientas: ['WhatsApp Business — mensajes de ausencia y respuestas rápidas'],
            esfuerzo: 'bajo',
            costo: 'gratis',
            plazo: 30,
        },
        nivel1: {
            titulo: 'Automatice las preguntas repetidas',
            detalle:
                'Sus respuestas rápidas ya cubren lo básico; el siguiente paso es que el cliente avance solo. Configure un flujo automático que responda las cinco consultas más frecuentes y derive a una persona solo cuando haga falta.',
            herramientas: ['Chatbot de WhatsApp Business API', 'ManyChat'],
            esfuerzo: 'medio',
            costo: 'bajo',
            plazo: 90,
        },
    },

    /* ── D3 · Organización y personas ─────────────────────────────────── */
    {
        codigo: 'D3.1',
        dimension: D3,
        etiqueta: 'Aprendizaje de herramientas nuevas',
        claveTexto: 'han aprendido a usar alguna herramienta digital nueva',
        nivel0: {
            titulo: 'Reserve dos horas a la semana para aprender',
            detalle:
                'Ninguna herramienta rinde si nadie sabe usarla. Fije un bloque semanal en su agenda y empiece por la herramienta que ya tiene y menos aprovecha.',
            herramientas: ['YouTube', 'Google Actívate (gratuito y certificado)'],
            esfuerzo: 'bajo',
            costo: 'gratis',
            plazo: 30,
        },
        nivel1: {
            titulo: 'Tome un curso con certificado',
            detalle:
                'Aprender por cuenta propia deja huecos que no se notan hasta que algo falla. Un curso estructurado cubre lo que no sabía que le faltaba, y el certificado sirve ante clientes y programas de apoyo.',
            herramientas: ['Google Actívate', 'Cursos de la Cámara de Comercio', 'CFN Capacita'],
            esfuerzo: 'medio',
            costo: 'gratis',
            plazo: 90,
        },
    },
    {
        codigo: 'D3.2',
        dimension: D3,
        etiqueta: 'Plan de habilidades digitales',
        claveTexto: 'tiene su negocio un plan para seguir desarrollando las habilidades',
        nivel0: {
            titulo: 'Escriba qué debe aprender su equipo este año',
            detalle:
                'Una lista de tres temas con un responsable y un mes para cada uno ya es un plan. Sin fecha escrita, la capacitación siempre cede el turno a lo urgente.',
            herramientas: [],
            esfuerzo: 'bajo',
            costo: 'gratis',
            plazo: 30,
        },
        nivel1: {
            titulo: 'Asigne presupuesto y fechas al plan',
            detalle:
                'La intención de capacitarse sin monto ni calendario no se ejecuta. Defina un monto anual, aunque sea pequeño, y bloquee las fechas en el calendario del negocio.',
            herramientas: [],
            esfuerzo: 'bajo',
            costo: 'bajo',
            plazo: 60,
        },
    },
    {
        codigo: 'D3.3',
        dimension: D3,
        etiqueta: 'Coordinación del trabajo interno',
        claveTexto: 'utiliza software para coordinar el trabajo interno',
        nivel0: {
            titulo: 'Deje por escrito quién hace qué',
            detalle:
                'Coordinar de palabra funciona hasta que alguien falta. Lleve una lista compartida de tareas con responsable y fecha, aunque empiece en una hoja de cálculo.',
            herramientas: ['Google Sheets', 'Google Keep'],
            esfuerzo: 'bajo',
            costo: 'gratis',
            plazo: 30,
        },
        nivel1: {
            titulo: 'Saque las tareas del grupo de WhatsApp',
            detalle:
                'En un grupo de chat la tarea se entierra bajo los mensajes del día siguiente y nadie sabe qué quedó pendiente. Un tablero simple deja visible lo que está en curso.',
            herramientas: ['Trello (gratuito)', 'Microsoft Planner', 'Notion'],
            esfuerzo: 'medio',
            costo: 'gratis',
            plazo: 60,
        },
    },
    {
        codigo: 'D3.4',
        dimension: D3,
        etiqueta: 'Soporte técnico',
        claveTexto: 'como gestiona el soporte tecnico',
        nivel0: {
            titulo: 'Identifique a quién llamar antes de que falle algo',
            detalle:
                'Buscar la solución en internet mientras el negocio está detenido cuesta horas de venta. Consiga el contacto de un técnico de su zona y acuerde de antemano su tarifa por visita.',
            herramientas: [],
            esfuerzo: 'bajo',
            costo: 'gratis',
            plazo: 30,
        },
        nivel1: {
            titulo: 'Formalice el soporte que hoy es un favor',
            detalle:
                'La ayuda informal no tiene tiempo de respuesta comprometido: llega cuando el conocido puede. Acuerde un servicio por horas o una iguala mensual con quien ya le ayuda.',
            herramientas: [],
            esfuerzo: 'bajo',
            costo: 'medio',
            plazo: 90,
        },
    },

    /* ── D4 · Estrategia y transformación digital ─────────────────────── */
    {
        codigo: 'D4.1',
        dimension: D4,
        etiqueta: 'Plan de tecnología',
        claveTexto: 'tiene su negocio un plan para incorporar o mejorar el uso de tecnologia',
        nivel0: {
            titulo: 'Escriba su plan de tecnología en una página',
            detalle:
                'Resolver conforme aparece lleva a comprar herramientas que se abandonan. Una página basta: qué tres herramientas quiere en el año, en qué orden, cuánto puede invertir y para cuándo. Este reporte le sirve de punto de partida.',
            herramientas: [],
            esfuerzo: 'bajo',
            costo: 'gratis',
            plazo: 30,
        },
        nivel1: {
            titulo: 'Póngale fechas y presupuesto a sus ideas',
            detalle:
                'Tiene claro qué quiere lograr, pero sin fecha ni monto el plan no compite con la operación diaria. Asigne a cada idea un mes de ejecución y una cifra máxima.',
            herramientas: [],
            esfuerzo: 'bajo',
            costo: 'gratis',
            plazo: 30,
        },
    },
    {
        codigo: 'D4.2',
        dimension: D4,
        etiqueta: 'Quién decide en tecnología',
        claveTexto: 'quien toma las decisiones sobre tecnologia',
        nivel0: {
            titulo: 'Nombre un responsable de tecnología',
            detalle:
                'Cuando nadie responde por la tecnología, solo se actúa en la emergencia y siempre se paga más caro. Designe a una persona —puede ser usted— que evalúe y decida las mejoras.',
            herramientas: [],
            esfuerzo: 'bajo',
            costo: 'gratis',
            plazo: 30,
        },
        nivel1: {
            titulo: 'Defina cómo se implementa un cambio',
            detalle:
                'Decidir es la mitad; la otra mitad es que el cambio llegue a la operación. Escriba los cuatro pasos que sigue toda herramienta nueva: se prueba, se capacita, se pone en marcha, se revisa al mes.',
            herramientas: [],
            esfuerzo: 'bajo',
            costo: 'gratis',
            plazo: 60,
        },
    },
    {
        codigo: 'D4.3',
        dimension: D4,
        etiqueta: 'Uso de inteligencia artificial',
        claveTexto: 'utiliza herramientas de inteligencia artificial',
        nivel0: {
            titulo: 'Pruebe la IA en una tarea que ya hace',
            detalle:
                'Empiece por algo que le consume tiempo y no requiere criterio experto: redactar las publicaciones de la semana o responder consultas repetidas. Compare el resultado con lo que hace hoy antes de adoptarla.',
            herramientas: ['ChatGPT (versión gratuita)', 'Google Gemini', 'Microsoft Copilot'],
            esfuerzo: 'bajo',
            costo: 'gratis',
            plazo: 30,
        },
        nivel1: {
            titulo: 'Lleve la IA a un proceso fijo',
            detalle:
                'Usarla de vez en cuando no cambia sus resultados. Elija un proceso semanal —el calendario de contenidos, el resumen de ventas, las respuestas frecuentes— y hágalo siempre con la herramienta.',
            herramientas: ['ChatGPT', 'Google Gemini'],
            esfuerzo: 'medio',
            costo: 'bajo',
            plazo: 60,
        },
    },
    {
        codigo: 'D4.4',
        dimension: D4,
        etiqueta: 'Protección ante ataques y pérdida de información',
        claveTexto: 'que hace su negocio para protegerse de ataques informaticos',
        nivel0: {
            titulo: 'Contraseñas distintas y una copia de respaldo',
            detalle:
                'Es la acción de mayor impacto y menor costo del reporte. Cambie hoy la contraseña del correo y del banco por dos distintas y largas, active la verificación en dos pasos, y active la copia automática de sus archivos.',
            herramientas: ['Verificación en dos pasos de Google', 'Google Drive', 'Bitwarden'],
            esfuerzo: 'bajo',
            costo: 'gratis',
            plazo: 30,
        },
        nivel1: {
            titulo: 'Automatice la copia y active la doble verificación',
            detalle:
                'Una copia que depende de que alguien se acuerde, tarde o temprano no se hace. Configure el respaldo automático a la nube y active la verificación en dos pasos en el correo, el banco y las redes del negocio.',
            herramientas: ['Google Drive', 'OneDrive', 'Verificación en dos pasos'],
            esfuerzo: 'bajo',
            costo: 'gratis',
            plazo: 30,
        },
    },
    {
        codigo: 'D4.5',
        dimension: D4,
        etiqueta: 'Manejo de datos personales de clientes',
        claveTexto: 'como maneja su negocio la informacion personal de sus clientes',
        nivel0: {
            titulo: 'Ordene qué datos guarda y para qué',
            detalle:
                'En Ecuador la Ley Orgánica de Protección de Datos Personales alcanza también a los negocios pequeños. Empiece por lo básico: escriba qué datos recoge, dónde los guarda y quién tiene acceso, y deje de pedir los que no usa.',
            herramientas: [],
            esfuerzo: 'bajo',
            costo: 'gratis',
            plazo: 60,
        },
        nivel1: {
            titulo: 'Pida autorización y póngalo por escrito',
            detalle:
                'El cuidado sin regla escrita no se puede demostrar ante un cliente ni ante la autoridad. Redacte media página con qué datos pide, para qué los usa y cómo se los borra a quien lo solicite, y añada una casilla de autorización en sus formularios.',
            herramientas: [],
            esfuerzo: 'medio',
            costo: 'gratis',
            plazo: 90,
        },
    },

    /* ── D5 · Datos y analítica ───────────────────────────────────────── */
    {
        codigo: 'D5.1',
        dimension: D5,
        etiqueta: 'Base de datos de clientes',
        claveTexto: 'como maneja actualmente la base de datos de sus clientes',
        nivel0: {
            titulo: 'Pase su lista de clientes a una hoja de cálculo',
            detalle:
                'En papel o en la memoria, la lista de clientes no se puede ordenar, ni buscar, ni respaldar, y se pierde con la persona que la lleva. Una hoja con nombre, contacto y última compra ya cambia lo que puede hacer con ella.',
            herramientas: ['Google Sheets', 'Excel'],
            esfuerzo: 'bajo',
            costo: 'gratis',
            plazo: 30,
        },
        nivel1: {
            titulo: 'Evalúe pasar a un CRM cuando la hoja se le quede corta',
            detalle:
                'La hoja de cálculo funciona bien hasta unos cientos de clientes. Si ya se le complica saber a quién le hizo seguimiento, pruebe un CRM gratuito antes de comprar uno.',
            herramientas: ['HubSpot CRM (gratuito)', 'Zoho CRM'],
            esfuerzo: 'medio',
            costo: 'gratis',
            plazo: 90,
        },
    },
    {
        codigo: 'D5.2',
        dimension: D5,
        etiqueta: 'Datos que recopila',
        claveTexto: 'que tipos de datos recopila regularmente',
        nivel0: {
            titulo: 'Registre el contacto, no solo la cédula',
            detalle:
                'Con nombre y cédula solo puede facturar. Con un teléfono o correo autorizado puede avisar de un producto nuevo. Añada esos dos campos y pida autorización al registrarlos.',
            herramientas: [],
            esfuerzo: 'bajo',
            costo: 'gratis',
            plazo: 30,
        },
        nivel1: {
            titulo: 'Anote qué compra cada cliente',
            detalle:
                'Los datos de contacto sirven para enviar lo mismo a todos. El historial de compra sirve para ofrecer a cada quien lo que le interesa, que es lo que sube la recompra. Añada una columna de última compra a su registro.',
            herramientas: ['Google Sheets'],
            esfuerzo: 'medio',
            costo: 'gratis',
            plazo: 60,
        },
    },
    {
        codigo: 'D5.3',
        dimension: D5,
        etiqueta: 'Uso de datos para decidir',
        claveTexto: 'como utiliza esos datos para la toma de decisiones',
        nivel0: {
            titulo: 'Revise sus ventas una vez al mes',
            detalle:
                'Sin revisión periódica, las decisiones se toman por impresión. Media hora al mes mirando qué se vendió más, qué menos y en qué días, ya orienta compras e inventario.',
            herramientas: ['Google Sheets'],
            esfuerzo: 'bajo',
            costo: 'gratis',
            plazo: 30,
        },
        nivel1: {
            titulo: 'Arme un tablero con lo que revisa a fin de mes',
            detalle:
                'El reporte mensual llega tarde para corregir el mes. Un tablero que se actualiza solo le muestra la caída cuando todavía puede hacer algo.',
            herramientas: ['Looker Studio (gratuito)', 'Gráficos dinámicos de Google Sheets'],
            esfuerzo: 'medio',
            costo: 'gratis',
            plazo: 90,
        },
    },

    /* ── D6 · Procesos ────────────────────────────────────────────────── */
    {
        codigo: 'D6.1',
        dimension: D6,
        etiqueta: 'Control de inventario o agenda',
        claveTexto: 'como controla el inventario de productos',
        nivel0: {
            titulo: 'Lleve el inventario en una hoja de cálculo',
            detalle:
                'El control visual falla justo cuando más rota la mercadería. Registre entradas y salidas en una hoja y revísela una vez por semana; con eso ya detecta faltantes y producto estancado.',
            herramientas: ['Google Sheets', 'Excel'],
            esfuerzo: 'medio',
            costo: 'gratis',
            plazo: 30,
        },
        nivel1: {
            titulo: 'Conecte el inventario con la venta',
            detalle:
                'La hoja actualizada a mano siempre va un paso atrás de lo que hay en bodega. Un punto de venta descuenta el stock en el momento de vender y elimina ese desfase.',
            herramientas: ['Sistemas POS locales', 'Loyverse (gratuito)'],
            esfuerzo: 'alto',
            costo: 'medio',
            plazo: 90,
        },
    },
    {
        codigo: 'D6.2',
        dimension: D6,
        etiqueta: 'Gestión financiera y contable',
        claveTexto: 'utiliza software especializado para la gestion financiera',
        nivel0: {
            titulo: 'Separe las cuentas del negocio de las personales',
            detalle:
                'El cuaderno no permite saber si el negocio gana o pierde, porque el gasto personal entra sin distinguirse. Lleve ingresos y egresos del negocio en una hoja aparte, con fecha y concepto.',
            herramientas: ['Google Sheets', 'Excel'],
            esfuerzo: 'medio',
            costo: 'gratis',
            plazo: 30,
        },
        nivel1: {
            titulo: 'Automatice la facturación electrónica',
            detalle:
                'Llevar el Excel al día y facturar aparte duplica el trabajo y multiplica los errores en la declaración. Un software contable con facturación electrónica cubre ambas cosas de una vez.',
            herramientas: ['Facturación electrónica del SRI', 'Contifico', 'Alegra'],
            esfuerzo: 'medio',
            costo: 'medio',
            plazo: 90,
        },
    },
    {
        codigo: 'D6.3',
        dimension: D6,
        etiqueta: 'Automatización de flujos',
        claveTexto: 'utiliza herramientas para la automatizacion de flujos',
        nivel0: {
            titulo: 'Automatice una sola tarea repetida',
            detalle:
                'No empiece por integrar todo. Elija la tarea que repite igual cada semana —el mensaje de cobro, el recordatorio de cita, el resumen de ventas— y prográmela.',
            herramientas: ['Mensajes programados de WhatsApp Business', 'Google Calendar'],
            esfuerzo: 'bajo',
            costo: 'gratis',
            plazo: 60,
        },
        nivel1: {
            titulo: 'Conecte entre sí las herramientas que ya usa',
            detalle:
                'Sus automatizaciones actuales trabajan aisladas y usted sigue pasando datos de una a otra a mano. Una conexión entre ellas hace que un pedido registre la venta y avise al cliente sin que nadie intervenga.',
            herramientas: ['Zapier', 'Make'],
            esfuerzo: 'alto',
            costo: 'bajo',
            plazo: 90,
        },
    },
]

/** Normaliza un texto para emparejarlo: sin acentos, minúsculas, espacios simples. */
export function normalizar(texto: string): string {
    return texto
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
}

/**
 * Encuentra la entrada del catálogo que corresponde al texto de una pregunta.
 * Devuelve null si ninguna clave aparece en el texto; el reporte cae entonces
 * en la recomendación de dimensión, nunca en un texto inventado.
 */
export function buscarItem(textoPregunta: string): ItemCatalogo | null {
    const t = normalizar(textoPregunta)
    return CATALOGO.find((item) => t.includes(item.claveTexto)) ?? null
}

/** Devuelve la acción correspondiente a una respuesta, o null si ya está en 2. */
export function accionPara(item: ItemCatalogo, peso: number): Accion | null {
    if (peso <= 0) return item.nivel0
    if (peso === 1) return item.nivel1
    return null
}

export const ETIQUETA_ESFUERZO: Record<Esfuerzo, string> = {
    bajo: 'Esfuerzo bajo',
    medio: 'Esfuerzo medio',
    alto: 'Esfuerzo alto',
}

export const ETIQUETA_COSTO: Record<Costo, string> = {
    gratis: 'Sin costo',
    bajo: 'Costo bajo',
    medio: 'Inversión',
}
