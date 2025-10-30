'use client'

import { useCopilotAction } from "@copilotkit/react-core"
import { useState, useEffect } from "react"

interface DashboardStats {
  totalMembers: number
  activeEvents: number
  pendingPayments: number
  monthlyRevenue: number
}

// Comprehensive chamber actions hook that registers all MCP tools with CopilotKit
export function useChamberActions() {
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalMembers: 0,
    activeEvents: 0,
    pendingPayments: 0,
    monthlyRevenue: 0
  })

  // Load dashboard stats
  useEffect(() => {
    const loadStats = async () => {
      try {
        const response = await fetch('/api/comprehensive-intelligence')
        if (response.ok) {
          const data = await response.json()
          setDashboardStats({
            totalMembers: data.totalMembers || 0,
            activeEvents: data.activeEvents || 0,
            pendingPayments: data.pendingPayments || 0,
            monthlyRevenue: data.monthlyRevenue || 0
          })
        }
      } catch (error) {
        console.error('Failed to load dashboard stats:', error)
      }
    }
    loadStats()
  }, [])

  // Register Member Management Tools
  useCopilotAction({
    name: "get_members",
    description: "Retrieve all member profiles from the Carlsbad Chamber. Use this to get current member information, contact details, and membership status.",
    parameters: [
      {
        name: "restrictToMember",
        type: "boolean",
        description: "Whether to restrict results to actual members only (default: true)",
        required: false
      },
      {
        name: "pageSize",
        type: "number", 
        description: "Number of profiles to retrieve (default: 100)",
        required: false
      }
    ],
    handler: async ({ restrictToMember = true, pageSize = 100 }) => {
      const response = await fetch('/api/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'get_members', restrictToMember, pageSize })
      })
      const data = await response.json()
      return `Retrieved ${data.members?.length || 0} member profiles. Total members: ${dashboardStats.totalMembers}`
    }
  })

  useCopilotAction({
    name: "get_member_by_id",
    description: "Get detailed information about a specific member by their ID",
    parameters: [
      {
        name: "id",
        type: "string",
        description: "The member's profile ID",
        required: true
      }
    ],
    handler: async ({ id }) => {
      const response = await fetch(`/api/members/${id}`)
      const data = await response.json()
      return `Member details: ${JSON.stringify(data, null, 2)}`
    }
  })

  // Register Event Management Tools
  useCopilotAction({
    name: "get_events",
    description: "Retrieve all chamber events. Use this to see upcoming events, past events, and event details.",
    parameters: [
      {
        name: "pageSize",
        type: "number",
        description: "Number of events to retrieve (default: 100)",
        required: false
      }
    ],
    handler: async ({ pageSize = 100 }) => {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'get_events', pageSize })
      })
      const data = await response.json()
      return `Retrieved ${data.events?.length || 0} events. Active events: ${dashboardStats.activeEvents}`
    }
  })

  // Register Committee Management Tools
  useCopilotAction({
    name: "get_committees",
    description: "Retrieve all chamber committees and their information",
    parameters: [
      {
        name: "pageSize",
        type: "number",
        description: "Number of committees to retrieve (default: 20)",
        required: false
      }
    ],
    handler: async ({ pageSize = 20 }) => {
      const response = await fetch('/api/committees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'get_committees', pageSize })
      })
      const data = await response.json()
      return `Retrieved ${data.committees?.length || 0} committees`
    }
  })

  // Register Business Listings Tools
  useCopilotAction({
    name: "get_business_listings",
    description: "Retrieve chamber business directory listings. Use this to find businesses, contact information, and categories.",
    parameters: [
      {
        name: "pageSize",
        type: "number",
        description: "Number of listings to retrieve (default: 200)",
        required: false
      },
      {
        name: "active",
        type: "boolean",
        description: "Whether to get only active listings (default: true)",
        required: false
      }
    ],
    handler: async ({ pageSize = 200, active = true }) => {
      const response = await fetch('/api/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'get_business_listings', pageSize, active })
      })
      const data = await response.json()
      return `Retrieved ${data.listings?.length || 0} business listings`
    }
  })

  // Register Analytics Tool
  useCopilotAction({
    name: "get_comprehensive_intelligence",
    description: "Get comprehensive chamber analytics including member stats, financial data, event metrics, and trends. Use this for dashboard insights and reporting.",
    parameters: [],
    handler: async () => {
      const response = await fetch('/api/comprehensive-intelligence')
      const data = await response.json()
      return `Chamber Intelligence Report:
- Total Members: ${data.totalMembers || 0}
- Active Members: ${data.activeMembers || 0}
- Active Events: ${data.activeEvents || 0}
- Upcoming Events: ${data.upcomingEvents || 0}
- Monthly Revenue: $${data.monthlyRevenue || 0}
- Pending Payments: ${data.pendingPayments || 0}
- Committee Count: ${data.committeeCount || 0}
- Business Listings: ${data.businessListings || 0}`
    }
  })

  // Register New Member Detection
  useCopilotAction({
    name: "get_new_members",
    description: "Get recently joined members. Useful for onboarding, welcome emails, and tracking growth.",
    parameters: [
      {
        name: "daysBack",
        type: "number",
        description: "Number of days to look back for new members (default: 7)",
        required: false
      }
    ],
    handler: async ({ daysBack = 7 }) => {
      const response = await fetch('/api/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'get_new_members', daysBack })
      })
      const data = await response.json()
      return `Found ${data.newMembers?.length || 0} new members in the last ${daysBack} days`
    }
  })

  return { dashboardStats }
}
