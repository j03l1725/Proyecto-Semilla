'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'

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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

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
        // Guardamos el ID en localStorage para que el assessment sepa a quién pertenece
        localStorage.setItem('companyId', result.companyId)
        // Redirigimos al cuestionario
        router.push('/assessment')
      } else {
        setError(result.error || 'Ocurrió un error inesperado al registrarte.')
      }
    } catch (err) {
      console.error(err)
      setError('Ocurrió un error de conexión, intenta de nuevo.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen flex-col lg:flex-row bg-slate-50">

      {/* Lado izquierdo: Propuesta de valor */}
      <section className="flex-1 flex flex-col justify-center p-8 lg:p-24 bg-primary text-primary-foreground space-y-6">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
          Descubre el Nivel Digital de tu Negocio en 5 minutos
        </h1>
        <p className="text-lg md:text-xl opacity-90 max-w-2xl leading-relaxed">
          Nuestra Plataforma de Diagnóstico de Madurez Digital evalúa tu uso de tecnología, procesos y relación con clientes. Completa el registro sin fricción y obtén una evaluación en tiempo real.
        </p>

        <div className="flex gap-4 items-center pt-8">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-white/20 font-bold">1</span>
              <span>Registro Rápido</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-white/20 font-bold">2</span>
              <span>Cuestionario Dinámico</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-white/20 font-bold">3</span>
              <span>Resultados Inmediatos</span>
            </div>
          </div>
        </div>
      </section>

      {/* Lado derecho: Formulario */}
      <section className="flex-1 flex items-center justify-center p-8 lg:p-24">
        <Card className="w-full max-w-lg shadow-xl border-0">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Empieza Gratis</CardTitle>
            <CardDescription className="text-center">
              Ingresa los datos de tu emprendimiento para iniciar el diagnóstico.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="p-3 mb-4 text-sm text-destructive-foreground bg-destructive/10 border border-destructive/20 rounded-md">
                {error}
              </div>
            )}
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre del Empredimiento <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Input placeholder="Ej. Panadería San José" {...field} disabled={isLoading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="contactName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tu Nombre</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej. Juan Pérez" {...field} value={field.value || ''} disabled={isLoading} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="sector"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sector Comercial</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej. Alimentos, Retail..." {...field} value={field.value || ''} disabled={isLoading} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Correo Electrónico <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="hola@ejemplo.com" {...field} disabled={isLoading} />
                      </FormControl>
                      <FormDescription>No enviaremos spam. Usado para enviarte el reporte.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                  {isLoading ? 'Registrando...' : 'Iniciar Diagnóstico'}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </section>

    </main>
  )
}
