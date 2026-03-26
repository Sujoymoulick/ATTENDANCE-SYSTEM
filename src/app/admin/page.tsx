import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export default async function AdminDashboardPage() {
    const institutions = await prisma.institution.findMany({
        include: { _count: { select: { users: true } } }
    })
    const totalUsers = await prisma.user.count()
    const totalInstitutions = institutions.length

    return (
        <div className="animate-fade-in">
            <h1 className="title-xl">Admin Overview</h1>
            <p className="text-muted" style={{ marginBottom: '2rem' }}>Manage institutions and system-wide data.</p>

            <div className="grid-cards" style={{ marginBottom: '3rem' }}>
                <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', background: 'rgba(124, 58, 237, 0.1)' }}>
                    <h3 className="text-muted">Total Institutions</h3>
                    <span style={{ fontSize: '2.5rem', fontWeight: 700 }}>{totalInstitutions}</span>
                </div>

                <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', background: 'rgba(16, 185, 129, 0.1)' }}>
                    <h3 className="text-muted">Total Users</h3>
                    <span style={{ fontSize: '2.5rem', fontWeight: 700 }}>{totalUsers}</span>
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 className="title-lg">Institutions</h2>
                <Link href="/admin/institutions/new" className="btn btn-primary">+ Add Institution</Link>
            </div>

            <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ background: 'var(--c-surface-hover)' }}>
                            <th style={{ padding: '1rem', borderBottom: '1px solid var(--c-surface-border)' }}>Name</th>
                            <th style={{ padding: '1rem', borderBottom: '1px solid var(--c-surface-border)' }}>Type</th>
                            <th style={{ padding: '1rem', borderBottom: '1px solid var(--c-surface-border)' }}>Users</th>
                            <th style={{ padding: '1rem', borderBottom: '1px solid var(--c-surface-border)' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {institutions.map(inst => (
                            <tr key={inst.id} style={{ borderBottom: '1px solid var(--c-surface-border)' }}>
                                <td style={{ padding: '1rem' }}>{inst.name}</td>
                                <td style={{ padding: '1rem' }}><span className="badge badge-success">{inst.type}</span></td>
                                <td style={{ padding: '1rem' }}>{inst._count.users}</td>
                                <td style={{ padding: '1rem' }}>
                                    <Link href={`/admin/institutions/${inst.id}/edit`} className="btn btn-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>Edit</Link>
                                </td>
                            </tr>
                        ))}
                        {institutions.length === 0 && (
                            <tr>
                                <td colSpan={4} style={{ padding: '2rem', textAlign: 'center' }} className="text-muted">No institutions found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

