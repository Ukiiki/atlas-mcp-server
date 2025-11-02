// Simple in-memory approval system
// TODO: Upgrade to Supabase for persistence and real-time updates

export interface ApprovalRequest {
  id: string
  title: string
  description: string
  category: 'deployment' | 'code_change' | 'data_migration' | 'configuration' | 'other'
  status: 'pending' | 'approved' | 'rejected'
  createdAt: Date
  updatedAt: Date
  metadata?: Record<string, any>
  notes?: string
}

export interface ApprovalQuestion {
  id: string
  question: string
  options?: string[]
  response?: string
  createdAt: Date
  answeredAt?: Date
}

class ApprovalStore {
  private requests: Map<string, ApprovalRequest> = new Map()
  private questions: Map<string, ApprovalQuestion> = new Map()

  // Approval Requests
  createRequest(data: Omit<ApprovalRequest, 'id' | 'createdAt' | 'updatedAt'>): ApprovalRequest {
    const request: ApprovalRequest = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    this.requests.set(request.id, request)
    return request
  }

  getRequest(id: string): ApprovalRequest | undefined {
    return this.requests.get(id)
  }

  getAllRequests(): ApprovalRequest[] {
    return Array.from(this.requests.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    )
  }

  getPendingRequests(): ApprovalRequest[] {
    return this.getAllRequests().filter((r) => r.status === 'pending')
  }

  updateRequest(id: string, updates: Partial<ApprovalRequest>): ApprovalRequest | undefined {
    const request = this.requests.get(id)
    if (!request) return undefined

    const updated = {
      ...request,
      ...updates,
      updatedAt: new Date(),
    }
    this.requests.set(id, updated)
    return updated
  }

  approveRequest(id: string, notes?: string): ApprovalRequest | undefined {
    return this.updateRequest(id, { status: 'approved', notes })
  }

  rejectRequest(id: string, notes?: string): ApprovalRequest | undefined {
    return this.updateRequest(id, { status: 'rejected', notes })
  }

  // Questions
  createQuestion(data: Omit<ApprovalQuestion, 'id' | 'createdAt'>): ApprovalQuestion {
    const question: ApprovalQuestion = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    }
    this.questions.set(question.id, question)
    return question
  }

  getQuestion(id: string): ApprovalQuestion | undefined {
    return this.questions.get(id)
  }

  getAllQuestions(): ApprovalQuestion[] {
    return Array.from(this.questions.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    )
  }

  getUnansweredQuestions(): ApprovalQuestion[] {
    return this.getAllQuestions().filter((q) => !q.response)
  }

  answerQuestion(id: string, response: string): ApprovalQuestion | undefined {
    const question = this.questions.get(id)
    if (!question) return undefined

    const updated = {
      ...question,
      response,
      answeredAt: new Date(),
    }
    this.questions.set(id, updated)
    return updated
  }

  // Stats
  getStats() {
    const requests = this.getAllRequests()
    const questions = this.getAllQuestions()

    return {
      totalRequests: requests.length,
      pending: requests.filter((r) => r.status === 'pending').length,
      approved: requests.filter((r) => r.status === 'approved').length,
      rejected: requests.filter((r) => r.status === 'rejected').length,
      unansweredQuestions: questions.filter((q) => !q.response).length,
      totalQuestions: questions.length,
    }
  }
}

// Singleton instance
export const approvalStore = new ApprovalStore()
