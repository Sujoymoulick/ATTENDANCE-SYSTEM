import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function TeacherClassDetailsPage({ params }: { params: { id: string } }) {
    const session = await getSession()
    if (!session?.user) redirect('/login')

    const classSession = await prisma.classSession.findUnique({
        where: { id: params.id },
        include: {
            quizzes: true,
            attendances: {
                include: { student: true },
                orderBy: { timestamp: 'desc' }
            }
        }
    })

    if (!classSession || classSession.teacherId !== session.user.id) {
        redirect('/teacher')
    }

    const quiz = classSession.quizzes[0]
    const now = new Date()
    const isOngoing = now >= classSession.startTime && now <= classSession.endTime
    const isPast = now > classSession.endTime

    const totalStudents = classSession.attendances.length
    const presentCount = classSession.attendances.filter(a => a.status === 'PRESENT').length
    const absentCount = classSession.attendances.filter(a => a.status === 'ABSENT').length

    return (
        <div className="animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                <div>
                    <h1 className="title-xl">{classSession.title}</h1>
                    <p className="text-muted">
                        {classSession.startTime.toLocaleString()} — {classSession.endTime.toLocaleString()}
                    </p>
                </div>
                <span className={`badge ${isOngoing ? 'badge-success' : isPast ? 'badge-danger' : 'badge-warning'}`}>
                    {isOngoing ? 'Active Now' : isPast ? 'Ended' : 'Upcoming'}
                </span>
            </div>

            <div className="grid-cards" style={{ marginBottom: '3rem' }}>
                <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', background: 'rgba(16, 185, 129, 0.1)' }}>
                    <h3 className="text-muted">Present</h3>
                    <span style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--c-success)' }}>{presentCount}</span>
                </div>

                <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', background: 'rgba(239, 68, 68, 0.1)' }}>
                    <h3 className="text-muted">Absent</h3>
                    <span style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--c-danger)' }}>{absentCount}</span>
                </div>

                <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', background: 'rgba(124, 58, 237, 0.1)' }}>
                    <h3 className="text-muted">Total Marked</h3>
                    <span style={{ fontSize: '2.5rem', fontWeight: 700 }}>{totalStudents}</span>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                <div>
                    <h2 className="title-lg" style={{ marginBottom: '1rem' }}>Attendance List</h2>
                    <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ background: 'var(--c-surface-hover)' }}>
                                    <th style={{ padding: '1rem', borderBottom: '1px solid var(--c-surface-border)' }}>Student Name</th>
                                    <th style={{ padding: '1rem', borderBottom: '1px solid var(--c-surface-border)' }}>Status</th>
                                    <th style={{ padding: '1rem', borderBottom: '1px solid var(--c-surface-border)' }}>Time</th>
                                </tr>
                            </thead>
                            <tbody>
                                {classSession.attendances.map(record => (
                                    <tr key={record.id} style={{ borderBottom: '1px solid var(--c-surface-border)' }}>
                                        <td style={{ padding: '1rem', fontWeight: 500 }}>{record.student.name}</td>
                                        <td style={{ padding: '1rem' }}>
                                            <span className={`badge ${record.status === 'PRESENT' ? 'badge-success' : 'badge-danger'}`}>
                                                {record.status}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1rem' }} className="text-muted">
                                            {record.timestamp.toLocaleTimeString()}
                                        </td>
                                    </tr>
                                ))}
                                {classSession.attendances.length === 0 && (
                                    <tr>
                                        <td colSpan={3} style={{ padding: '2rem', textAlign: 'center' }} className="text-muted">
                                            No attendance marked yet.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div>
                    <h2 className="title-lg" style={{ marginBottom: '1rem' }}>Quiz Attached</h2>
                    {quiz ? (
                        <div className="glass-panel">
                            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>{quiz.question}</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
                                {JSON.parse(quiz.options).map((opt: string, idx: number) => (
                                    <div key={idx} style={{
                                        padding: '0.75rem',
                                        borderRadius: '8px',
                                        background: opt === quiz.correctAnswer ? 'rgba(16, 185, 129, 0.1)' : 'var(--c-surface-hover)',
                                        border: opt === quiz.correctAnswer ? '1px solid var(--c-success)' : '1px solid var(--c-surface-border)'
                                    }}>
                                        {opt} {opt === quiz.correctAnswer && <span className="badge badge-success" style={{ marginLeft: '1rem', padding: '0.2rem 0.5rem' }}>Correct Answer</span>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="glass-panel text-muted" style={{ textAlign: 'center', padding: '2rem' }}>
                            No quiz was attached to this session.
                        </div>
                    )}

                    <div style={{ marginTop: '2rem' }}>
                        <Link href="/teacher" className="btn btn-outline" style={{ width: '100%', textAlign: 'center' }}>
                            &larr; Back to Classes
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
