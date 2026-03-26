'use client'

import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { logoutAction } from '@/app/actions/logout'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter()
    const pathname = usePathname()

    const handleLogout = async () => {
        await logoutAction()
        router.push('/login')
    }

    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
            {/* Sidebar */}
            <aside className="glass-panel" style={{ width: '250px', margin: '1rem', display: 'flex', flexDirection: 'column' }}>
                <div style={{ marginBottom: '2rem' }}>
                    <h2 className="title-lg" style={{ margin: 0 }}>Presence.</h2>
                    <span className="badge badge-success">Admin</span>
                </div>

                <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flexGrow: 1 }}>
                    <Link href="/admin" className={`btn ${pathname === '/admin' ? 'btn-primary' : 'btn-outline'}`} style={{ justifyContent: 'flex-start' }}>
                        Dashboard
                    </Link>
                    <Link href="/admin/users" className={`btn ${pathname === '/admin/users' ? 'btn-primary' : 'btn-outline'}`} style={{ justifyContent: 'flex-start' }}>
                        Users
                    </Link>
                </nav>

                <button onClick={handleLogout} className="btn btn-outline" style={{ marginTop: 'auto' }}>
                    Logout
                </button>
            </aside>

            {/* Main Content */}
            <main style={{ flexGrow: 1, padding: '1rem 2rem 1rem 0' }}>
                <div className="glass-panel" style={{ minHeight: 'calc(100vh - 2rem)', borderTopLeftRadius: '0', borderBottomLeftRadius: '0' }}>
                    {children}
                </div>
            </main>
        </div>
    )
}
