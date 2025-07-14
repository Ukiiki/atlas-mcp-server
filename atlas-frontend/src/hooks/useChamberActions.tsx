'use client'

import { useCopilotAction, useCopilotReadable } from "@copilotkit/react-core"
import { useState } from "react"

// Types for chamber management
interface Member {
  id: string
  name: string
  businessName: string
  membershipType: string
  email: string
  phone: string
  status: 'active' | 'pending' | 'expired'
}

interface Event {
  id: string
  title: string
  date: string
  type: 'networking' | 'workshop' | 'meeting' | 'social'
  attendees: number
  maxAttendees: number
  status: 'upcoming' | 'active' | 'completed'
}

interface Payment {
  id: string
  memberId: string
  amount: number
  type: 'membership' | 'event' | 'other'
  status: 'pending' | 'completed' | 'failed'
  dueDate: string
}

export function useChamberActions() {
  // State for chamber data
  const [members, setMembers] = useState<Member[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)
  const [dashboardStats, setDashboardStats] = useState({
    totalMembers: 0,
    activeEvents: 0,
    pendingPayments: 0,
    monthlyRevenue: 0
  })

  // Make chamber data readable to AI
  useCopilotReadable({
    description: "Current chamber members database",
    value: members,
  })

  useCopilotReadable({
    description: "Upcoming and active chamber events",
    value: events,
  })

  useCopilotReadable({
    description: "Payment records and pending transactions",
    value: payments,
  })

  useCopilotReadable({
    description: "Chamber dashboard statistics and KPIs",
    value: dashboardStats,
  })

  useCopilotReadable({
    description: "Currently selected member for detailed operations",
    value: selectedMember,
  })

  // Member Management Actions
  useCopilotAction({
    name: "searchMembers",
    description: "Search for chamber members by name, business, or membership type",
    parameters: [
      { name: "query", type: "string", description: "Search query (name, business, or type)", required: true },
      { name: "membershipType", type: "string", description: "Filter by membership type (optional)" },
    ],
    handler: async ({ query, membershipType }) => {
      // Simulate API call to Atlas MCP server
      const mockResults: Member[] = [
        {
          id: "1",
          name: "John Smith",
          businessName: "Smith's Restaurant",
          membershipType: "Restaurant",
          email: "john@smithsrestaurant.com",
          phone: "(555) 123-4567",
          status: "active"
        },
        {
          id: "2", 
          name: "Sarah Johnson",
          businessName: "Johnson Legal Services",
          membershipType: "Professional Services",
          email: "sarah@johnsonlegal.com",
          phone: "(555) 987-6543",
          status: "active"
        }
      ]
      
      const filteredResults = mockResults.filter(member => 
        member.name.toLowerCase().includes(query.toLowerCase()) ||
        member.businessName.toLowerCase().includes(query.toLowerCase()) ||
        (membershipType && member.membershipType === membershipType)
      )
      
      setMembers(filteredResults)
      return `Found ${filteredResults.length} members matching "${query}"`
    },
  })

  useCopilotAction({
    name: "registerNewMember",
    description: "Register a new chamber member with their business information",
    parameters: [
      { name: "name", type: "string", description: "Full name of the member", required: true },
      { name: "businessName", type: "string", description: "Name of their business", required: true },
      { name: "membershipType", type: "string", description: "Type of membership (Restaurant, Retail, Professional Services, etc.)", required: true },
      { name: "email", type: "string", description: "Contact email", required: true },
      { name: "phone", type: "string", description: "Contact phone number", required: true },
    ],
    renderAndWaitForResponse: ({ args, status, respond }) => {
      const { name, businessName, membershipType, email, phone } = args

      return (
        <div className="bg-white border rounded-lg p-6 shadow-lg max-w-md">
          <h3 className="text-lg font-semibold mb-4">🎯 New Member Registration</h3>
          <div className="space-y-3">
            <div><strong>Name:</strong> {name}</div>
            <div><strong>Business:</strong> {businessName}</div>
            <div><strong>Type:</strong> {membershipType}</div>
            <div><strong>Email:</strong> {email}</div>
            <div><strong>Phone:</strong> {phone}</div>
          </div>
          <div className="flex gap-3 mt-6">
            <button 
              onClick={() => {
                const newMember: Member = {
                  id: Date.now().toString(),
                  name: name as string,
                  businessName: businessName as string,
                  membershipType: membershipType as string,
                  email: email as string,
                  phone: phone as string,
                  status: 'pending'
                }
                setMembers(prev => [...prev, newMember])
                setDashboardStats(prev => ({ ...prev, totalMembers: prev.totalMembers + 1 }))
                respond?.(`✅ Successfully registered ${name} from ${businessName}! Member ID: ${newMember.id}`)
              }}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              ✅ Approve Registration
            </button>
            <button 
              onClick={() => respond?.("❌ Registration cancelled by user")}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        </div>
      )
    },
  })

  // Event Management Actions
  useCopilotAction({
    name: "createEvent",
    description: "Create a new chamber event with details and capacity",
    parameters: [
      { name: "title", type: "string", description: "Event title", required: true },
      { name: "date", type: "string", description: "Event date (YYYY-MM-DD)", required: true },
      { name: "type", type: "string", description: "Event type: networking, workshop, meeting, or social", required: true },
      { name: "maxAttendees", type: "number", description: "Maximum number of attendees", required: true },
      { name: "description", type: "string", description: "Event description" },
    ],
    renderAndWaitForResponse: ({ args, status, respond }) => {
      const { title, date, type, maxAttendees, description } = args

      return (
        <div className="bg-white border rounded-lg p-6 shadow-lg max-w-lg">
          <h3 className="text-lg font-semibold mb-4">📅 Create New Event</h3>
          <div className="space-y-3">
            <div><strong>Title:</strong> {title}</div>
            <div><strong>Date:</strong> {date}</div>
            <div><strong>Type:</strong> <span className="capitalize">{type as string}</span></div>
            <div><strong>Max Attendees:</strong> {maxAttendees}</div>
            {description && <div><strong>Description:</strong> {description}</div>}
          </div>
          <div className="flex gap-3 mt-6">
            <button 
              onClick={() => {
                const newEvent: Event = {
                  id: Date.now().toString(),
                  title: title as string,
                  date: date as string,
                  type: type as Event['type'],
                  attendees: 0,
                  maxAttendees: maxAttendees as number,
                  status: 'upcoming'
                }
                setEvents(prev => [...prev, newEvent])
                setDashboardStats(prev => ({ ...prev, activeEvents: prev.activeEvents + 1 }))
                respond?.(`🎉 Event "${title}" created successfully! Event ID: ${newEvent.id}`)
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              🎉 Create Event
            </button>
            <button 
              onClick={() => respond?.("❌ Event creation cancelled")}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        </div>
      )
    },
  })

  // Payment Management Actions
  useCopilotAction({
    name: "processPayment",
    description: "Process a payment for membership fees or event registration",
    parameters: [
      { name: "memberId", type: "string", description: "Member ID", required: true },
      { name: "amount", type: "number", description: "Payment amount", required: true },
      { name: "type", type: "string", description: "Payment type: membership, event, or other", required: true },
      { name: "description", type: "string", description: "Payment description" },
    ],
    renderAndWaitForResponse: ({ args, status, respond }) => {
      const { memberId, amount, type, description } = args

      return (
        <div className="bg-white border rounded-lg p-6 shadow-lg max-w-md">
          <h3 className="text-lg font-semibold mb-4">💳 Process Payment</h3>
          <div className="space-y-3">
            <div><strong>Member ID:</strong> {memberId}</div>
            <div><strong>Amount:</strong> ${amount}</div>
            <div><strong>Type:</strong> <span className="capitalize">{type as string}</span></div>
            {description && <div><strong>Description:</strong> {description}</div>}
          </div>
          <div className="flex gap-3 mt-6">
            <button 
              onClick={() => {
                const newPayment: Payment = {
                  id: Date.now().toString(),
                  memberId: memberId as string,
                  amount: amount as number,
                  type: type as Payment['type'],
                  status: 'completed',
                  dueDate: new Date().toISOString().split('T')[0]
                }
                setPayments(prev => [...prev, newPayment])
                setDashboardStats(prev => ({ 
                  ...prev, 
                  monthlyRevenue: prev.monthlyRevenue + (amount as number) 
                }))
                respond?.(`✅ Payment of $${amount} processed successfully! Transaction ID: ${newPayment.id}`)
              }}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              💳 Process Payment
            </button>
            <button 
              onClick={() => respond?.("❌ Payment cancelled")}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        </div>
      )
    },
  })

  // Analytics & Reporting Actions
  useCopilotAction({
    name: "generateMembershipReport",
    description: "Generate a comprehensive membership analytics report",
    parameters: [
      { name: "reportType", type: "string", description: "Type of report: summary, detailed, or trends", required: true },
      { name: "dateRange", type: "string", description: "Date range: last30days, last3months, or lastyear" },
    ],
    renderAndWaitForResponse: ({ args, status, respond }) => {
      const { reportType, dateRange } = args

      // Simulate report generation
      const reportData = {
        totalMembers: 156,
        newMembersThisMonth: 12,
        renewalRate: 85,
        revenueThisMonth: 15420,
        topMembershipTypes: [
          { type: "Restaurant", count: 45 },
          { type: "Professional Services", count: 38 },
          { type: "Retail", count: 32 },
        ]
      }

      return (
        <div className="bg-white border rounded-lg p-6 shadow-lg max-w-lg">
          <h3 className="text-lg font-semibold mb-4">📊 Membership Report</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 p-3 rounded">
                <div className="text-2xl font-bold text-blue-600">{reportData.totalMembers}</div>
                <div className="text-sm text-gray-600">Total Members</div>
              </div>
              <div className="bg-green-50 p-3 rounded">
                <div className="text-2xl font-bold text-green-600">{reportData.newMembersThisMonth}</div>
                <div className="text-sm text-gray-600">New This Month</div>
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Top Membership Types:</h4>
              {reportData.topMembershipTypes.map((item, index) => (
                <div key={index} className="flex justify-between">
                  <span>{item.type}</span>
                  <span className="font-semibold">{item.count}</span>
                </div>
              ))}
            </div>
          </div>
          <button 
            onClick={() => {
              respond?.(`📊 ${reportType} membership report generated successfully! Key insights: ${reportData.totalMembers} total members, ${reportData.newMembersThisMonth} new this month, ${reportData.renewalRate}% renewal rate.`)
            }}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mt-4"
          >
            📊 Generate Full Report
          </button>
        </div>
      )
    },
  })

  // Dashboard Updates Action
  useCopilotAction({
    name: "updateDashboard",
    description: "Update and refresh chamber dashboard with latest statistics",
    parameters: [],
    handler: async () => {
      // Simulate fetching latest stats from Atlas MCP server
      const newStats = {
        totalMembers: members.length || 156,
        activeEvents: events.filter(e => e.status === 'upcoming' || e.status === 'active').length || 8,
        pendingPayments: payments.filter(p => p.status === 'pending').length || 23,
        monthlyRevenue: payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0) || 15420
      }
      
      setDashboardStats(newStats)
      return `✅ Dashboard updated! Current stats: ${newStats.totalMembers} members, ${newStats.activeEvents} active events, ${newStats.pendingPayments} pending payments, $${newStats.monthlyRevenue} monthly revenue.`
    },
  })

  return {
    members,
    events,
    payments,
    dashboardStats,
    selectedMember,
    setSelectedMember,
  }
}
