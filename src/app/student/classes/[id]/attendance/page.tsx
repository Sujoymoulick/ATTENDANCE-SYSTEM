'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { submitAttendanceAction, getQuizAction } from '@/app/actions/student'

export default function AttendanceMarkingPage() {
    const params = useParams()
    const classId = params.id as string
    const router = useRouter()
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [quiz, setQuiz] = useState<{ question: string, options: string[] } | null>(null)
    const [loadingQuiz, setLoadingQuiz] = useState(true)

    useEffect(() => {
        if (!classId) return
        getQuizAction(classId).then(res => {
            if (res.error) {
                setError(res.error)
            } else if (res.quiz) {
                setQuiz(res.quiz)
            }
            setLoadingQuiz(false)
        })
    }, [classId])

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const formData = new FormData(e.currentTarget)
        const answer = formData.get('answer') as string
        const res = await submitAttendanceAction(classId, answer)

        if (res?.error) {
            setError(res.error)
            setLoading(false)
        } else {
            router.push('/student')
        }
    }

    if (loadingQuiz) {
        return (
            <div className="animate-fade-in" style={{ maxWidth: '500px', margin: '0 auto', marginTop: '2rem', textAlign: 'center' }}>
                <p className="text-muted">Loading quiz...</p>
            </div>
        )
    }

    return (
        <div className="animate-fade-in" style={{ maxWidth: '500px', margin: '0 auto', marginTop: '2rem' }}>
            <h1 className="title-xl" style={{ textAlign: 'center' }}>Mark Attendance</h1>
            <p className="text-muted" style={{ textAlign: 'center', marginBottom: '2rem' }}>Answer the class quiz to prove your presence.</p>

            {error ? (
                <div className="glass-panel" style={{ textAlign: 'center', border: '1px solid var(--c-danger)' }}>
                    <h3 className="title-lg" style={{ color: 'var(--c-danger)' }}>Marked Absent</h3>
                    <p className="text-muted" style={{ marginBottom: '1.5rem' }}>{error}</p>
                    <button onClick={() => router.push('/student')} className="btn btn-outline" style={{ width: '100%' }}>Return to Dashboard</button>
                </div>
            ) : (
                <div className="glass-panel">
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {quiz ? (
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label" style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--c-text-main)' }}>
                                    {quiz.question}
                                </label>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    {quiz.options.map((option, idx) => (
                                        <label key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(15, 23, 42, 0.6)', padding: '1rem', borderRadius: 'var(--radius-sm)', cursor: 'pointer', border: '1px solid var(--c-surface-border)' }}>
                                            <input type="radio" name="answer" value={option} required style={{ transform: 'scale(1.2)' }} />
                                            <span>{option}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label" htmlFor="answer">Quiz Answer</label>
                                <input type="text" id="answer" name="answer" className="form-input" placeholder="Enter the correct answer" required />
                            </div>
                        )}

                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Submitting...' : 'Submit & Mark Present'}
                        </button>
                        <button type="button" onClick={() => router.back()} className="btn btn-outline" disabled={loading}>
                            Back
                        </button>
                    </form>
                </div>
            )}
        </div>
    )
}
