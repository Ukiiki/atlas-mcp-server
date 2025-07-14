import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navigation from '@/components/Navigation'
import { CopilotChat } from '@/components/CopilotChat'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Catalyst Rise - World\'s Best Chamber Platform',
  description: 'AI-Powered Chamber Management System - The Future of Chamber Operations',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <CopilotChat>
          <div className="flex h-screen bg-gray-50">
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
