'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateUserAction } from '@/app/actions/admin'

type Institution = {
    id: string
    name: string
}

type User = {
    id: string
    name: string
    email: string
    role: string
    institutionId: string | null
}

export default function EditUserForm({ user, institutions }: { user: User, institutions: Institution[] }) {
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [selectedRole, setSelectedRole] = useState(user.role)
    const router = useRouter()

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const formData = new FormData(e.currentTarget)
        const res = await updateUserAction(user.id, formData)

        if (res.error) {
            setError(res.error)
            setLoading(false)
        } else {
            router.push('/admin/users')
            router.refresh()
        }
    }

    return (
        <div className="animate-fade-in" style={{ maxWidth: '600px' }}>
            <h1 className="title-xl">Edit User</h1>
            <p className="text-muted" style={{ marginBottom: '2rem' }}>Update account details for {user.name}.</p>

            {error && (
                <div className="badge-danger" style={{ padding: '0.75rem', marginBottom: '1.5rem', borderRadius: '8px' }}>
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div className="glass-panel">
                    <div className="form-group">
                        <label className="form-label" htmlFor="name">Full Name</label>
                        <input type="text" id="name" name="name" className="form-input" defaultValue={user.name} required />
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="email">Email Address</label>
                        <input type="email" id="email" name="email" className="form-input" defaultValue={user.email} required />
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="role">Role</label>
                        <select id="role" name="role" className="form-input" value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)} required>
                            <option value="STUDENT">Student</option>
                            <option value="TEACHER">Teacher</option>
                            <option value="ADMIN">Admin</option>
                        </select>
                    </div>

                    {selectedRole !== 'ADMIN' && (
                        <div className="form-group">
                            <label className="form-label" htmlFor="institutionId">Institution Assignment</label>
                            <select id="institutionId" name="institutionId" className="form-input" defaultValue={user.institutionId || ''} required={selectedRole !== 'ADMIN'}>
                                <option value="">Select an institution...</option>
                                {institutions.map(inst => (
                                    <option key={inst.id} value={inst.id}>{inst.name}</option>
                                ))}
                            </select>
                        </div>
                    )}
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
