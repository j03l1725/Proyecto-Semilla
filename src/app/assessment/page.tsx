'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getQuestions, submitAssessment } from '@/app/actions/assessment'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { CheckCircle2, Circle, ChevronRight, Loader2, ArrowRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

// Tipos inferidos de la bd para el componente local
type Option = { id: string; text: string; weight: number }
type Question = { id: string; text: string; dimension: { id: string, name: string } | null; options: Option[] }

export default function AssessmentStepper() {
    const router = useRouter()
    const [questions, setQuestions] = useState<Question[]>([])
    const [currentStep, setCurrentStep] = useState(0)
    const [answers, setAnswers] = useState<Record<string, string>>({}) // { questionId: optionId }
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
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
                setCompanyId(storedCompanyId)
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

        // Auto-advance after short delay for better UX like Typeform
        if (currentStep < questions.length - 1) {
            setTimeout(() => {
                handleNext()
            }, 400)
        }
    }

    const handleSubmit = async () => {
        setSubmitting(true)
        const selectedOptionsIds = Object.values(answers)
        const res = await submitAssessment(companyId, selectedOptionsIds)

        if (res.success) {
            localStorage.removeItem('companyId')
            router.push(`/dashboard/${res.assessmentId}`)
        } else {
            console.error(res.error)
            setSubmitting(false)
        }
    }

    if (loading) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-4" />
            <p className="text-slate-600 font-medium animate-pulse">Cargando tu entorno de diagnóstico...</p>
        </div>
    )

    if (!questions || questions.length === 0) return <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50"><p>Error cargando la matriz del formato.</p></div>

    // Derive dimensions from questions for the sidebar tracking
    const dimensionsMap = new Map<string, string>()
    questions.forEach(q => {
        if (q.dimension) {
            dimensionsMap.set(q.dimension.id, q.dimension.name)
        }
    })
    const dimensions = Array.from(dimensionsMap.entries()).map(([id, name]) => ({ id, name }))

    const currentQuestion = questions[currentStep]
    const activeDimensionId = currentQuestion?.dimension?.id
    const hasAnsweredCurrent = !!answers[currentQuestion?.id]
    const isLastStep = currentStep === questions.length - 1

    // Calculo de progreso
    const answeredCount = Object.keys(answers).length
    const globalProgress = (answeredCount / questions.length) * 100

    return (
        <div className="min-h-screen bg-slate-50/50 flex flex-col md:flex-row overflow-hidden font-sans">

            {/* LEFT SIDEBAR (Desktop) / TOP HEADER (Mobile) */}
            <div className="w-full md:w-80 lg:w-96 bg-white border-b md:border-r border-slate-200 p-6 md:p-8 flex flex-col justify-between shrink-0 shadow-[4px_0_24px_rgba(0,0,0,0.02)] md:h-screen md:sticky md:top-0 z-10 transition-all">

                <div>
                    <div className="flex items-center space-x-2 mb-10 cursor-pointer" onClick={() => router.push('/')}>
                        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/20">
                            <span className="text-white font-bold text-lg">S</span>
                        </div>
                        <span className="text-xl font-bold text-slate-900 tracking-tight">Semilla</span>
                    </div>

                    <h2 className="text-2xl font-bold text-slate-800 tracking-tight mb-2">Acerca de tu negocio</h2>
                    <p className="text-sm text-slate-500 mb-8 leading-relaxed">Completa este cuestionario para que podamos evaluar el nivel de madurez digital actual de tu empresa.</p>

                    {/* Progress tracking - Only visible directly on md+ */}
                    <div className="hidden md:flex flex-col space-y-6">
                        {dimensions.map((dim, idx) => {
                            // Check if all questions in this dimension are answered
                            const questionsInDim = questions.filter(q => q.dimension?.id === dim.id)
                            const answeredInDim = questionsInDim.filter(q => answers[q.id]).length
                            const isCompleted = answeredInDim === questionsInDim.length && questionsInDim.length > 0
                            const isActive = dim.id === activeDimensionId

                            return (
                                <div key={dim.id} className="relative flex items-start group">
                                    {/* Line connector */}
                                    {idx !== dimensions.length - 1 && (
                                        <div className={`absolute left-[11px] top-6 bottom-[-24px] w-[2px] rounded-full transition-colors duration-500 ${isCompleted ? 'bg-blue-600' : 'bg-slate-100'}`} />
                                    )}

                                    <div className="relative z-10 flex items-center justify-center bg-white">
                                        {isCompleted ? (
                                            <CheckCircle2 className="w-[24px] h-[24px] text-blue-600 bg-white" />
                                        ) : isActive ? (
                                            <div className="w-[24px] h-[24px] rounded-full border-[3px] border-blue-600 bg-white flex items-center justify-center">
                                                <div className="w-2.5 h-2.5 bg-blue-600 rounded-full" />
                                            </div>
                                        ) : (
                                            <Circle className="w-[24px] h-[24px] text-slate-300 bg-white" />
                                        )}
                                    </div>
                                    <div className="ml-4 flex flex-col justify-center translate-y-[-2px]">
                                        <span className={`text-sm font-semibold transition-colors duration-300 ${isActive ? 'text-slate-900' : isCompleted ? 'text-slate-700' : 'text-slate-400'}`}>
                                            {dim.name}
                                        </span>
                                        {isActive && (
                                            <span className="text-xs text-blue-600 font-medium mt-1">
                                                Pregunta {questionsInDim.indexOf(currentQuestion) + 1} de {questionsInDim.length}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Mobile progress bar minimal */}
                <div className="md:hidden mt-4">
                    <div className="flex justify-between text-xs font-semibold text-slate-500 mb-2">
                        <span>Progreso global</span>
                        <span>{Math.round(globalProgress)}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                            className="bg-blue-600 h-full rounded-full transition-all duration-700 ease-out"
                            style={{ width: `${globalProgress}%` }}
                        />
                    </div>
                </div>

            </div>

            {/* RIGHT MAIN CONTENT (The form) */}
            <div className="flex-1 flex flex-col relative w-full h-[calc(100vh-200px)] md:h-screen overflow-y-auto">

                {/* Global Mobile Steps Tracker Top (Optional detail, already handled in sidebar somewhat) */}

                <div className="flex-1 flex items-center justify-center p-4 sm:p-8 lg:p-12 w-full max-w-4xl mx-auto">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentStep}
                            initial={{ x: 20, opacity: 0, scale: 0.98 }}
                            animate={{ x: 0, opacity: 1, scale: 1 }}
                            exit={{ x: -20, opacity: 0, filter: 'blur(4px)' }}
                            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                            className="w-full"
                        >
                            <div className="mb-8">
                                <span className="inline-flex items-center w-auto bg-blue-50 text-blue-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-4 border border-blue-100 shadow-sm">
                                    {currentQuestion.dimension?.name || 'Pregunta'}
                                </span>
                                <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight tracking-tight">
                                    {currentQuestion.text}
                                </h1>
                            </div>

                            <RadioGroup
                                value={answers[currentQuestion.id] || ''}
                                onValueChange={(val) => handleSelectOption(currentQuestion.id, val)}
                                className="space-y-4"
                            >
                                {currentQuestion.options.map((option, idx) => {
                                    const isSelected = answers[currentQuestion.id] === option.id

                                    return (
                                        <Label
                                            key={option.id}
                                            htmlFor={option.id}
                                            className={`
                                                relative flex items-center p-5 sm:p-6 rounded-2xl border-2 cursor-pointer transition-all duration-200 ease-in-out hover:shadow-md
                                                ${isSelected
                                                    ? 'border-blue-600 bg-blue-50/50 shadow-sm ring-1 ring-blue-600/20'
                                                    : 'border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50'
                                                }
                                            `}
                                        >
                                            <RadioGroupItem value={option.id} id={option.id} className="sr-only" />

                                            {/* Custom Radio Visual */}
                                            <div className="flex-shrink-0 mr-4 flex items-center justify-center">
                                                <div className={`
                                                    w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors duration-200
                                                    ${isSelected ? 'border-blue-600 bg-blue-600' : 'border-slate-300 bg-white'}
                                                `}>
                                                    {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                                                </div>
                                            </div>

                                            <div className="flex-1">
                                                <span className={`text-base sm:text-lg block transition-colors ${isSelected ? 'text-blue-900 font-semibold' : 'text-slate-700 font-medium'}`}>
                                                    {option.text}
                                                </span>
                                            </div>

                                            {/* Keyboard shortcut hint (Optional detail for premium feel) */}
                                            <div className="hidden sm:block ml-4">
                                                <div className={`w-8 h-8 rounded flex items-center justify-center border text-xs font-bold transition-colors ${isSelected ? 'border-blue-300 text-blue-600 bg-blue-100/50' : 'border-slate-200 text-slate-400 bg-slate-50'}`}>
                                                    {idx + 1}
                                                </div>
                                            </div>
                                        </Label>
                                    )
                                })}
                            </RadioGroup>

                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* BOTTOM ACTION BAR */}
                <div className="sticky bottom-0 w-full bg-white/80 backdrop-blur-md border-t border-slate-200 p-4 sm:p-6 px-4 md:px-12 flex items-center justify-between z-20">
                    <Button
                        variant="ghost"
                        size="lg"
                        className="text-slate-500 hover:text-slate-900 font-semibold"
                        onClick={handlePrev}
                        disabled={currentStep === 0 || submitting}
                    >
                        Atrás
                    </Button>

                    <div className="flex items-center space-x-4">
                        <span className="hidden sm:inline-block text-sm font-semibold text-slate-400">
                            {currentStep + 1} / {questions.length}
                        </span>

                        {isLastStep ? (
                            <Button
                                size="lg"
                                onClick={handleSubmit}
                                disabled={!hasAnsweredCurrent || submitting}
                                className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/30 px-8 rounded-full font-bold transition-all disabled:opacity-50"
                            >
                                {submitting ? (
                                    <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Finalizando...</>
                                ) : (
                                    'Finalizar Diagnóstico'
                                )}
                            </Button>
                        ) : (
                            <Button
                                size="lg"
                                onClick={handleNext}
                                disabled={!hasAnsweredCurrent}
                                className="bg-slate-900 hover:bg-blue-600 text-white px-8 rounded-full font-bold shadow-md transition-all group disabled:opacity-50 disabled:hover:bg-slate-900"
                            >
                                Continuar
                                <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        )}
                    </div>
                </div>

            </div>
        </div>
    )
}
