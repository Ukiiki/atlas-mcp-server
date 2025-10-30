'use client'

import { CopilotKit } from "@copilotkit/react-core"
import { CopilotPopup } from "@copilotkit/react-ui"
import "@copilotkit/react-ui/styles.css"
import { ReactNode } from "react"

interface CopilotChatProps {
  children: ReactNode
}

export function CopilotChat({ children }: CopilotChatProps) {
  return (
    <CopilotKit 
      runtimeUrl="/api/copilotkit"
      agent="chamber_assistant"
    >
      {children}
      <CopilotPopup
        instructions="You are the Catalyst Rise AI Assistant - an expert in chamber of commerce management. You have direct access to the Carlsbad Chamber's Atlas MemberClicks system through MCP tools.

Your capabilities include:
- Query member profiles, events, committees, and business listings
- Access real-time chamber data and analytics  
- Help staff manage members, events, and payments
- Generate reports and insights
- Perform data analysis on member engagement

Always provide specific, actionable responses using the real data from the MCP tools. When users ask about chamber information, use the available tools to fetch and present accurate, current data.

Be proactive and helpful - offer to perform tasks, not just provide guidance."
        labels={{
          title: "Catalyst Rise AI Assistant",
          initial: "Hi! I'm your Catalyst Rise AI assistant. I can help you manage members, events, committees, and more. What would you like to know?",
        }}
      />
    </CopilotKit>
  )
}

// Export useCopilotAction for backward compatibility
export { useCopilotAction } from "@copilotkit/react-core"
