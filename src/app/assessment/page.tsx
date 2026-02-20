'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getQuestions, submitAssessment } from '@/app/actions/assessment'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'

// Tipos inferidos de la bd para el componente local
type Option = { id: string; text: string; weight: number }
type Question = { id: string; text: string; dimension: { name: string } | null; options: Option[] }

export default function AssessmentStepper() {
    const router = useRouter()
    const [questions, setQuestions] = useState<Question[]>([])
    const [currentStep, setCurrentStep] = useState(0)
    const [answers, setAnswers] = useState<Record<string, string>>({}) // { questionId: optionId }
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [companyId, setCompanyId] = useState<string>('')

    useEffect(() => {
        const storedCompanyId = localStorage.getItem('companyId')
        if (!storedCompanyId) {
            router.replace('/')
            return
        }

        // Cargar preguntas desde la DB
        const loadQuestions = async () => {
            const res = await getQuestions()
            if (res.success && res.questions) {
                setQuestions(res.questions as Question[])
                setCompanyId(storedCompanyId) // Set company ID after loading safely avoid react-hooks/set-state-in-effect
            } else {
                setError(res.error || 'Ocurrió un error al cargar las preguntas.')
            }
            setLoading(false)
        }

        loadQuestions()
    }, [router])

    const handleNext = () => {
        if (currentStep < questions.length - 1) {
            setCurrentStep(curr => curr + 1)
        }
    }

    const handlePrev = () => {
        if (currentStep > 0) {
            setCurrentStep(curr => curr - 1)
        }
    }

    const handleSelectOption = (questionId: string, optionId: string) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: optionId
        }))
    }

    const handleSubmit = async () => {
        setSubmitting(true)
        setError(null)

        // Extraer solo los IDs de opciones seleccionadas
        const selectedOptionsIds = Object.values(answers)

        const res = await submitAssessment(companyId, selectedOptionsIds)

        if (res.success) {
            // Limpiar memoria local y redirigir al reporte final (dashboard o result)
            localStorage.removeItem('companyId')
            router.push(`/dashboard/${res.assessmentId}`)
        } else {
            setError(res.error || 'Hubo un error al procesar tu cuestionario. Intenta nuevamente.')
            setSubmitting(false)
        }
    }

    if (loading) return <div className="min-h-screen flex items-center justify-center">Cargando diagnóstico...</div>
    if (error) return <div className="min-h-screen flex items-center justify-center p-4 text-red-500 text-center">{error}</div>
    if (!questions || questions.length === 0) return <div className="min-h-screen flex items-center justify-center">No hay preguntas disponibles.</div>

    const currentQuestion = questions[currentStep]
    if (!currentQuestion) return null

    const hasAnsweredCurrent = !!answers[currentQuestion.id]
    const isLastStep = currentStep === questions.length - 1
    const progressPercentage = ((currentStep + 1) / questions.length) * 100

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center p-4 sm:p-8">

            <div className="w-full max-w-3xl mb-8 space-y-2 mt-4 sm:mt-12">
                <h1 className="text-2xl font-bold text-center">Diagnóstico de Madurez Digital</h1>
                <Progress value={progressPercentage} className="w-full h-3" />
                <p className="text-sm text-right text-muted-foreground font-medium">Pregunta {currentStep + 1} de {questions.length}</p>
            </div>

            <Card className="w-full max-w-3xl shadow-lg border-0">
                <CardHeader className="bg-slate-100/50 border-b pb-6">
                    <CardDescription className="text-primary font-semibold mb-2 uppercase tracking-wider">
                        Dimensión: {currentQuestion.dimension?.name || 'General'}
                    </CardDescription>
                    <CardTitle className="text-xl sm:text-2xl leading-relaxed">
                        {currentQuestion.text}
                    </CardTitle>
                </CardHeader>

                <CardContent className="pt-6">
                    <RadioGroup
                        value={answers[currentQuestion.id] || ''}
                        onValueChange={(val) => handleSelectOption(currentQuestion.id, val)}
                        className="space-y-4"
                    >
                        {currentQuestion.options.map((option) => (
                            <div key={option.id} className="flex items-center space-x-3 space-y-0 p-4 border rounded-xl hover:bg-slate-50 transition-colors cursor-pointer has-[:checked]:bg-primary/5 has-[:checked]:border-primary">
                                <RadioGroupItem value={option.id} id={option.id} className="mt-0.5" />
                                <Label htmlFor={option.id} className="flex-1 cursor-pointer font-normal text-base leading-snug">
                                    {option.text}
                                </Label>
                            </div>
                        ))}
                    </RadioGroup>
                </CardContent>

                <CardFooter className="flex justify-between border-t pt-6 bg-slate-50/50 rounded-b-xl">
                    <Button
                        variant="outline"
                        onClick={handlePrev}
                        disabled={currentStep === 0 || submitting}
                    >
                        Anterior
                    </Button>

                    {isLastStep ? (
                        <Button
                            onClick={handleSubmit}
                            disabled={!hasAnsweredCurrent || submitting}
                            className="bg-green-600 hover:bg-green-700"
                        >
                            {submitting ? 'Procesando...' : 'Finalizar y Ver Resultados'}
                        </Button>
                    ) : (
                        <Button
                            onClick={handleNext}
                            disabled={!hasAnsweredCurrent}
                        >
                            Siguiente
                        </Button>
                    )}
                </CardFooter>
            </Card>

        </div>
    )
}
