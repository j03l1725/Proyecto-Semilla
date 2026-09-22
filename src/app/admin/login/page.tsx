'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { loginAdmin } from '@/app/actions/auth'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Lock } from 'lucide-react'

export default function AdminLoginPage() {
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        const result = await loginAdmin(password)

        if (result.success) {
            router.push('/admin') // Si es válido, entrar
        } else {
            setError(result.error || 'Error al autenticar')
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-[radial-gradient(120%_90%_at_50%_0%,#3c235f_0%,#241348_45%,#14082a_85%)] flex flex-col items-center justify-center gap-8 p-4">
            <img src="/uti-oscuro-con-nombre.png" alt="Universidad Indoamérica" className="h-10 w-auto opacity-95" />
            <Card className="w-full max-w-sm shadow-2xl border-morado-200 overflow-hidden">
                {/* Filo de marca: morado -> naranja. */}
                <div className="h-1 -mt-6 bg-gradient-to-r from-morado-700 via-morado-500 to-naranja-500" />
                <CardHeader className="text-center space-y-2">
                    <div className="mx-auto bg-morado-100 w-12 h-12 rounded-full flex items-center justify-center mb-2">
                        <Lock className="w-6 h-6 text-morado-700" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-morado-700">Acceso Restringido</CardTitle>
                    <CardDescription>
                        Panel de Investigadores. Ingresa la credencial maestra para continuar.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="password">Contraseña de Acceso</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        {error && <p role="alert" className="text-sm border border-naranja-200 bg-naranja-100 text-naranja-700 p-2 rounded-md">{error}</p>}

                        <Button type="submit" className="w-full font-semibold bg-morado-700 hover:bg-morado-600" disabled={loading}>
                            {loading ? 'Verificando...' : 'Entrar al Panel'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
