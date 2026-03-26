import Link from 'next/link'
import { prisma } from '@/lib/prisma'

export default async function LandingPage() {
  const [totalUsers, totalInstitutions, totalClasses] = await Promise.all([
    prisma.user.count(),
    prisma.institution.count(),
    prisma.classSession.count()
  ])

  const recentAttendance = await prisma.attendance.findFirst({
    orderBy: { timestamp: 'desc' },
    include: { student: true, classSession: true }
  })

  const recentQuiz = await prisma.quiz.findFirst({
    orderBy: { createdAt: 'desc' },
    include: { classSession: true }
  })

  return (
    <div className="flex-center" style={{ minHeight: '100vh', padding: '2rem', flexDirection: 'column' }}>
      <div className="animate-fade-in" style={{ textAlign: 'center', maxWidth: '800px' }}>
        <div style={{ marginBottom: '1rem' }}>
          <span className="badge badge-primary" style={{ background: 'var(--c-primary-light)', color: 'var(--c-primary-hover)' }}>v1.0 is live</span>
        </div>

        <h1 style={{ fontSize: '4.5rem', fontWeight: 700, lineHeight: 1.1, marginBottom: '1.5rem', letterSpacing: '-0.03em' }}>
          Dynamic Attendance <br /> <span style={{ color: 'var(--c-primary)' }}>Reimagined.</span>
        </h1>

        <p className="text-muted" style={{ fontSize: '1.2rem', marginBottom: '2rem', maxWidth: '600px', margin: '0 auto' }}>
          Smart, time-restricted, and quiz-based attendance tracking for modern schools, colleges, and coaching centers.
        </p>

        <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', marginBottom: '3rem' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--c-primary)' }}>{totalInstitutions}</div>
            <div className="text-muted" style={{ fontSize: '0.85rem' }}>Institutions</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--c-success)' }}>{totalClasses}</div>
            <div className="text-muted" style={{ fontSize: '0.85rem' }}>Classes Conducted</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--c-warning)' }}>{totalUsers}</div>
            <div className="text-muted" style={{ fontSize: '0.85rem' }}>Active Users</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <Link href="/login" className="btn btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}>
            Get Started
          </Link>
          <a href="https://github.com/presence-app" target="_blank" className="btn btn-outline" style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}>
            View Documentation
          </a>
        </div>
      </div>

      {recentAttendance && (
        <div className="glass-panel" style={{ position: 'absolute', bottom: '10%', left: '10%', padding: '1.5rem', transform: 'rotate(-5deg)', opacity: 0.8, pointerEvents: 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: 'var(--c-success)' }}></div>
            <strong>Attendance verified</strong>
          </div>
          <p className="text-muted" style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>
            {recentAttendance.student.name} - {recentAttendance.status === 'PRESENT' ? 'Present' : 'Marked'} in {recentAttendance.classSession.title}
          </p>
        </div>
      )}

      {recentQuiz && (
        <div className="glass-panel" style={{ position: 'absolute', top: '20%', right: '10%', padding: '1.5rem', transform: 'rotate(3deg)', opacity: 0.8, pointerEvents: 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: 'var(--c-primary)' }}></div>
            <strong>Quiz Assigned</strong>
          </div>
          <p className="text-muted" style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>
            {recentQuiz.classSession.title} - Answer correctly within time
          </p>
        </div>
      )}
    </div>
  )
}
