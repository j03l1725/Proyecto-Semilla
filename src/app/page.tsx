'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { motion, MotionConfig } from 'framer-motion'
import { Loader2, ArrowRight, ShieldCheck, TriangleAlert } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'

import { registerCompany } from '@/app/actions/company'

// Lista completa de provincias del Ecuador
const PROVINCIAS_ECUADOR = [
  'Azuay', 'Bolívar', 'Cañar', 'Carchi', 'Chimborazo',
  'Cotopaxi', 'El Oro', 'Esmeraldas', 'Galápagos', 'Guayas',
  'Imbabura', 'Loja', 'Los Ríos', 'Manabí', 'Morona Santiago',
  'Napo', 'Orellana', 'Pastaza', 'Pichincha', 'Santa Elena',
  'Santo Domingo de los Tsáchilas', 'Sucumbíos', 'Tungurahua', 'Zamora-Chinchipe'
]

// Esquema de validación usando Zod
const formSchema = z.object({
  name: z.string().min(2, {
    message: 'El nombre del emprendimiento debe tener al menos 2 caracteres.',
  }),
  contactName: z.string().min(2, {
    message: 'Tu nombre es obligatorio (mínimo 2 caracteres).',
  }),
  email: z.string().email({
    message: 'Por favor ingresa un correo electrónico válido.',
  }),
  phone: z.string().min(7, {
    message: 'Ingresa un número de celular válido.',
  }),
  sector: z.string().optional(),
  province: z.string().min(1, {
    message: 'Selecciona tu provincia.',
  }),
  city: z.string().min(2, {
    message: 'Ingresa tu ciudad (mínimo 2 caracteres).',
  }),
  consent: z.literal(true, {
    message: 'Debes aceptar el consentimiento para continuar.',
  }),
})

