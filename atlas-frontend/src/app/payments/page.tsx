'use client'

import { useState } from 'react'
import {
  DollarSign,
  CreditCard,
  Calendar,
  Search,
  Filter,
  Plus,
  Eye,
  Edit,
  Send,
  CheckCircle,
  Clock,
  AlertTriangle,
  Download,
  TrendingUp,
} from 'lucide-react'

const mockPayments = [
  {
    id: 1,
    invoiceNumber: 'INV-2025-001',
    memberName: 'Sarah Johnson',
    company: 'Johnson Marketing Solutions',
    amount: 450,
    dueDate: '2025-01-31',
    status: 'Paid',
    paymentDate: '2025-01-15',
    description: 'Annual Membership - Gold',
    method: 'Credit Card'
  },
  {
    id: 2,
    invoiceNumber: 'INV-2025-002',
    memberName: 'Mike Chen',
    company: 'Pacific Tech Solutions',
    amount: 25,
    dueDate: '2025-01-20',
    status: 'Overdue',
    paymentDate: null,
    description: 'Business Networking Breakfast',
    method: null
  },
  {
    id: 3,
    invoiceNumber: 'INV-2025-003',
    memberName: 'Emily Rodriguez',
    company: 'Coastal Real Estate',
    amount: 750,
    dueDate: '2025-02-15',
    status: 'Pending',
    paymentDate: null,
    description: 'Annual Membership - Platinum',
    method: null
  },
  {
    id: 4,
    invoiceNumber: 'INV-2025-004',
    memberName: 'David Park',
    company: 'Park Financial Advisors',
    amount: 35,
    dueDate: '2025-01-25',
    status: 'Pending',
    paymentDate: null,
    description: 'Economic Development Forum',
    method: null
  },
  {
    id: 5,
    invoiceNumber: 'INV-2024-158',
    memberName: 'Lisa Thompson',
    company: 'Thompson Design Studio',
    amount: 350,
    dueDate: '2024-12-31',
    status: 'Paid',
    paymentDate: '2024-12-28',
    description: 'Annual Membership - Silver',
    method: 'Bank Transfer'
  },
  {
    id: 6,
    invoiceNumber: 'INV-2025-005',
    memberName: 'Robert Martinez',
    company: 'Martinez Construction',
    amount: 125,
    dueDate: '2025-02-10',
    status: 'Pending',
    paymentDate: null,
    description: 'Leadership Workshop',
    method: null
  }
]

