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
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-sm shadow-xl border-slate-200">
                <CardHeader className="text-center space-y-2">
                    <div className="mx-auto bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mb-2">
                        <Lock className="w-6 h-6 text-blue-600" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-slate-800">Acceso Restringido</CardTitle>
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

                        {error && <p className="text-sm border border-red-200 bg-red-50 text-red-600 p-2 rounded-md">{error}</p>}

                        <Button type="submit" className="w-full font-semibold" disabled={loading}>
                            {loading ? 'Verificando...' : 'Entrar al Panel'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
