'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { getQuestions, submitAssessment } from '@/app/actions/assessment'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { CheckCircle2, Circle, ChevronRight, Loader2 } from 'lucide-react'
import { motion, AnimatePresence, MotionConfig, useReducedMotion } from 'framer-motion'

// Tipos inferidos
type Option = { id: string; text: string; weight: number }
type Question = { id: string; text: string; dimension: { id: string, name: string } | null; options: Option[] }

/** Clave del borrador local: sobrevive a una recarga o a una caída de red. */
const BORRADOR = 'semilla_respuestas'

export default function AssessmentStepper() {
    const router = useRouter()
    // framer-motion anima desde JS: la media query de CSS no le llega.
    const sinMovimiento = useReducedMotion()
    const [questions, setQuestions] = useState<Question[]>([])
    const [currentStep, setCurrentStep] = useState(0)
    const [answers, setAnswers] = useState<Record<string, string>>({})
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [errorEnvio, setErrorEnvio] = useState<string | null>(null)
    const [companyId, setCompanyId] = useState<string>('')
    const bottomBarRef = useRef<HTMLDivElement>(null)
    // Temporizador del avance automático. Sin cancelarlo, dos clics seguidos
    // encadenaban dos avances y se saltaba una pregunta en silencio.
    const avanceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

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

                // Recuperar un intento a medias. En móvil con datos inestables
                // basta con que se recargue la página para perder veinte
                // respuestas y con ellas al participante.
                try {
                    const guardadas = localStorage.getItem(BORRADOR)
                    if (guardadas) {
                        const prev = JSON.parse(guardadas) as Record<string, string>
                        setAnswers(prev)
                        const idx = (res.questions as Question[]).findIndex((q) => !prev[q.id])
                        setCurrentStep(idx === -1 ? (res.questions as Question[]).length - 1 : idx)
                    }
                } catch {
                    // Un borrador ilegible no debe impedir empezar de nuevo.
                }
            }
            setLoading(false)
        }

        loadQuestions()
    }, [router])

    const handleNext = () => {
        if (avanceRef.current) {
            clearTimeout(avanceRef.current)
            avanceRef.current = null
        }
        if (currentStep < questions.length - 1) {
            setCurrentStep(curr => curr + 1)
        }
    }

    const handlePrev = () => {
        if (avanceRef.current) {
            clearTimeout(avanceRef.current)
            avanceRef.current = null
        }
        if (currentStep > 0) {
            setCurrentStep(curr => curr - 1)
        }
    }

    const handleSelectOption = (questionId: string, optionId: string) => {
        setAnswers(prev => {
            const siguiente = { ...prev, [questionId]: optionId }
            try {
                localStorage.setItem(BORRADOR, JSON.stringify(siguiente))
            } catch {
                // Navegador sin almacenamiento: se sigue sin borrador.
            }
            return siguiente
        })
        setErrorEnvio(null)

        // Avance automático estilo Typeform, solo si NO es la última pregunta.
        if (avanceRef.current) clearTimeout(avanceRef.current)

        if (currentStep < questions.length - 1) {
            avanceRef.current = setTimeout(() => {
                avanceRef.current = null
                handleNext()
            }, 500)
        } else {
            avanceRef.current = setTimeout(() => {
                avanceRef.current = null
                bottomBarRef.current?.scrollIntoView({ behavior: sinMovimiento ? 'auto' : 'smooth' })
            }, 300)
        }
    }

    const handleSubmit = async () => {
        setSubmitting(true)
        setErrorEnvio(null)

        // Sin try/catch, un fallo de red dejaba el botón en «Procesando...»
        // para siempre y sin ningún mensaje: el emprendedor se quedaba mirando
        // una pantalla muerta con sus veintiuna respuestas dentro.
        try {
            // Sin esta comprobación se enviaban diagnósticos incompletos: el
            // botón solo miraba la pregunta actual, así que una pregunta saltada
            // producía un DMI calculado sobre una dimensión con menos ítems, y
            // el reporte salía como si estuviera completo.
            const faltante = questions.findIndex((q) => !answers[q.id])
            if (faltante !== -1) {
                setCurrentStep(faltante)
                setErrorEnvio(
                    `Falta responder la pregunta ${faltante + 1} de ${questions.length}. Le llevamos a ella.`
                )
                setSubmitting(false)
                return
            }

            const selectedOptionsIds = questions.map((q) => answers[q.id])

            const res = await submitAssessment(companyId, selectedOptionsIds)

            if (res.success && res.assessmentId) {
                localStorage.removeItem('companyId')
                localStorage.removeItem(BORRADOR)
                router.push(`/dashboard/${res.assessmentId}`)
                return
            }

            setErrorEnvio(res.error || 'No se pudo guardar el diagnóstico. Intente de nuevo.')
        } catch (e) {
            console.error(e)
            setErrorEnvio('Se perdió la conexión al enviar. Sus respuestas siguen guardadas: pulse de nuevo.')
        }
        setSubmitting(false)
    }

    if (loading) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-morado-950">
            <Loader2 className="h-12 w-12 animate-spin text-naranja-500 mb-4" />
            <p className="text-morado-200/80 font-medium animate-pulse">Cargando entorno de diagnóstico...</p>
        </div>
    )

    if (!questions || questions.length === 0) return <div className="min-h-screen flex flex-col items-center justify-center bg-morado-950 text-white"><p>Error cargando la matriz.</p></div>

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

    const answeredCount = questions.filter((q) => answers[q.id]).length
    const todoRespondido = answeredCount === questions.length
    const globalProgress = (answeredCount / questions.length) * 100

    return (
        // Ver la nota de la portada: "user" evita el desajuste de hidratación.
        <MotionConfig reducedMotion="user">
        <div className="min-h-screen bg-morado-950 text-white flex flex-col md:flex-row overflow-hidden font-sans selection:bg-naranja-500/30 selection:text-naranja-100">

            {/* Fondo de marca. Va en una capa `fixed` con su propio recorte: si
                los resplandores cuelgan sueltos, su bloque contenedor es el
                viewport, el `overflow-hidden` de aqui no los recorta y con los
                desplazamientos negativos estiran el documento en los dos ejes.
                Eso sacaba dos barras de scroll y dejaba ver el blanco del body. */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute inset-0 bg-[radial-gradient(110%_80%_at_0%_0%,#3c235f_0%,#241348_42%,#14082a_80%)]" />
                <div className="absolute top-[-20%] left-[-10%] w-[520px] h-[520px] bg-morado-500/25 rounded-full blur-[130px]" />
                <div className="absolute bottom-[-20%] right-[-8%] w-[520px] h-[520px] bg-naranja-500/10 rounded-full blur-[150px]" />
            </div>

            {/* LEFT SIDEBAR (Desktop) / TOP HEADER (Mobile) */}
            <div className="w-full md:w-80 lg:w-[400px] bg-morado-850/90 border-b md:border-r border-white/10 p-6 md:p-10 flex flex-col justify-between shrink-0 shadow-[4px_0_24px_rgba(0,0,0,0.2)] md:h-screen md:sticky md:top-0 relative z-10 backdrop-blur-xl">

                <div>
                    <div className="flex items-center space-x-3 mb-10 cursor-pointer" onClick={() => router.push('/')}>
                        <img src="/uti-oscuro-con-nombre.png" alt="Universidad Indoamérica" className="h-9 w-auto object-contain" />
                    </div>

                    <h2 className="text-2xl font-bold text-white tracking-tight mb-2">Construyendo tu perfil</h2>
                    <p className="text-sm text-morado-200/75 mb-10 leading-relaxed">Analizaremos sistemáticamente los componentes estructurales de tu modelo.</p>

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
                                        <div className={`absolute left-[11px] top-6 bottom-[-28px] w-[2px] rounded-full transition-colors duration-500 ${isCompleted ? 'bg-morado-400 shadow-[0_0_8px_rgba(133,112,184,0.55)]' : 'bg-white/10'}`} />
                                    )}

                                    <div className="relative z-10 flex items-center justify-center bg-morado-850">
                                        {isCompleted ? (
                                            <CheckCircle2 className="w-[24px] h-[24px] text-morado-300" />
                                        ) : isActive ? (
                                            <div className="w-[24px] h-[24px] rounded-full border-[3px] border-naranja-500 bg-morado-850 flex items-center justify-center shadow-[0_0_12px_rgba(234,96,10,0.45)]">
                                                <div className="w-2.5 h-2.5 bg-naranja-400 rounded-full animate-pulse" />
                                            </div>
                                        ) : (
                                            <Circle className="w-[24px] h-[24px] text-morado-600" />
                                        )}
                                    </div>
                                    <div className="ml-4 flex flex-col justify-center translate-y-[-2px]">
                                        <span className={`text-sm font-semibold transition-colors duration-300 ${isActive ? 'text-white' : isCompleted ? 'text-morado-200' : 'text-morado-300/80'}`}>
                                            {dim.name}
                                        </span>
                                        {isActive && (
                                            <span className="text-xs text-naranja-300 font-medium mt-1">
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
                    <div className="flex justify-between text-xs font-semibold text-morado-200/80 mb-2">
                        <span>Progreso global</span>
                        <span className="text-naranja-300">{Math.round(globalProgress)}%</span>
                    </div>
                    <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                        <div
                            className="bg-gradient-to-r from-morado-400 to-naranja-500 h-full rounded-full transition-all duration-700 ease-out shadow-[0_0_10px_rgba(234,96,10,0.55)]"
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
                                <span className="inline-flex items-center w-auto bg-naranja-500/10 text-naranja-300 border border-naranja-500/30 font-bold px-4 py-1.5 rounded-full text-xs uppercase tracking-widest mb-6 shadow-[0_0_15px_rgba(234,96,10,0.12)]">
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
                                                has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-naranja-400 has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-offset-morado-950
                                                ${isSelected
                                                    ? 'border-naranja-500 bg-naranja-500/10 shadow-[0_8px_30px_rgba(234,96,10,0.16)]'
                                                    : 'border-white/10 bg-morado-850/40 hover:border-naranja-500/45 hover:bg-morado-850/80 backdrop-blur-sm'
                                                }
                                            `}
                                        >
                                            <RadioGroupItem value={option.id} id={option.id} className="sr-only" />

                                            <div className="flex-shrink-0 mr-5 flex items-center justify-center">
                                                <div className={`
                                                    w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors duration-300
                                                    ${isSelected ? 'border-naranja-500 bg-naranja-500' : 'border-morado-400/60 bg-transparent group-hover:border-naranja-500/60'}
                                                `}>
                                                    {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                                                </div>
                                            </div>

                                            <div className="flex-1">
                                                <span className={`text-base sm:text-lg block transition-colors duration-300 ${isSelected ? 'text-white font-medium' : 'text-morado-100/85 group-hover:text-white'}`}>
                                                    {option.text}
                                                </span>
                                            </div>

                                            <div className="hidden sm:block ml-4">
                                                <div className={`w-8 h-8 rounded flex items-center justify-center border font-bold transition-colors ${isSelected ? 'border-naranja-400/40 text-naranja-300 bg-naranja-500/10' : 'border-white/10 text-morado-300/70 bg-white/5'}`}>
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
                {errorEnvio ? (
                    <div role="alert" className="sticky bottom-[76px] mx-4 md:mx-12 mb-2 z-30 rounded-xl border border-naranja-500/45 bg-naranja-500/12 px-4 py-3 text-sm text-naranja-200">
                        {errorEnvio}
                    </div>
                ) : null}

                <div ref={bottomBarRef} className="sticky bottom-0 w-full bg-morado-950/90 backdrop-blur-xl border-t border-white/10 p-4 sm:p-6 px-4 md:px-12 flex items-center justify-between z-20">
                    <Button
                        variant="ghost"
                        size="lg"
                        className="text-morado-200/80 hover:text-white hover:bg-white/10 font-semibold"
                        onClick={handlePrev}
                        disabled={currentStep === 0 || submitting}
                    >
                        Atrás
                    </Button>

                    <div className="flex items-center space-x-6">
                        <span className="hidden sm:inline-block text-sm font-semibold text-morado-300/75">
                            {/* Respondidas, no paso actual: el paso no dice si quedó un hueco atrás. */}
                            {answeredCount} <span className="text-morado-300/70">/</span> {questions.length}
                            <span className="ml-1 text-morado-300/70">respondidas</span>
                        </span>

                        {isLastStep ? (
                            <Button
                                size="lg"
                                onClick={handleSubmit}
                                disabled={!todoRespondido || submitting}
                                className={`
                                    px-8 rounded-full font-bold transition-all duration-300 ease-out h-12 text-morado-950
                                    ${todoRespondido
                                        ? 'bg-gradient-to-r from-naranja-500 to-naranja-600 hover:from-naranja-400 hover:to-naranja-500 shadow-[0_0_20px_rgba(234,96,10,0.45)] hover:shadow-[0_0_30px_rgba(234,96,10,0.6)] scale-105'
                                        : 'bg-white/10 text-morado-300/60 cursor-not-allowed opacity-50'
                                    }
                                `}
                            >
                                {submitting ? (
                                    <><Loader2 className="w-5 h-5 mr-2 animate-spin text-morado-950" /> Procesando...</>
                                ) : (
                                    'Finalizar Diagnóstico'
                                )}
                            </Button>
                        ) : (
                            <Button
                                size="lg"
                                onClick={handleNext}
                                disabled={!hasAnsweredCurrent}
                                className="bg-white/10 hover:bg-naranja-500 hover:text-morado-950 text-white px-8 rounded-full font-bold transition-all duration-300 group disabled:opacity-30 disabled:hover:bg-white/10 disabled:hover:text-white h-12"
                            >
                                Continuar
                                <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        )}
                    </div>
                </div>

            </div>
        </div>
        </MotionConfig>
    )
}
