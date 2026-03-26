'use client'

import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { logoutAction } from '@/app/actions/logout'

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter()
    const pathname = usePathname()

    const handleLogout = async () => {
        await logoutAction()
        router.push('/login')
    }

    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
            <aside className="glass-panel" style={{ width: '250px', margin: '1rem', display: 'flex', flexDirection: 'column' }}>
                <div style={{ marginBottom: '2rem' }}>
                    <h2 className="title-lg" style={{ margin: 0 }}>Presence.</h2>
                    <span className="badge badge-warning">Teacher</span>
                </div>

                <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flexGrow: 1 }}>
                    <Link href="/teacher" className={`btn ${pathname === '/teacher' ? 'btn-primary' : 'btn-outline'}`} style={{ justifyContent: 'flex-start' }}>
                        Classes
                    </Link>
                    <Link href="/teacher/classes/new" className={`btn ${pathname === '/teacher/classes/new' ? 'btn-primary' : 'btn-outline'}`} style={{ justifyContent: 'flex-start' }}>
                        Create Class
                    </Link>
                    <Link href="/teacher/reports" className={`btn ${pathname === '/teacher/reports' ? 'btn-primary' : 'btn-outline'}`} style={{ justifyContent: 'flex-start' }}>
                        Reports
                    </Link>
                </nav>

                <button onClick={handleLogout} className="btn btn-outline" style={{ marginTop: 'auto' }}>
                    Logout
                </button>
            </aside>

            <main style={{ flexGrow: 1, padding: '1rem 2rem 1rem 0' }}>
                <div className="glass-panel" style={{ minHeight: 'calc(100vh - 2rem)', borderTopLeftRadius: '0', borderBottomLeftRadius: '0' }}>
                    {children}
                </div>
            </main>
        </div>
    )
}
