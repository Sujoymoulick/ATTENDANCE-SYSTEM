import type { Metadata } from 'next'
import './globals.css'
import { QueryProvider } from '@/lib/QueryProvider'
import { AuthProvider } from '@/store/AuthContext'

export const metadata: Metadata = {
  title: 'Presence - Dynamic Attendance',
  description: 'Smart attendance tracking for modern institutions.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <QueryProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  )
}