export default function Home() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      contactName: '',
      email: '',
      phone: '',
      sector: '',
      province: '',
      city: '',
      consent: undefined as unknown as true,
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    setError(null)

    try {
      const { consent: _, ...companyData } = values
      const result = await registerCompany(companyData)

      if (result.success && result.companyId) {
        localStorage.setItem('companyId', result.companyId)
        router.push('/assessment')
      } else {
        setError(result.error || 'Ocurrió un error inesperado al registrarte.')
        setIsLoading(false)
      }
    } catch (err) {
      console.error(err)
      setError('Ocurrió un error de conexión, intenta de nuevo.')
      setIsLoading(false)
    }
  }

  const inputStyles = "bg-morado-950/50 border-white/10 text-white placeholder:text-morado-300/75 focus-visible:ring-naranja-500/50 focus-visible:border-naranja-500"

  return (
    // "user" respeta prefers-reduced-motion sin cambiar el primer render:
    // framer-motion salta las transformaciones y el desenfoque, y deja la
    // opacidad, que es la parte que no marea.
    <MotionConfig reducedMotion="user">
    <main className="relative min-h-screen bg-morado-950 text-white font-sans selection:bg-naranja-500/30 selection:text-naranja-100">

      {/* Fondo fijo: no se estira ni se desplaza con la página, así que la
          tarjeta del registro pasa por delante de él y se lee como una capa
          que flota, no como un bloque más del documento.
          Nota: el <main> ya no lleva `overflow-hidden` —haría de contenedor
          de scroll y rompería el `sticky` del hero—, así que el recorte de
          los resplandores vive aquí. */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Degradado base: del morado institucional al casi negro, en diagonal. */}
        <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_10%_0%,#3c235f_0%,#241348_38%,#14082a_78%)]" />

        {/* Resplandores de marca: morado arriba a la izquierda, naranja abajo a
            la derecha. El naranja va a un tercio de la intensidad del morado:
            es el acento de la marca, no el fondo. */}
        <div className="absolute top-[-20%] left-[-10%] w-[560px] h-[560px] bg-morado-500/30 rounded-full blur-[130px]" />
        <div className="absolute bottom-[-25%] right-[-10%] w-[620px] h-[620px] bg-naranja-500/12 rounded-full blur-[150px]" />
      </div>

      {/* Identidad institucional. El emprendedor llega por WhatsApp: si no ve
          de quien viene la invitacion, no completa el formulario. */}
      <div className="absolute top-6 left-8 lg:left-16 z-50 flex items-center gap-3">
        <img
          src="/uti-oscuro-con-nombre.png"
          alt="Universidad Indoamérica"
          className="h-7 w-auto opacity-95"
        />
        <div className="h-7 w-px bg-white/15" />
        <div>
          <p className="text-[11px] text-morado-300 leading-tight">Madurez digital de microemprendimientos</p>
        </div>
      </div>

      <div className="relative z-10 flex flex-col lg:flex-row">

      {/* Lado izquierdo: Propuesta de valor Hero. Nada de `sticky` aquí —la
          página baja entera, hero y registro a la vez. */}
      <section className="flex-1 flex flex-col justify-center lg:justify-start px-8 pt-28 pb-16 lg:px-16 lg:pt-24 lg:pb-16 xl:px-24 2xl:px-32">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-2xl"
        >
          <div className="inline-flex items-center px-3 py-1 mb-6 rounded-full border border-naranja-500/40 bg-naranja-500/10 text-naranja-300 text-sm font-medium tracking-wide">
            <span className="w-2 h-2 rounded-full bg-naranja-500 mr-2 animate-pulse" />
            Gratuito · Universidad Indoamérica
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-[5.5rem] font-medium tracking-tight leading-[1.05] text-white mb-6">
            Su diagnóstico de <span className="text-transparent bg-clip-text bg-gradient-to-r from-naranja-300 via-naranja-400 to-naranja-500">Madurez Digital</span> en una sola vista.
          </h1>

          <p className="text-lg md:text-xl text-morado-200/80 font-light max-w-xl leading-relaxed mb-12">
            Responda 21 preguntas y reciba un reporte con su nivel de madurez digital en 6 dimensiones,
            sus fortalezas y un plan de acción con los primeros pasos concretos. Toma menos de 5 minutos y
            el reporte en PDF es suyo al terminar.
          </p>

          {/* Stats indicators */}
          <div className="flex gap-4 sm:gap-6 flex-wrap">
            <div className="px-6 py-4 rounded-xl border border-white/10 bg-white/[0.06] backdrop-blur-sm transition-colors hover:border-naranja-500/40 hover:bg-white/[0.09]">
              <div className="text-2xl font-bold text-white mb-1">6</div>
              <div className="text-sm text-morado-300 font-medium">Dimensiones</div>
            </div>
            <div className="px-6 py-4 rounded-xl border border-white/10 bg-white/[0.06] backdrop-blur-sm transition-colors hover:border-naranja-500/40 hover:bg-white/[0.09]">
              <div className="text-2xl font-bold text-white mb-1">21</div>
              <div className="text-sm text-morado-300 font-medium">Preguntas</div>
            </div>
            <div className="px-6 py-4 rounded-xl border border-white/10 bg-white/[0.06] backdrop-blur-sm transition-colors hover:border-naranja-500/40 hover:bg-white/[0.09]">
              <div className="text-2xl font-bold text-white mb-1">5 min</div>
              <div className="text-sm text-morado-300 font-medium">Aproximados</div>
            </div>
            <div className="px-6 py-4 rounded-xl border border-white/10 bg-white/[0.06] backdrop-blur-sm transition-colors hover:border-naranja-500/40 hover:bg-white/[0.09]">
              <div className="text-2xl font-bold text-white mb-1">PDF</div>
              <div className="text-sm text-morado-300 font-medium">Reporte propio</div>
            </div>
          </div>

        </motion.div>
      </section>

      {/* Lado derecho: Formulario Flotante Glassmorphism */}
      {/* Sin `overflow-y-auto` ni `max-h-screen`: la tarjeta se dibuja a su
          altura real y los campos que no caben se alcanzan con el scroll de
          la página, que es el único que hay. */}
      <section className="w-full lg:w-[52%] xl:w-[48%] flex items-start justify-center px-6 pb-16 pt-6 lg:px-8 lg:pt-24 lg:pb-24 xl:px-12">
        <motion.div
          initial={{ opacity: 0, x: 40, filter: "blur(6px)" }}
          animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.55, delay: 0.1, ease: [0.23, 1, 0.32, 1] }}
          className="w-full max-w-lg xl:max-w-2xl"
        >
          <Card className="flotar bg-morado-850/75 backdrop-blur-2xl border border-white/10 ring-1 ring-white/5 shadow-[0_32px_80px_-16px_rgba(10,4,24,0.75)] overflow-hidden">

            {/* Filo de marca: morado -> naranja, la firma visual de la Universidad. */}
            <div className="h-1 -mt-6 bg-gradient-to-r from-morado-500 via-morado-400 to-naranja-500" />

            {/* Header */}
            <div className="px-8 pt-8 pb-4">
              <h2 className="text-2xl font-semibold text-white tracking-tight">Registro de Emprendimiento</h2>
              <p className="text-sm text-morado-200/75 mt-2">Complete sus datos para iniciar el diagnóstico. Los usamos para emitir su reporte y para el estudio; nunca se publican.</p>
            </div>

            <CardContent className="px-8 pb-8">
              {error && (
                <div role="alert" className="p-4 mb-6 text-sm text-naranja-100 bg-naranja-700/25 border border-naranja-500/40 rounded-lg flex items-start">
                  <TriangleAlert className="w-4 h-4 mr-2 mt-0.5 shrink-0" aria-hidden="true" /> {error}
                </div>
              )}

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

                  {/* Nombre del emprendimiento */}
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-morado-200">Nombre del Emprendimiento <span className="text-naranja-400">*</span></FormLabel>
                        <FormControl>
                          <Input placeholder="Ej. Panadería El Trigal" {...field} disabled={isLoading} className={inputStyles} />
                        </FormControl>
                        <FormMessage className="text-naranja-300" />
                      </FormItem>
                    )}
                  />

                  {/* Nombre del contacto y teléfono */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="contactName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-morado-200 text-xs">Su Nombre <span className="text-naranja-400">*</span></FormLabel>
                          <FormControl>
                            <Input placeholder="Ej. Ana Pérez" {...field} disabled={isLoading} className={inputStyles} />
                          </FormControl>
                          <FormMessage className="text-naranja-300" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-morado-200 text-xs">Celular <span className="text-naranja-400">*</span></FormLabel>
                          <FormControl>
                            <Input placeholder="Ej. 0991234567" {...field} disabled={isLoading} className={inputStyles} />
                          </FormControl>
                          <FormMessage className="text-naranja-300" />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Email */}
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-morado-200">Correo Electrónico <span className="text-naranja-400">*</span></FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="hola@ejemplo.com" {...field} disabled={isLoading} className={inputStyles} />
                        </FormControl>
                        <FormMessage className="text-naranja-300" />
                      </FormItem>
                    )}
                  />

                  {/* Provincia y Ciudad */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="province"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-morado-200 text-xs">Provincia <span className="text-naranja-400">*</span></FormLabel>
                          <FormControl>
                            <select
                              {...field}
                              disabled={isLoading}
                              className={`flex h-10 w-full rounded-md border px-3 py-2 text-sm ${inputStyles} ${!field.value ? 'text-morado-300/75' : 'text-white'}`}
                            >
                              <option value="" className="bg-morado-900">Seleccionar...</option>
                              {PROVINCIAS_ECUADOR.map(p => (
                                <option key={p} value={p} className="bg-morado-900 text-white">{p}</option>
                              ))}
                            </select>
                          </FormControl>
                          <FormMessage className="text-naranja-300" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-morado-200 text-xs">Ciudad <span className="text-naranja-400">*</span></FormLabel>
                          <FormControl>
                            <Input placeholder="Ej. Quito" {...field} disabled={isLoading} className={inputStyles} />
                          </FormControl>
                          <FormMessage className="text-naranja-300" />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Sector */}
                  <FormField
                    control={form.control}
                    name="sector"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-morado-200 text-xs">Sector del emprendimiento (Opcional)</FormLabel>
                        <p className="text-[11px] text-morado-200/70 leading-relaxed -mt-1 mb-1">
                          La actividad a la que se dedica su negocio.
                        </p>
                        <FormControl>
                          <Input placeholder="Ej. Alimentos, Comercio, Tecnología, Servicios..." {...field} value={field.value || ''} disabled={isLoading} className={inputStyles} />
                        </FormControl>
                        <FormMessage className="text-naranja-300" />
                      </FormItem>
                    )}
                  />

                  {/* Consentimiento de uso de datos */}
                  <FormField
                    control={form.control}
                    name="consent"
                    render={({ field }) => (
                      <FormItem>
                        <div className="p-4 rounded-xl border border-white/10 bg-morado-950/40 mt-2">
                          <div className="flex items-start gap-3">
                            <ShieldCheck className="w-5 h-5 text-naranja-400 mt-0.5 shrink-0" />
                            <div>
                              <p className="text-xs text-morado-100 font-medium mb-2">Consentimiento de Uso de Datos</p>
                              <p className="text-xs text-morado-200/70 leading-relaxed mb-3">
                                Al participar en este diagnóstico, autorizo que mis respuestas sean utilizadas de forma <strong className="text-morado-200">anónima y agregada</strong> con fines académicos e investigativos para el estudio de la madurez digital de emprendimientos en el Ecuador. 
                                Sus datos personales (nombre, correo, celular) serán tratados de forma confidencial y no serán compartidos con terceros. 
                                La información recopilada será utilizada exclusivamente para generar estadísticas e informes que contribuyan al desarrollo del ecosistema emprendedor ecuatoriano.
                              </p>
                            </div>
                          </div>
                          <label className="flex items-center gap-3 cursor-pointer group mt-2 pl-8 min-h-11 py-2">
                            <input
                              type="checkbox"
                              checked={field.value === true}
                              onChange={(e) => field.onChange(e.target.checked ? true : undefined)}
                              disabled={isLoading}
                              className="w-5 h-5 shrink-0 rounded border-white/20 bg-morado-950/60 focus-visible:ring-2 focus-visible:ring-naranja-400 focus-visible:ring-offset-0 cursor-pointer accent-[#ea600a]"
                            />
                            <span className="text-xs text-morado-200/80 group-hover:text-white transition-colors">
                              He leído y acepto el uso de mis datos para fines investigativos
                            </span>
                          </label>
                        </div>
                        <FormMessage className="text-naranja-300" />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-naranja-500 to-naranja-600 hover:from-naranja-400 hover:to-naranja-500 text-morado-950 font-bold text-base h-12 rounded-xl shadow-[0_0_20px_rgba(234,96,10,0.35)] hover:shadow-[0_0_30px_rgba(234,96,10,0.55)] active:scale-[0.98] transition-[transform,box-shadow,background-color] duration-150 ease-out group"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <><Loader2 className="w-5 h-5 mr-2 animate-spin text-morado-950" /> Procesando entorno...</>
                    ) : (
                      <>Comenzar Diagnóstico <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" /></>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </motion.div>
      </section>

      </div>

    </main>
    </MotionConfig>
  )
}
