'use client'

import { useState } from 'react'
import { loginAction } from '@/app/actions/auth'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const formData = new FormData(e.currentTarget)
        const res = await loginAction(formData)

        if (res.error) {
            setError(res.error)
            setLoading(false)
        } else if (res.success && res.role) {
            router.push(`/${res.role}`)
        }
    }

    return (
        <div className="flex-center" style={{ minHeight: '100vh', padding: '1rem' }}>
            <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '400px' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h1 className="title-lg">Presence.</h1>
                    <p className="text-muted">Dynamic Attendance Platform</p>
                </div>

                {error && (
                    <div style={{ padding: '0.75rem', marginBottom: '1.5rem', borderRadius: '8px', fontSize: '0.9rem' }} className="badge-danger">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label" htmlFor="email">Email address</label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            className="form-input"
                            placeholder="name@institute.edu"
                            required
                        />
                    </div>

                    <div className="form-group" style={{ marginBottom: '1rem' }}>
                        <label className="form-label" htmlFor="password">Password</label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            className="form-input"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={loading}
                    >
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <div style={{ marginTop: '2rem', textAlign: 'center', borderTop: '1px solid var(--c-surface-border)', paddingTop: '1.5rem' }}>
                    <p className="text-muted" style={{ fontSize: '0.85rem' }}>
                        Test Accounts:<br />
                        admin@test.com | teacher@test.com | student@test.com<br />
                        Password: password
                    </p>
                </div>
            </div>
        </div>
    )
}
