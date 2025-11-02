'use client'

import { useState, useEffect } from 'react'
import { Lock } from 'lucide-react'

export default function ApproveLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    // Check if already authenticated
    const auth = sessionStorage.getItem('approvals_auth')
    if (auth === 'true') {
      setIsAuthenticated(true)
    }
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Simple PIN check - in production, verify against backend
    // For now, accept any 4-digit PIN (you can set a specific one in .env)
    const validPin = process.env.NEXT_PUBLIC_APPROVAL_PIN || '1234'

    if (pin === validPin) {
      setIsAuthenticated(true)
      sessionStorage.setItem('approvals_auth', 'true')
      setError('')
    } else {
      setError('Invalid PIN. Please try again.')
      setPin('')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Only allow numbers
    if (!/[0-9]/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Enter') {
      e.preventDefault()
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50 to-cyan-50 flex items-center justify-center p-4">
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl border border-sky-200 p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-sky-500 to-cyan-600 rounded-full mb-4">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-sky-600 to-cyan-600 bg-clip-text text-transparent mb-2">
              Secure Access
            </h1>
            <p className="text-gray-600">
              Enter your PIN to access the approval dashboard
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={4}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter 4-digit PIN"
                className="w-full text-center text-2xl tracking-widest bg-white border-2 border-sky-300 rounded-xl p-4 focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                autoFocus
              />
              {error && (
                <p className="text-red-600 text-sm mt-2 text-center">{error}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={pin.length !== 4}
              className="w-full bg-gradient-to-r from-sky-500 to-cyan-600 text-white font-semibold py-4 px-6 rounded-xl hover:shadow-lg hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              Unlock
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              Default PIN: 1234 (configurable in .env)
            </p>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
