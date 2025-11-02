'use client'

import { useState, useEffect } from 'react'
import { Check, X, MessageCircle, RefreshCw, Clock, CheckCircle, XCircle } from 'lucide-react'

interface ApprovalRequest {
  id: string
  title: string
  description: string
  category: string
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
  updatedAt: string
  metadata?: Record<string, any>
  notes?: string
}

interface ApprovalQuestion {
  id: string
  question: string
  options?: string[]
  response?: string
  createdAt: string
  answeredAt?: string
}

interface Stats {
  totalRequests: number
  pending: number
  approved: number
  rejected: number
  unansweredQuestions: number
  totalQuestions: number
}

export default function ApprovePage() {
  const [approvals, setApprovals] = useState<ApprovalRequest[]>([])
  const [questions, setQuestions] = useState<ApprovalQuestion[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedTab, setSelectedTab] = useState<'approvals' | 'questions'>('approvals')

  const fetchData = async () => {
    try {
      setLoading(true)

      // Fetch approvals
      const approvalsRes = await fetch('/api/approvals?status=pending')
      const approvalsData = await approvalsRes.json()
      if (approvalsData.success) {
        setApprovals(approvalsData.data)
        setStats(approvalsData.stats)
      }

      // Fetch questions
      const questionsRes = await fetch('/api/questions?unanswered=true')
      const questionsData = await questionsRes.json()
      if (questionsData.success) {
        setQuestions(questionsData.data)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    // Poll every 5 seconds for updates
    const interval = setInterval(fetchData, 5000)
    return () => clearInterval(interval)
  }, [])

  const handleApproval = async (id: string, status: 'approved' | 'rejected', notes?: string) => {
    try {
      const res = await fetch(`/api/approvals/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, notes }),
      })

      if (res.ok) {
        await fetchData()
      }
    } catch (error) {
      console.error('Error updating approval:', error)
    }
  }

  const handleAnswerQuestion = async (id: string, response: string) => {
    try {
      const res = await fetch(`/api/questions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ response }),
      })

      if (res.ok) {
        await fetchData()
      }
    } catch (error) {
      console.error('Error answering question:', error)
    }
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      deployment: 'bg-purple-100 text-purple-700 border-purple-200',
      code_change: 'bg-blue-100 text-blue-700 border-blue-200',
      data_migration: 'bg-orange-100 text-orange-700 border-orange-200',
      configuration: 'bg-green-100 text-green-700 border-green-200',
      other: 'bg-gray-100 text-gray-700 border-gray-200',
    }
    return colors[category] || colors.other
  }

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      deployment: 'Deployment',
      code_change: 'Code Change',
      data_migration: 'Data Migration',
      configuration: 'Configuration',
      other: 'Other',
    }
    return labels[category] || 'Other'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50 to-cyan-50">
      {/* Mobile-optimized header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-lg border-b border-sky-200 shadow-sm">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-sky-600 to-cyan-600 bg-clip-text text-transparent">
              Approvals
            </h1>
            <button
              onClick={fetchData}
              className="p-2 rounded-full bg-sky-100 text-sky-600 hover:bg-sky-200 transition-all"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Stats cards */}
          {stats && (
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-3 border border-orange-200">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="w-4 h-4 text-orange-600" />
                  <span className="text-xs font-medium text-orange-600">Pending</span>
                </div>
                <p className="text-2xl font-bold text-orange-700">{stats.pending}</p>
              </div>
              <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl p-3 border border-green-200">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-xs font-medium text-green-600">Approved</span>
                </div>
                <p className="text-2xl font-bold text-green-700">{stats.approved}</p>
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedTab('approvals')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                selectedTab === 'approvals'
                  ? 'bg-sky-600 text-white shadow-lg shadow-sky-200'
                  : 'bg-white text-gray-600 hover:bg-sky-50'
              }`}
            >
              Approvals ({stats?.pending || 0})
            </button>
            <button
              onClick={() => setSelectedTab('questions')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                selectedTab === 'questions'
                  ? 'bg-sky-600 text-white shadow-lg shadow-sky-200'
                  : 'bg-white text-gray-600 hover:bg-sky-50'
              }`}
            >
              Questions ({stats?.unansweredQuestions || 0})
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 pb-24">
        {selectedTab === 'approvals' && (
          <div className="space-y-4">
            {approvals.length === 0 && !loading && (
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 text-center border border-sky-200">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">All caught up!</h3>
                <p className="text-gray-600">No pending approvals at the moment.</p>
              </div>
            )}

            {approvals.map((approval) => (
              <div
                key={approval.id}
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-sky-200 hover:shadow-xl transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`text-xs px-3 py-1 rounded-full border font-medium ${getCategoryColor(
                          approval.category
                        )}`}
                      >
                        {getCategoryLabel(approval.category)}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">{approval.title}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                      {approval.description}
                    </p>
                  </div>
                </div>

                {approval.metadata && Object.keys(approval.metadata).length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-3 mb-3">
                    <p className="text-xs font-semibold text-gray-600 mb-2">Details:</p>
                    <div className="space-y-1">
                      {Object.entries(approval.metadata).map(([key, value]) => (
                        <div key={key} className="text-xs text-gray-700">
                          <span className="font-medium">{key}:</span>{' '}
                          <span className="font-mono">{JSON.stringify(value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="text-xs text-gray-500 mb-4">
                  {new Date(approval.createdAt).toLocaleString()}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => handleApproval(approval.id, 'approved')}
                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold py-3 px-4 rounded-xl hover:shadow-lg hover:scale-105 transition-all flex items-center justify-center gap-2"
                  >
                    <Check className="w-5 h-5" />
                    Approve
                  </button>
                  <button
                    onClick={() => handleApproval(approval.id, 'rejected')}
                    className="flex-1 bg-gradient-to-r from-red-500 to-pink-600 text-white font-semibold py-3 px-4 rounded-xl hover:shadow-lg hover:scale-105 transition-all flex items-center justify-center gap-2"
                  >
                    <X className="w-5 h-5" />
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedTab === 'questions' && (
          <div className="space-y-4">
            {questions.length === 0 && !loading && (
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 text-center border border-sky-200">
                <MessageCircle className="w-16 h-16 text-sky-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No questions</h3>
                <p className="text-gray-600">All questions have been answered.</p>
              </div>
            )}

            {questions.map((question) => (
              <div
                key={question.id}
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-sky-200"
              >
                <div className="flex items-start gap-3 mb-4">
                  <MessageCircle className="w-5 h-5 text-sky-600 mt-1 flex-shrink-0" />
                  <p className="text-gray-800 font-medium leading-relaxed">{question.question}</p>
                </div>

                {question.options && question.options.length > 0 ? (
                  <div className="space-y-2">
                    {question.options.map((option, index) => (
                      <button
                        key={index}
                        onClick={() => handleAnswerQuestion(question.id, option)}
                        className="w-full text-left bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-xl p-3 transition-all hover:shadow-md hover:scale-102"
                      >
                        <span className="text-gray-800 font-medium">{option}</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div>
                    <textarea
                      id={`answer-${question.id}`}
                      placeholder="Type your answer..."
                      className="w-full bg-white border border-sky-200 rounded-xl p-3 mb-3 resize-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                      rows={3}
                    />
                    <button
                      onClick={() => {
                        const textarea = document.getElementById(
                          `answer-${question.id}`
                        ) as HTMLTextAreaElement
                        if (textarea?.value) {
                          handleAnswerQuestion(question.id, textarea.value)
                        }
                      }}
                      className="w-full bg-gradient-to-r from-sky-500 to-cyan-600 text-white font-semibold py-3 px-4 rounded-xl hover:shadow-lg hover:scale-105 transition-all"
                    >
                      Submit Answer
                    </button>
                  </div>
                )}

                <div className="text-xs text-gray-500 mt-3">
                  Asked {new Date(question.createdAt).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
