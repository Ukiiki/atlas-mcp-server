'use client'

import { useState, useEffect } from 'react'
import {
  Users,
  Calendar,
  DollarSign,
  TrendingUp,
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  Search,
  Filter,
  Plus,
  BarChart3,
  PieChart,
} from 'lucide-react'
import { atlasAPI, Member, Event, Committee, DashboardStats } from '@/lib/api'
import { CopilotChat } from '@/components/CopilotChat'
import { useChamberActions } from '@/hooks/useChamberActions'

interface DashboardData {
  stats: DashboardStats
  members: Member[]
  events: Event[]
  committees: Committee[]
  intelligence: any
}

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTimeframe, setSelectedTimeframe] = useState('30d')
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load dashboard data
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Load all data in parallel
        const [members, events, committees, intelligence] = await Promise.all([
          atlasAPI.getMembers(),
          atlasAPI.getEvents(),
          atlasAPI.getCommittees(),
          atlasAPI.getComprehensiveIntelligence().catch(() => null), // Intelligence might fail
        ])

        // Calculate stats from real data
        const totalMembers = members.length
        const activeMembers = members.filter(m => m.status === 'Active').length
        const upcomingEvents = events.filter(e => new Date(e.date) > new Date()).length
        const pendingPayments = Math.floor(totalMembers * 0.1) // Estimate
        const totalRevenue = intelligence?.revenue || totalMembers * 150 // Estimate
        const monthlyGrowth = intelligence?.growth || 5.2 // Estimate

        const stats: DashboardStats = {
          totalMembers,
          activeMembers,
          upcomingEvents,
          pendingPayments,
          totalRevenue,
          monthlyGrowth,
        }

        setDashboardData({
          stats,
          members,
          events,
          committees,
          intelligence,
        })
      } catch (err) {
        console.error('Failed to load dashboard data:', err)
        setError(err instanceof Error ? err.message : 'Failed to load data')
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [])

  // Generate recent activity from real data
  const getRecentActivity = (): Array<{
    id: string
    type: string
    message: string
    time: string
    status: 'success' | 'info' | 'warning'
  }> => {
    if (!dashboardData) return []
    
    const activities: Array<{
      id: string
      type: string
      message: string
      time: string
      status: 'success' | 'info' | 'warning'
    }> = []
    
    // Recent members
    const recentMembers = dashboardData.members
      .filter(m => m.joinDate)
      .sort((a, b) => new Date(b.joinDate!).getTime() - new Date(a.joinDate!).getTime())
      .slice(0, 3)
    
    recentMembers.forEach((member) => {
      activities.push({
        id: `member-${member.id}`,
        type: 'member',
        message: `${member.name} joined as a new member`,
        time: getTimeAgo(member.joinDate!),
        status: 'success'
      })
    })

    // Recent events
    const recentEvents = dashboardData.events
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 2)
    
    recentEvents.forEach((event) => {
      activities.push({
        id: `event-${event.id}`,
        type: 'event',
        message: `${event.name} - ${event.attendees || 0} registrations`,
        time: getTimeAgo(event.date),
        status: 'info'
      })
    })

    return activities.slice(0, 5)
  }

  // Get upcoming events
  const getUpcomingEvents = () => {
    if (!dashboardData) return []
    
    return dashboardData.events
      .filter(e => new Date(e.date) > new Date())
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 3)
  }

  // Helper function to format time ago
  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
    return `${Math.floor(diffDays / 30)} months ago`
  }

  if (loading) {
    return (
      <div className="flex-1 overflow-hidden bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex-1 overflow-hidden bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-2">Failed to load dashboard</p>
          <p className="text-gray-600 text-sm">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 btn-primary"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  const recentActivity = getRecentActivity()
  const upcomingEvents = getUpcomingEvents()
  const stats = dashboardData!.stats

  return (
    <CopilotChat>
      <div className="flex-1 overflow-hidden bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Catalyst Rise Dashboard</h1>
            <p className="text-gray-600">Welcome to Catalyst Rise - The world's most advanced chamber management platform</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search members, events, payments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent w-80"
              />
            </div>
            <select
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Members</p>
                <p className="text-3xl font-bold">{stats.totalMembers}</p>
                <p className="text-blue-100 text-sm">+{stats.monthlyGrowth}% this month</p>
              </div>
              <Users className="w-10 h-10 text-blue-200" />
            </div>
          </div>

          <div className="card bg-gradient-to-r from-green-500 to-green-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Active Members</p>
                <p className="text-3xl font-bold">{stats.activeMembers}</p>
                <p className="text-green-100 text-sm">{Math.round((stats.activeMembers / stats.totalMembers) * 100)}% retention rate</p>
              </div>
              <Activity className="w-10 h-10 text-green-200" />
            </div>
          </div>

          <div className="card bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Upcoming Events</p>
                <p className="text-3xl font-bold">{stats.upcomingEvents}</p>
                <p className="text-purple-100 text-sm">Next: {upcomingEvents[0]?.name || 'No events scheduled'}</p>
              </div>
              <Calendar className="w-10 h-10 text-purple-200" />
            </div>
          </div>

          <div className="card bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">Revenue (YTD)</p>
                <p className="text-3xl font-bold">${stats.totalRevenue.toLocaleString()}</p>
                <p className="text-orange-100 text-sm">{stats.pendingPayments} pending payments</p>
              </div>
              <DollarSign className="w-10 h-10 text-orange-200" />
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
                <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">View all</button>
              </div>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 ${
                      activity.status === 'success' ? 'bg-green-500' :
                      activity.status === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">{activity.message}</p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions & Pending Tasks */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full btn-primary text-left flex items-center">
                  <Plus className="w-4 h-4 mr-2" />
                  Add New Member
                </button>
                <button className="w-full btn-secondary text-left flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  Create Event
                </button>
                <button className="w-full btn-secondary text-left flex items-center">
                  <DollarSign className="w-4 h-4 mr-2" />
                  Send Invoice
                </button>
                <button className="w-full btn-secondary text-left flex items-center">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Generate Report
                </button>
              </div>
            </div>

            {/* Pending Tasks */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Pending Tasks</h3>
              <div className="space-y-3">
                {[
                  { id: 1, task: `Review ${Math.floor(stats.totalMembers * 0.02)} new member applications`, priority: 'high', dueDate: 'Today' },
                  { id: 2, task: `Send payment reminders (${stats.pendingPayments} members)`, priority: 'medium', dueDate: 'Tomorrow' },
                  { id: 3, task: 'Prepare quarterly membership report', priority: 'low', dueDate: 'Next week' },
                ].map((task) => (
                  <div key={task.id} className="flex items-start space-x-3">
                    <div className={`flex-shrink-0 w-3 h-3 rounded-full mt-1 ${
                      task.priority === 'high' ? 'bg-red-500' :
                      task.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">{task.task}</p>
                      <p className="text-xs text-gray-500">Due: {task.dueDate}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="mt-8">
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Upcoming Events</h2>
              <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">Manage events</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {upcomingEvents.length > 0 ? upcomingEvents.map((event) => (
                <div key={event.id} className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 transition-colors">
                  <h3 className="font-medium text-gray-900 mb-2">{event.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{new Date(event.date).toLocaleDateString()}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">{event.attendees || 0}/{event.capacity || 100} registered</span>
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-primary-500 h-2 rounded-full" 
                        style={{ width: `${((event.attendees || 0) / (event.capacity || 100)) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              )) : (
                <div className="col-span-3 text-center py-8 text-gray-500">
                  <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No upcoming events scheduled</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
    </CopilotChat>
  )
}
