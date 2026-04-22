'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { motion } from 'framer-motion'
import { Loader2, ArrowRight, ShieldCheck } from 'lucide-react'

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

  const inputStyles = "bg-black/40 border-white/10 text-white placeholder:text-slate-600 focus-visible:ring-green-500/50 focus-visible:border-green-500"

  return (
    <main className="relative min-h-screen flex flex-col lg:flex-row bg-[#0a0f0d] text-white overflow-hidden font-sans selection:bg-green-500/30 selection:text-green-200">

      {/* Background Glow Effects (Neon Green/Emerald) */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-emerald-500/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-green-400/10 rounded-full blur-[150px] pointer-events-none" />

      {/* Nav Brand inside Left section */}
      <div className="absolute top-8 left-8 lg:left-16 z-50 flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/20">
          <span className="text-white font-extrabold text-xl">S</span>
        </div>
        <span className="text-2xl font-bold tracking-tighter text-white">Semilla</span>
      </div>

      {/* Lado izquierdo: Propuesta de valor Hero */}
      <section className="relative z-10 flex-1 flex flex-col justify-center px-8 pt-32 pb-16 lg:p-16 xl:p-24 2xl:p-32">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-2xl"
        >
          <div className="inline-flex items-center px-3 py-1 mb-6 rounded-full border border-green-500/30 bg-green-500/10 text-green-400 text-sm font-medium tracking-wide">
            <span className="w-2 h-2 rounded-full bg-green-400 mr-2 animate-pulse" />
            Evaluación Base 42.0 (V2) Activa
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-[5.5rem] font-medium tracking-tight leading-[1.05] text-[#f4f7f5] mb-6">
            Tu diagnóstico de <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-300 to-green-500">Madurez Digital</span> en una sola vista.
          </h1>

          <p className="text-lg md:text-xl text-slate-400 font-light max-w-xl leading-relaxed mb-12">
            Deja de adivinar el estado tecnológico de tu negocio. Semilla te brinda una brújula precisa evaluada en 6 dimensiones estructurales en menos de 5 minutos, directo a tu pantalla.
          </p>

          {/* Stats indicators */}
          <div className="flex gap-4 sm:gap-6 flex-wrap mb-16">
            <div className="px-6 py-4 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm">
              <div className="text-2xl font-bold text-white mb-1">100%</div>
              <div className="text-sm text-slate-400 font-medium">Digital</div>
            </div>
            <div className="px-6 py-4 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm">
              <div className="text-2xl font-bold text-white mb-1">6 Ejes</div>
              <div className="text-sm text-slate-400 font-medium">Diagnósticos</div>
            </div>
            <div className="px-6 py-4 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm">
              <div className="text-2xl font-bold text-white mb-1">21</div>
              <div className="text-sm text-slate-400 font-medium">Preguntas</div>
            </div>
          </div>

        </motion.div>
      </section>

      {/* Lado derecho: Formulario Flotante Glassmorphism */}
      <section className="relative z-10 w-full lg:w-[50%] xl:w-[45%] flex items-start lg:items-center justify-center p-6 lg:p-8 xl:p-12 lg:overflow-y-auto lg:max-h-screen">
        <motion.div
          initial={{ opacity: 0, x: 50, filter: "blur(10px)" }}
          animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="w-full max-w-md"
        >
          <Card className="bg-[#131b17]/80 backdrop-blur-xl border border-white/10 shadow-2xl shadow-green-900/10 overflow-hidden">

            {/* Header */}
            <div className="px-8 pt-8 pb-4">
              <h2 className="text-2xl font-semibold text-white tracking-tight">Registro de Emprendimiento</h2>
              <p className="text-sm text-slate-400 mt-2">Completa tus datos para iniciar el diagnóstico de madurez digital.</p>
            </div>

            <CardContent className="px-8 pb-8">
              {error && (
                <div className="p-4 mb-6 text-sm text-red-200 bg-red-500/20 border border-red-500/30 rounded-lg flex items-start">
                  <span className="mr-2">⚠️</span> {error}
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
                        <FormLabel className="text-slate-300">Nombre del Emprendimiento <span className="text-red-400">*</span></FormLabel>
                        <FormControl>
                          <Input placeholder="Ej. Panadería El Trigal" {...field} disabled={isLoading} className={inputStyles} />
                        </FormControl>
                        <FormMessage className="text-red-400" />
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
                          <FormLabel className="text-slate-300 text-xs">Tu Nombre <span className="text-red-400">*</span></FormLabel>
                          <FormControl>
                            <Input placeholder="Ej. Ana Pérez" {...field} disabled={isLoading} className={inputStyles} />
                          </FormControl>
                          <FormMessage className="text-red-400" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-300 text-xs">Celular <span className="text-red-400">*</span></FormLabel>
                          <FormControl>
                            <Input placeholder="Ej. 0991234567" {...field} disabled={isLoading} className={inputStyles} />
                          </FormControl>
                          <FormMessage className="text-red-400" />
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
                        <FormLabel className="text-slate-300">Correo Electrónico <span className="text-red-400">*</span></FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="hola@ejemplo.com" {...field} disabled={isLoading} className={inputStyles} />
                        </FormControl>
                        <FormMessage className="text-red-400" />
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
                          <FormLabel className="text-slate-300 text-xs">Provincia <span className="text-red-400">*</span></FormLabel>
                          <FormControl>
                            <select
                              {...field}
                              disabled={isLoading}
                              className={`flex h-10 w-full rounded-md border px-3 py-2 text-sm ${inputStyles} ${!field.value ? 'text-slate-600' : 'text-white'}`}
                            >
                              <option value="" className="bg-[#0a0f0d]">Seleccionar...</option>
                              {PROVINCIAS_ECUADOR.map(p => (
                                <option key={p} value={p} className="bg-[#0a0f0d] text-white">{p}</option>
                              ))}
                            </select>
                          </FormControl>
                          <FormMessage className="text-red-400" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-300 text-xs">Ciudad <span className="text-red-400">*</span></FormLabel>
                          <FormControl>
                            <Input placeholder="Ej. Quito" {...field} disabled={isLoading} className={inputStyles} />
                          </FormControl>
                          <FormMessage className="text-red-400" />
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
                        <FormLabel className="text-slate-300 text-xs">Sector (Opcional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej. Alimentos, Tecnología, Servicios..." {...field} value={field.value || ''} disabled={isLoading} className={inputStyles} />
                        </FormControl>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />

                  {/* Consentimiento de uso de datos */}
                  <FormField
                    control={form.control}
                    name="consent"
                    render={({ field }) => (
                      <FormItem>
                        <div className="p-4 rounded-xl border border-white/10 bg-black/30 mt-2">
                          <div className="flex items-start gap-3">
                            <ShieldCheck className="w-5 h-5 text-green-400 mt-0.5 shrink-0" />
                            <div>
                              <p className="text-xs text-slate-300 font-medium mb-2">Consentimiento de Uso de Datos</p>
                              <p className="text-xs text-slate-500 leading-relaxed mb-3">
                                Al participar en este diagnóstico, autorizo que mis respuestas sean utilizadas de forma <strong className="text-slate-400">anónima y agregada</strong> con fines académicos e investigativos para el estudio de la madurez digital de emprendimientos en el Ecuador. 
                                Sus datos personales (nombre, correo, celular) serán tratados de forma confidencial y no serán compartidos con terceros. 
                                La información recopilada será utilizada exclusivamente para generar estadísticas e informes que contribuyan al desarrollo del ecosistema emprendedor ecuatoriano.
                              </p>
                            </div>
                          </div>
                          <label className="flex items-center gap-3 cursor-pointer group mt-2 pl-8">
                            <input
                              type="checkbox"
                              checked={field.value === true}
                              onChange={(e) => field.onChange(e.target.checked ? true : undefined)}
                              disabled={isLoading}
                              className="w-4 h-4 rounded border-white/20 bg-black/50 text-green-500 focus:ring-green-500/50 focus:ring-offset-0 cursor-pointer accent-green-500"
                            />
                            <span className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors">
                              He leído y acepto el uso de mis datos para fines investigativos
                            </span>
                          </label>
                        </div>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 text-[#0a0f0d] font-bold text-base h-12 rounded-xl shadow-[0_0_20px_rgba(74,222,128,0.3)] transition-all hover:shadow-[0_0_30px_rgba(74,222,128,0.5)] group"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <><Loader2 className="w-5 h-5 mr-2 animate-spin text-[#0a0f0d]" /> Procesando entorno...</>
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

    </main>
  )
}
