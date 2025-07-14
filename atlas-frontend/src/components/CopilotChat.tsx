'use client'

import { CopilotKit } from "@copilotkit/react-core"
import { CopilotPopup } from "@copilotkit/react-ui"
import "@copilotkit/react-ui/styles.css"
import { useState } from "react"
import { MessageSquare, X, TrendingUp, Users, Calendar, DollarSign } from "lucide-react"
import { useChamberActions } from "../hooks/useChamberActions"

interface CopilotChatProps {
  children: any
}

// Internal component that uses chamber actions within CopilotKit context
function CopilotContent({ children, isOpen, setIsOpen }: { children: any, isOpen: boolean, setIsOpen: (open: boolean) => void }) {
  const { dashboardStats } = useChamberActions()

  return (
    <>
      {children}
      
      {/* Enhanced Dashboard Stats Widget */}
      <div className="fixed top-4 right-4 bg-white rounded-lg shadow-lg p-4 z-40 border">
        <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
          <TrendingUp className="w-4 h-4 mr-2" />
          Live Chamber Stats
        </h3>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center">
            <Users className="w-4 h-4 text-blue-500 mr-2" />
            <div>
              <div className="font-semibold">{dashboardStats.totalMembers}</div>
              <div className="text-gray-500 text-xs">Members</div>
            </div>
          </div>
          <div className="flex items-center">
            <Calendar className="w-4 h-4 text-green-500 mr-2" />
            <div>
              <div className="font-semibold">{dashboardStats.activeEvents}</div>
              <div className="text-gray-500 text-xs">Events</div>
            </div>
          </div>
          <div className="flex items-center">
            <DollarSign className="w-4 h-4 text-yellow-500 mr-2" />
            <div>
              <div className="font-semibold">{dashboardStats.pendingPayments}</div>
              <div className="text-gray-500 text-xs">Pending</div>
            </div>
          </div>
          <div className="flex items-center">
            <TrendingUp className="w-4 h-4 text-purple-500 mr-2" />
            <div>
              <div className="font-semibold">${dashboardStats.monthlyRevenue}</div>
              <div className="text-gray-500 text-xs">Revenue</div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced AI Chat Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full p-4 shadow-lg transition-all duration-300 z-50 transform hover:scale-110"
        title="Open Catalyst Rise AI Assistant"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
      </button>

      {/* Enhanced AI Chat Popup */}
      {isOpen && (
        <div className="fixed bottom-20 right-6 w-[500px] h-[600px] z-50">
          <CopilotPopup
            instructions={`
              You are the Catalyst Rise AI Assistant - the world's most advanced chamber management AI with powerful generative UI capabilities.
              
              🎯 CORE SPECIALTIES:
              1. Member Management - Registration, onboarding, directory updates
              2. Event Coordination - Planning, scheduling, attendance tracking  
              3. Financial Operations - Payment processing, billing, invoicing
              4. Analytics & Reporting - Generate insights, trends, custom reports
              5. Real-time Dashboard Updates - Live stats and KPI monitoring
              
              🚀 ADVANCED CAPABILITIES:
              - GENERATIVE UI: Create dynamic interfaces for specific tasks
              - HUMAN-IN-THE-LOOP: Present options for user approval/input
              - FRONTEND ACTIONS: Directly update dashboard stats and UI
              - CONTEXTUAL WORKFLOWS: Adapt to chamber-specific processes
              
              📊 AVAILABLE ACTIONS:
              - searchMembers: Find members by name, business, or type
              - registerNewMember: Complete registration with approval workflow
              - createEvent: Plan events with capacity and type-specific options
              - processPayment: Handle payments with confirmation interfaces
              - generateMembershipReport: Create visual analytics reports
              - updateDashboard: Refresh live statistics and KPIs
              
              🎨 UI BEHAVIOR:
              - Use generative UI components for complex workflows
              - Present clear approval/cancellation options
              - Show progress indicators for multi-step processes
              - Generate contextual forms based on business type
              - Create visual reports with charts and statistics
              
              Always be proactive in suggesting relevant actions and creating helpful interfaces that make chamber management effortless and intuitive.
              
              Current context: Catalyst Rise Chamber Management Dashboard - Ready for advanced agentic operations!
            `}
            labels={{
              title: "🚀 Catalyst Rise AI",
              initial: "Hi! I'm your advanced Catalyst Rise AI assistant with generative UI capabilities. I can help you with member management, event planning, payments, and analytics. What would you like to accomplish today?",
              placeholder: "Try: 'Register a new restaurant member' or 'Create a networking event'...",
            }}
            onSetOpen={setIsOpen}
          />
        </div>
      )}
    </>
  )
}

export function CopilotChat({ children }: CopilotChatProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <CopilotKit 
      runtimeUrl="/api/copilotkit"
      showDevConsole={true}
    >
      <CopilotContent isOpen={isOpen} setIsOpen={setIsOpen}>
        {children}
      </CopilotContent>
    </CopilotKit>
  )
}

// Enhanced chamber management actions hook
export function useCopilotAction() {
  return useChamberActions()
}
