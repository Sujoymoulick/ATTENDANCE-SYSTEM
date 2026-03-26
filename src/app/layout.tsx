import type { Metadata } from 'next'
import './globals.css'

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
      <body>{children}</body>
    </html>
  )
}
