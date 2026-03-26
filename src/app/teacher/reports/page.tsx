import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function TeacherReportsPage() {
    const session = await getSession()
    if (!session?.user) redirect('/login')

    const classes = await prisma.classSession.findMany({
        where: { teacherId: session.user.id },
        include: {
            attendances: true,
            _count: { select: { attendances: true } }
        },
        orderBy: { startTime: 'desc' }
    })

    return (
        <div className="animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 className="title-xl">Attendance Reports</h1>
                    <p className="text-muted">Metrics and attendance history for your classes.</p>
                </div>
                <button className="btn btn-outline">Export CSV (Coming Soon)</button>
            </div>

            <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ background: 'var(--c-surface-hover)' }}>
                            <th style={{ padding: '1rem', borderBottom: '1px solid var(--c-surface-border)' }}>Class Title</th>
                            <th style={{ padding: '1rem', borderBottom: '1px solid var(--c-surface-border)' }}>Date</th>
                            <th style={{ padding: '1rem', borderBottom: '1px solid var(--c-surface-border)' }}>Present</th>
                            <th style={{ padding: '1rem', borderBottom: '1px solid var(--c-surface-border)' }}>Absent</th>
                            <th style={{ padding: '1rem', borderBottom: '1px solid var(--c-surface-border)' }}>Total Recorded</th>
                        </tr>
                    </thead>
                    <tbody>
                        {classes.map(cls => {
                            const present = cls.attendances.filter(a => a.status === 'PRESENT').length
                            const absent = cls.attendances.filter(a => a.status === 'ABSENT').length
                            return (
                                <tr key={cls.id} style={{ borderBottom: '1px solid var(--c-surface-border)' }}>
                                    <td style={{ padding: '1rem', fontWeight: 500 }}>{cls.title}</td>
                                    <td style={{ padding: '1rem' }} className="text-muted">{cls.startTime.toLocaleDateString()}</td>
                                    <td style={{ padding: '1rem', color: 'var(--c-success)' }}>{present}</td>
                                    <td style={{ padding: '1rem', color: 'var(--c-danger)' }}>{absent}</td>
                                    <td style={{ padding: '1rem' }}>{cls._count.attendances}</td>
                                </tr>
                            )
                        })}
                        {classes.length === 0 && (
                            <tr>
                                <td colSpan={5} style={{ padding: '2rem', textAlign: 'center' }} className="text-muted">No report data available yet.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