export default function PaymentsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [selectedPayment, setSelectedPayment] = useState(null)

  const filteredPayments = mockPayments.filter(payment => {
    const matchesSearch = payment.memberName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         payment.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         payment.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         payment.description.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesFilter = selectedFilter === 'all' || payment.status.toLowerCase() === selectedFilter
    
    return matchesSearch && matchesFilter
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid': return 'bg-green-100 text-green-800'
      case 'Pending': return 'bg-yellow-100 text-yellow-800'
      case 'Overdue': return 'bg-red-100 text-red-800'
      case 'Cancelled': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Paid': return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'Pending': return <Clock className="w-4 h-4 text-yellow-500" />
      case 'Overdue': return <AlertTriangle className="w-4 h-4 text-red-500" />
      default: return <Clock className="w-4 h-4 text-gray-500" />
    }
  }

  const isOverdue = (dueDate: string, status: string) => {
    if (status === 'Paid') return false
    return new Date(dueDate) < new Date()
  }

  const totalRevenue = mockPayments.filter(p => p.status === 'Paid').reduce((sum, p) => sum + p.amount, 0)
  const pendingAmount = mockPayments.filter(p => p.status === 'Pending').reduce((sum, p) => sum + p.amount, 0)
  const overdueAmount = mockPayments.filter(p => p.status === 'Overdue').reduce((sum, p) => sum + p.amount, 0)

  return (
    <div className="flex-1 overflow-hidden bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
            <p className="text-gray-600">Manage invoices, payments, and financial tracking</p>
          </div>
          <div className="flex space-x-3">
            <button className="btn-secondary flex items-center">
              <Download className="w-4 h-4 mr-2" />
              Export
            </button>
            <button className="btn-primary flex items-center">
              <Plus className="w-4 h-4 mr-2" />
              Create Invoice
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">${totalRevenue.toLocaleString()}</p>
            </div>
          </div>
          <div className="flex items-center">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Pending Payments</p>
              <p className="text-2xl font-bold text-gray-900">${pendingAmount.toLocaleString()}</p>
            </div>
          </div>
          <div className="flex items-center">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Overdue Amount</p>
              <p className="text-2xl font-bold text-gray-900">${overdueAmount.toLocaleString()}</p>
            </div>
          </div>
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Invoices</p>
              <p className="text-2xl font-bold text-gray-900">{mockPayments.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by member name, company, invoice number, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <select
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All Payments</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="overdue">Overdue</option>
          </select>
          <button className="btn-secondary flex items-center">
            <Filter className="w-4 h-4 mr-2" />
            More Filters
          </button>
        </div>
      </div>

      {/* Payments List */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Invoice
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Member
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPayments.map((payment) => (
                  <tr 
                    key={payment.id} 
                    className={`hover:bg-gray-50 ${isOverdue(payment.dueDate, payment.status) ? 'bg-red-50' : ''}`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{payment.invoiceNumber}</div>
                        <div className="text-sm text-gray-500">{payment.description}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{payment.memberName}</div>
                        <div className="text-sm text-gray-500">{payment.company}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-gray-900">${payment.amount.toLocaleString()}</div>
                      {payment.method && (
                        <div className="text-xs text-gray-500 flex items-center mt-1">
                          <CreditCard className="w-3 h-3 mr-1" />
                          {payment.method}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{new Date(payment.dueDate).toLocaleDateString()}</div>
                      {payment.paymentDate && (
                        <div className="text-xs text-gray-500">
                          Paid: {new Date(payment.paymentDate).toLocaleDateString()}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(payment.status)}
                        <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(payment.status)}`}>
                          {payment.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button className="text-primary-600 hover:text-primary-900">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="text-gray-600 hover:text-gray-900">
                          <Edit className="w-4 h-4" />
                        </button>
                        {payment.status !== 'Paid' && (
                          <button className="text-green-600 hover:text-green-900">
                            <Send className="w-4 h-4" />
                          </button>
                        )}
                        <button className="text-blue-600 hover:text-blue-900">
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full btn-primary text-left flex items-center">
                <Plus className="w-4 h-4 mr-2" />
                Create New Invoice
              </button>
              <button className="w-full btn-secondary text-left flex items-center">
                <Send className="w-4 h-4 mr-2" />
                Send Payment Reminders
              </button>
              <button className="w-full btn-secondary text-left flex items-center">
                <Download className="w-4 h-4 mr-2" />
                Export Payment Report
              </button>
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Methods</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Credit Card</span>
                <span className="text-sm font-medium text-gray-900">
                  {mockPayments.filter(p => p.method === 'Credit Card').length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Bank Transfer</span>
                <span className="text-sm font-medium text-gray-900">
                  {mockPayments.filter(p => p.method === 'Bank Transfer').length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Check</span>
                <span className="text-sm font-medium text-gray-900">0</span>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-3">
              <div className="text-sm">
                <p className="text-gray-900">Sarah Johnson paid $450</p>
                <p className="text-gray-500 text-xs">2 hours ago</p>
              </div>
              <div className="text-sm">
                <p className="text-gray-900">Invoice INV-2025-005 created</p>
                <p className="text-gray-500 text-xs">1 day ago</p>
              </div>
              <div className="text-sm">
                <p className="text-gray-900">Payment reminder sent to 5 members</p>
                <p className="text-gray-500 text-xs">2 days ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
