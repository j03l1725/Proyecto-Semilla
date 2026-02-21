'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { motion } from 'framer-motion'
import { Loader2, ArrowRight } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'

import { registerCompany } from '@/app/actions/company'

// Esquema de validación usando Zod
const formSchema = z.object({
  name: z.string().min(2, {
    message: 'El nombre del emprendimiento debe tener al menos 2 caracteres.',
  }),
  contactName: z.string().min(2, {
    message: 'Tu nombre debe tener al menos 2 caracteres.',
  }).optional().or(z.literal('')),
  email: z.string().email({
    message: 'Por favor ingresa un correo electrónico válido.',
  }),
  sector: z.string().optional(),
})

export default function Home() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 1. Definimos el formulario
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      contactName: '',
      email: '',
      sector: '',
    },
  })

  // 2. Definimos qué pasa al enviar el formulario
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    setError(null)

    try {
      const result = await registerCompany(values)

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
            Evaluación Base 36.0 (V2) Activa
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-[5.5rem] font-medium tracking-tight leading-[1.05] text-[#f4f7f5] mb-6">
            Tu diagnóstico de <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-300 to-green-500">Madurez Digital</span> en una sola vista.
          </h1>

          <p className="text-lg md:text-xl text-slate-400 font-light max-w-xl leading-relaxed mb-12">
            Deja de adivinar el estado tecnológico de tu negocio. Semilla te brinda una brújula precisa evaluada en 6 dimensiones estructurales en menos de 5 minutos, directo a tu pantalla.
          </p>

          {/* Stats indicators (Reference based) */}
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
              <div className="text-2xl font-bold text-white mb-1">36 Pts</div>
              <div className="text-sm text-slate-400 font-medium">Taxonomía</div>
            </div>
          </div>


        </motion.div>
      </section>

      {/* Lado derecho: Formulario Flotante Glassmorphism */}
      <section className="relative z-10 w-full lg:w-[45%] xl:w-[40%] flex items-center justify-center p-6 lg:p-12 xl:p-16">
        <motion.div
          initial={{ opacity: 0, x: 50, filter: "blur(10px)" }}
          animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="w-full max-w-md"
        >
          <Card className="bg-[#131b17]/80 backdrop-blur-xl border border-white/10 shadow-2xl shadow-green-900/10 overflow-hidden">

            {/* Minimal Header inside Card */}
            <div className="px-8 pt-8 pb-4">
              <h2 className="text-2xl font-semibold text-white tracking-tight">Registro de Emprendimiento</h2>
              <p className="text-sm text-slate-400 mt-2">Danos un contexto básico para personalizar tu evaluación empresarial.</p>
            </div>

            <CardContent className="px-8 pb-8">
              {error && (
                <div className="p-4 mb-6 text-sm text-red-200 bg-red-500/20 border border-red-500/30 rounded-lg flex items-start">
                  <span className="mr-2">⚠️</span> {error}
                </div>
              )}

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

                  {/* Inputs Dark Mode Styling override */}
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-300">Nombre de la Empresa</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Ej. TechCorp Solutions"
                            {...field}
                            disabled={isLoading}
                            className="bg-black/40 border-white/10 text-white placeholder:text-slate-600 focus-visible:ring-green-500/50 focus-visible:border-green-500"
                          />
                        </FormControl>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="contactName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-300 text-xs">Tu Nombre (Opcional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Ej. Ana Pérez" {...field} value={field.value || ''} disabled={isLoading} className="bg-black/40 border-white/10 text-white placeholder:text-slate-600 focus-visible:ring-green-500/50" />
                          </FormControl>
                          <FormMessage className="text-red-400" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="sector"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-300 text-xs">Sector (Opcional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Retail, IT..." {...field} value={field.value || ''} disabled={isLoading} className="bg-black/40 border-white/10 text-white placeholder:text-slate-600 focus-visible:ring-green-500/50" />
                          </FormControl>
                          <FormMessage className="text-red-400" />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem className="pb-4">
                        <FormLabel className="text-slate-300">Correo Electrónico</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="hola@ejemplo.com" {...field} disabled={isLoading} className="bg-black/40 border-white/10 text-white placeholder:text-slate-600 focus-visible:ring-green-500/50 focus-visible:border-green-500" />
                        </FormControl>
                        <FormDescription className="text-slate-500 text-xs pt-1 border-t border-white/5 mt-3">Tus reportes detallados en PDF (próximamente) serán enviados aquí.</FormDescription>
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
