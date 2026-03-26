'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClassAction } from '@/app/actions/teacher'

export default function CreateClassPage() {
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const formData = new FormData(e.currentTarget)
        const res = await createClassAction(formData)

        if (res.error) {
            setError(res.error)
            setLoading(false)
        } else {
            router.push('/teacher')
        }
    }

    return (
        <div className="animate-fade-in" style={{ maxWidth: '600px' }}>
            <h1 className="title-xl">Create Class Session</h1>
            <p className="text-muted" style={{ marginBottom: '2rem' }}>Schedule a new class and assign an optional attendance quiz.</p>

            {error && (
                <div className="badge-danger" style={{ padding: '0.75rem', marginBottom: '1.5rem', borderRadius: '8px' }}>
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div className="glass-panel">
                    <h3 className="title-lg" style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Session Details</h3>

                    <div className="form-group">
                        <label className="form-label" htmlFor="title">Class Title</label>
                        <input type="text" id="title" name="title" className="form-input" placeholder="e.g. Advanced Mathematics 101" required />
                    </div>

                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <div className="form-group" style={{ flex: 1 }}>
                            <label className="form-label" htmlFor="startTime">Start Time</label>
                            <input type="datetime-local" id="startTime" name="startTime" className="form-input" required />
                        </div>

                        <div className="form-group" style={{ flex: 1 }}>
                            <label className="form-label" htmlFor="duration">Duration (Minutes)</label>
                            <input type="number" id="duration" name="duration" className="form-input" defaultValue={60} min={5} required />
                        </div>
                    </div>
                </div>

                <div className="glass-panel" style={{ background: 'rgba(124, 58, 237, 0.05)' }}>
                    <h3 className="title-lg" style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Attendance Quiz (Optional)</h3>
                    <p className="text-muted" style={{ fontSize: '0.85rem', marginBottom: '1rem' }}>
                        Students must answer this correctly within the class time window to be marked Present.
                    </p>

                    <div className="form-group">
                        <label className="form-label" htmlFor="question">Quiz Question</label>
                        <input type="text" id="question" name="question" className="form-input" placeholder="What is 2 + 2?" />
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="options">Options (comma-separated)</label>
                        <input type="text" id="options" name="options" className="form-input" placeholder="3, 4, 5, 6" />
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="correctAnswer">Correct Answer</label>
                        <input type="text" id="correctAnswer" name="correctAnswer" className="form-input" placeholder="4" />
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                    <button type="button" onClick={() => router.back()} className="btn btn-outline" disabled={loading}>Cancel</button>
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? 'Creating...' : 'Create Class'}
                    </button>
                </div>
            </form>
        </div>
    )
}
