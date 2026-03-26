import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function StudentDashboardPage() {
    const session = await getSession()
    if (!session?.user) redirect('/login')

    // Find user's institution
    const me = await prisma.user.findUnique({ where: { id: session.user.id } })
    if (!me?.institutionId) return <div>No institution assigned</div>

    // Find all classes in user's institution (teachers in same institution)
    const classes = await prisma.classSession.findMany({
        where: {
            teacher: { institutionId: me.institutionId }
        },
        orderBy: { startTime: 'desc' },
        include: {
            teacher: true,
            quizzes: true,
            attendances: { where: { studentId: me.id } }
        }
    })

    return (
        <div className="animate-fade-in">
            <h1 className="title-xl">My Classes</h1>
            <p className="text-muted" style={{ marginBottom: '2rem' }}>View your scheduled classes and mark attendance.</p>

            <div className="grid-cards">
                {classes.map(cls => {
                    const now = new Date()
                    const isOngoing = now >= cls.startTime && now <= cls.endTime
                    const isPast = now > cls.endTime

                    const myAttendance = cls.attendances[0]

                    return (
                        <div key={cls.id} className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <h3 className="title-lg" style={{ fontSize: '1.4rem', margin: 0 }}>{cls.title}</h3>
                                <span className={`badge ${isOngoing ? 'badge-primary' : isPast ? 'badge-danger' : 'badge-warning'}`}
                                    style={isOngoing ? { background: 'var(--c-primary-light)', color: 'var(--c-primary-hover)' } : undefined}>
                                    {isOngoing ? 'Live Now' : isPast ? 'Ended' : 'Upcoming'}
                                </span>
                            </div>

                            <div className="text-muted" style={{ fontSize: '0.9rem' }}>
                                <p><strong>Teacher:</strong> {cls.teacher.name}</p>
                                <p><strong>Time:</strong> {cls.startTime.toLocaleTimeString()} - {cls.endTime.toLocaleTimeString()}</p>
                            </div>

                            <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--c-surface-border)' }}>
                                {myAttendance ? (
                                    <div style={{ textAlign: 'center' }}>
                                        <span className={`badge ${myAttendance.status === 'PRESENT' ? 'badge-success' : 'badge-danger'}`}>
                                            {myAttendance.status === 'PRESENT' ? '✓ You were marked Present' : '✗ You were marked Absent'}
                                        </span>
                                    </div>
                                ) : isOngoing ? (
                                    <Link href={`/student/classes/${cls.id}/attendance`} className="btn btn-primary" style={{ width: '100%' }}>
                                        Mark Attendance
                                    </Link>
                                ) : isPast ? (
                                    <div style={{ textAlign: 'center' }}><span className="badge badge-danger">Missed / Absent</span></div>
                                ) : (
                                    <div style={{ textAlign: 'center' }}><span className="badge badge-warning">Starts Later</span></div>
                                )}
                            </div>
                        </div>
                    )
                })}

                {classes.length === 0 && (
                    <div className="text-muted" style={{ gridColumn: '1 / -1', padding: '2rem', textAlign: 'center' }}>
                        Your institution has no classes scheduled.
                    </div>
                )}
            </div>
        </div>
    )
}
