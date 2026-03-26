'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateInstitutionAction } from '@/app/actions/admin'

type Institution = {
    id: string
    name: string
    type: string
}

export default function EditInstitutionForm({ institution }: { institution: Institution }) {
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const formData = new FormData(e.currentTarget)
        const res = await updateInstitutionAction(institution.id, formData)

        if (res.error) {
            setError(res.error)
            setLoading(false)
        } else {
            router.push('/admin')
            router.refresh()
        }
    }

    return (
        <div className="animate-fade-in" style={{ maxWidth: '600px' }}>
            <h1 className="title-xl">Edit Institution</h1>
            <p className="text-muted" style={{ marginBottom: '2rem' }}>Update details for {institution.name}.</p>

            {error && (
                <div className="badge-danger" style={{ padding: '0.75rem', marginBottom: '1.5rem', borderRadius: '8px' }}>
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div className="glass-panel">
                    <div className="form-group">
                        <label className="form-label" htmlFor="name">Institution Name</label>
                        <input type="text" id="name" name="name" className="form-input" defaultValue={institution.name} required />
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="type">Institution Type</label>
                        <select id="type" name="type" className="form-input" defaultValue={institution.type} required>
                            <option value="SCHOOL">School</option>
                            <option value="COLLEGE">College</option>
                            <option value="COACHING">Coaching Center</option>
                        </select>
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                    <button type="button" onClick={() => router.back()} className="btn btn-outline" disabled={loading}>Cancel</button>
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    )
}
