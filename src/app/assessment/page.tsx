'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { getQuestions, submitAssessment } from '@/app/actions/assessment'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { CheckCircle2, Circle, ChevronRight, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

// Tipos inferidos
type Option = { id: string; text: string; weight: number }
type Question = { id: string; text: string; dimension: { id: string, name: string } | null; options: Option[] }

export default function AssessmentStepper() {
    const router = useRouter()
    const [questions, setQuestions] = useState<Question[]>([])
    const [currentStep, setCurrentStep] = useState(0)
    const [answers, setAnswers] = useState<Record<string, string>>({})
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [companyId, setCompanyId] = useState<string>('')
    const bottomBarRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const storedCompanyId = localStorage.getItem('companyId')
        if (!storedCompanyId) {
            router.replace('/')
            return
        }

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

        // Auto-advance para UX suave (Typeform style), solo si NO es la última pregunta
        if (currentStep < questions.length - 1) {
            setTimeout(() => {
                handleNext()
            }, 500) // Un poco más de tiempo para ver la selección
        } else {
            // Si es la última pregunta, podemos hacer un scroll suave o llamar la atención al botón
            setTimeout(() => {
                bottomBarRef.current?.scrollIntoView({ behavior: 'smooth' })
            }, 300)
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
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0f0d]">
            <Loader2 className="h-12 w-12 animate-spin text-green-500 mb-4" />
            <p className="text-slate-400 font-medium animate-pulse">Cargando entorno de diagnóstico...</p>
        </div>
    )

    if (!questions || questions.length === 0) return <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0f0d] text-white"><p>Error cargando la matriz.</p></div>

    // Obtener dimensiones ordenadas sin duplicados basados en las preguntas ordenadas
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

    const answeredCount = Object.keys(answers).length
    const globalProgress = (answeredCount / questions.length) * 100

    return (
        <div className="min-h-screen bg-[#0a0f0d] text-white flex flex-col md:flex-row overflow-hidden font-sans selection:bg-green-500/30 selection:text-green-200">

            {/* Ambient Background Glows */}
            <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />

            {/* LEFT SIDEBAR (Desktop) / TOP HEADER (Mobile) */}
            <div className="w-full md:w-80 lg:w-[400px] bg-[#131b17]/90 border-b md:border-r border-white/5 p-6 md:p-10 flex flex-col justify-between shrink-0 shadow-[4px_0_24px_rgba(0,0,0,0.2)] md:h-screen md:sticky md:top-0 z-10 backdrop-blur-xl">

                <div>
                    <div className="flex items-center space-x-3 mb-10 cursor-pointer" onClick={() => router.push('/')}>
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/20">
                            <span className="text-white font-extrabold text-xl">S</span>
                        </div>
                        <span className="text-2xl font-bold text-white tracking-tight">Semilla</span>
                    </div>

                    <h2 className="text-2xl font-bold text-white tracking-tight mb-2">Construyendo tu perfil</h2>
                    <p className="text-sm text-slate-400 mb-10 leading-relaxed">Analizaremos sistemáticamente los componentes estructurales de tu modelo.</p>

                    {/* Progress tracking - Map over dimensions properly ordered */}
                    <div className="hidden md:flex flex-col space-y-7">
                        {dimensions.map((dim, idx) => {
                            const questionsInDim = questions.filter(q => q.dimension?.id === dim.id)
                            const answeredInDim = questionsInDim.filter(q => answers[q.id]).length
                            const isCompleted = answeredInDim === questionsInDim.length && questionsInDim.length > 0
                            const isActive = dim.id === activeDimensionId

                            return (
                                <div key={dim.id} className="relative flex items-start group">
                                    {idx !== dimensions.length - 1 && (
                                        <div className={`absolute left-[11px] top-6 bottom-[-28px] w-[2px] rounded-full transition-colors duration-500 ${isCompleted ? 'bg-green-500/80 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-white/5'}`} />
                                    )}

                                    <div className="relative z-10 flex items-center justify-center bg-[#131b17]">
                                        {isCompleted ? (
                                            <CheckCircle2 className="w-[24px] h-[24px] text-green-400" />
                                        ) : isActive ? (
                                            <div className="w-[24px] h-[24px] rounded-full border-[3px] border-green-500 bg-[#131b17] flex items-center justify-center shadow-[0_0_12px_rgba(34,197,94,0.4)]">
                                                <div className="w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse" />
                                            </div>
                                        ) : (
                                            <Circle className="w-[24px] h-[24px] text-slate-700" />
                                        )}
                                    </div>
                                    <div className="ml-4 flex flex-col justify-center translate-y-[-2px]">
                                        <span className={`text-sm font-semibold transition-colors duration-300 ${isActive ? 'text-white' : isCompleted ? 'text-slate-300' : 'text-slate-600'}`}>
                                            {dim.name}
                                        </span>
                                        {isActive && (
                                            <span className="text-xs text-green-400 font-medium mt-1">
                                                Pregunta {questionsInDim.indexOf(currentQuestion) + 1} de {questionsInDim.length}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>

                <div className="md:hidden mt-4">
                    <div className="flex justify-between text-xs font-semibold text-slate-400 mb-2">
                        <span>Progreso global</span>
                        <span className="text-green-400">{Math.round(globalProgress)}%</span>
                    </div>
                    <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                        <div
                            className="bg-gradient-to-r from-green-500 to-emerald-400 h-full rounded-full transition-all duration-700 ease-out shadow-[0_0_10px_rgba(34,197,94,0.6)]"
                            style={{ width: `${globalProgress}%` }}
                        />
                    </div>
                </div>

            </div>

            {/* RIGHT MAIN CONTENT */}
            <div className="flex-1 flex flex-col relative w-full h-[calc(100vh-200px)] md:h-screen overflow-y-auto custom-scrollbar">

                <div className="flex-1 flex items-center justify-center p-4 sm:p-8 lg:p-16 w-full max-w-4xl mx-auto relative z-10">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentStep}
                            initial={{ y: 20, opacity: 0, filter: 'blur(4px)' }}
                            animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
                            exit={{ y: -20, opacity: 0, filter: 'blur(4px)' }}
                            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                            className="w-full"
                        >
                            <div className="mb-10 lg:mb-12">
                                <span className="inline-flex items-center w-auto bg-green-500/10 text-green-400 border border-green-500/20 font-bold px-4 py-1.5 rounded-full text-xs uppercase tracking-widest mb-6 shadow-[0_0_15px_rgba(34,197,94,0.1)]">
                                    {currentQuestion.dimension?.name || 'Cuestionario'}
                                </span>
                                <h1 className="text-3xl sm:text-4xl md:text-5xl font-medium text-white leading-tight tracking-tight">
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
                                                relative flex items-center p-5 sm:p-7 rounded-2xl border-2 cursor-pointer transition-all duration-300 ease-out group
                                                ${isSelected
                                                    ? 'border-green-500 bg-green-500/10 shadow-[0_8px_30px_rgba(34,197,94,0.12)]'
                                                    : 'border-white/5 bg-[#131b17]/40 hover:border-green-500/40 hover:bg-[#131b17]/80 backdrop-blur-sm'
                                                }
                                            `}
                                        >
                                            <RadioGroupItem value={option.id} id={option.id} className="sr-only" />

                                            <div className="flex-shrink-0 mr-5 flex items-center justify-center">
                                                <div className={`
                                                    w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors duration-300
                                                    ${isSelected ? 'border-green-500 bg-green-500' : 'border-slate-600 bg-transparent group-hover:border-green-500/50'}
                                                `}>
                                                    {isSelected && <div className="w-2 h-2 rounded-full bg-[#0a0f0d]" />}
                                                </div>
                                            </div>

                                            <div className="flex-1">
                                                <span className={`text-base sm:text-lg block transition-colors duration-300 ${isSelected ? 'text-white font-medium' : 'text-slate-300 group-hover:text-white'}`}>
                                                    {option.text}
                                                </span>
                                            </div>

                                            <div className="hidden sm:block ml-4">
                                                <div className={`w-8 h-8 rounded flex items-center justify-center border font-bold transition-colors ${isSelected ? 'border-green-400/30 text-green-400 bg-green-500/10' : 'border-white/10 text-slate-500 bg-white/5'}`}>
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
                <div ref={bottomBarRef} className="sticky bottom-0 w-full bg-[#0a0f0d]/90 backdrop-blur-xl border-t border-white/5 p-4 sm:p-6 px-4 md:px-12 flex items-center justify-between z-20">
                    <Button
                        variant="ghost"
                        size="lg"
                        className="text-slate-400 hover:text-white hover:bg-white/5 font-semibold"
                        onClick={handlePrev}
                        disabled={currentStep === 0 || submitting}
                    >
                        Atrás
                    </Button>

                    <div className="flex items-center space-x-6">
                        <span className="hidden sm:inline-block text-sm font-semibold text-slate-500">
                            {currentStep + 1} <span className="text-slate-700">/</span> {questions.length}
                        </span>

                        {isLastStep ? (
                            <Button
                                size="lg"
                                onClick={handleSubmit}
                                disabled={!hasAnsweredCurrent || submitting}
                                className={`
                                    px-8 rounded-full font-bold transition-all duration-300 ease-out h-12 text-[#0a0f0d]
                                    ${hasAnsweredCurrent
                                        ? 'bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 shadow-[0_0_20px_rgba(34,197,94,0.4)] hover:shadow-[0_0_30px_rgba(34,197,94,0.6)] scale-105'
                                        : 'bg-white/10 text-slate-500 cursor-not-allowed opacity-50'
                                    }
                                `}
                            >
                                {submitting ? (
                                    <><Loader2 className="w-5 h-5 mr-2 animate-spin text-[#0a0f0d]" /> Procesando...</>
                                ) : (
                                    'Finalizar Diagnóstico'
                                )}
                            </Button>
                        ) : (
                            <Button
                                size="lg"
                                onClick={handleNext}
                                disabled={!hasAnsweredCurrent}
                                className="bg-white/10 hover:bg-green-500 hover:text-[#0a0f0d] text-white px-8 rounded-full font-bold transition-all duration-300 group disabled:opacity-30 disabled:hover:bg-white/10 disabled:hover:text-white h-12"
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
