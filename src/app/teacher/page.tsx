import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function TeacherDashboardPage() {
    const session = await getSession()
    if (!session?.user) redirect('/login')

    const classes = await prisma.classSession.findMany({
        where: { teacherId: session.user.id },
        orderBy: { startTime: 'desc' },
        include: {
            _count: { select: { attendances: true, quizzes: true } }
        }
    })

    return (
        <div className="animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 className="title-xl">Your Classes</h1>
                    <p className="text-muted">Manage your class sessions and view attendance stats.</p>
                </div>
                <Link href="/teacher/classes/new" className="btn btn-primary">+ Create Session</Link>
            </div>

            <div className="grid-cards">
                {classes.map(cls => {
                    const isOngoing = new Date() >= cls.startTime && new Date() <= cls.endTime
                    const isPast = new Date() > cls.endTime

                    return (
                        <div key={cls.id} className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <h3 className="title-lg" style={{ fontSize: '1.4rem', margin: 0 }}>{cls.title}</h3>
                                <span className={`badge ${isOngoing ? 'badge-success' : isPast ? 'badge-danger' : 'badge-warning'}`}>
                                    {isOngoing ? 'Active' : isPast ? 'Ended' : 'Upcoming'}
                                </span>
                            </div>

                            <div className="text-muted" style={{ fontSize: '0.9rem' }}>
                                <p><strong>Start:</strong> {new Date(cls.startTime).toLocaleString()}</p>
                                <p><strong>End:</strong> {new Date(cls.endTime).toLocaleString()}</p>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--c-surface-border)' }}>
                                <div style={{ flex: 1 }}>
                                    <p className="form-label" style={{ marginBottom: 0 }}>Attendance</p>
                                    <p style={{ fontSize: '1.2rem', fontWeight: 600 }}>{cls._count.attendances}</p>
                                </div>
                                <div style={{ flex: 1 }}>
                                    <p className="form-label" style={{ marginBottom: 0 }}>Quizzes</p>
                                    <p style={{ fontSize: '1.2rem', fontWeight: 600 }}>{cls._count.quizzes}</p>
                                </div>
                            </div>

                            <Link href={`/teacher/classes/${cls.id}`} className="btn btn-outline" style={{ width: '100%', marginTop: '0.5rem' }}>
                                View Details
                            </Link>
                        </div>
                    )
                })}

                {classes.length === 0 && (
                    <div className="glass-panel" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem' }}>
                        <p className="text-muted" style={{ marginBottom: '1rem' }}>No class sessions created yet.</p>
                        <Link href="/teacher/classes/new" className="btn btn-primary">Create Your First Class</Link>
                    </div>
                )}
            </div>
        </div>
    )
}
