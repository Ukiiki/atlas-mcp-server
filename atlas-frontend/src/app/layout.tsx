import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navigation from '@/components/Navigation'
import { CopilotChat } from '@/components/CopilotChat'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Carlsbad Chamber of Commerce - Management Platform',
  description: 'Official AI-powered member management platform for the Carlsbad Chamber of Commerce - Connecting businesses, creating opportunities.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
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
