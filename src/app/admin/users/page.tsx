import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export default async function AdminUsersPage() {
    const users = await prisma.user.findMany({
        include: { institution: true },
        orderBy: { createdAt: 'desc' }
    })

    return (
        <div className="animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 className="title-xl">Manage Users</h1>
                    <p className="text-muted">Directory of all teachers and students across institutions.</p>
                </div>
                <Link href="/admin/users/new" className="btn btn-primary">+ Add User</Link>
            </div>

            <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ background: 'var(--c-surface-hover)' }}>
                            <th style={{ padding: '1rem', borderBottom: '1px solid var(--c-surface-border)' }}>Name</th>
                            <th style={{ padding: '1rem', borderBottom: '1px solid var(--c-surface-border)' }}>Email</th>
                            <th style={{ padding: '1rem', borderBottom: '1px solid var(--c-surface-border)' }}>Role</th>
                            <th style={{ padding: '1rem', borderBottom: '1px solid var(--c-surface-border)' }}>Institution</th>
                            <th style={{ padding: '1rem', borderBottom: '1px solid var(--c-surface-border)' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user.id} style={{ borderBottom: '1px solid var(--c-surface-border)' }}>
                                <td style={{ padding: '1rem', fontWeight: 500 }}>{user.name}</td>
                                <td style={{ padding: '1rem' }} className="text-muted">{user.email}</td>
                                <td style={{ padding: '1rem' }}>
                                    <span className={`badge ${user.role === 'ADMIN' ? 'badge-danger' :
                                        user.role === 'TEACHER' ? 'badge-warning' : 'badge-success'
                                        }`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td style={{ padding: '1rem' }}>{user.institution?.name || '-'}</td>
                                <td style={{ padding: '1rem' }}>
                                    <Link href={`/admin/users/${user.id}/edit`} className="btn btn-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>Edit</Link>
                                </td>
                            </tr>
                        ))}
                        {users.length === 0 && (
                            <tr>
                                <td colSpan={5} style={{ padding: '2rem', textAlign: 'center' }} className="text-muted">No users found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

