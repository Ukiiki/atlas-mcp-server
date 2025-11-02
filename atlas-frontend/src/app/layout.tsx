import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navigation from '@/components/Navigation'
import { CopilotChat } from '@/components/CopilotChat'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Carlsbad Chamber of Commerce - Management Platform',
  description: 'Official AI-powered member management platform for the Carlsbad Chamber of Commerce - Connecting businesses, creating opportunities.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Chamber Approve',
  },
}

export const viewport: Viewport = {
  themeColor: '#0ea5e9',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body className={inter.className} suppressHydrationWarning={true}>
        <CopilotChat>
          <div className="flex h-screen bg-gradient-to-br from-slate-50 via-sky-50 to-cyan-50">
            <Navigation />
            <main className="flex-1 overflow-hidden">
              {children}
            </main>
          </div>
        </CopilotChat>
      </body>
    </html>
  )
}
