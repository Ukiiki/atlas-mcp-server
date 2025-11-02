'use client'

import { ReactNode } from "react"
import { CopilotKit } from "@copilotkit/react-core"
import { CopilotSidebar } from "@copilotkit/react-ui"
import "@copilotkit/react-ui/styles.css"

interface CopilotChatProps {
  children: ReactNode
}

export function CopilotChat({ children }: CopilotChatProps) {
  return (
    <CopilotKit runtimeUrl="/api/copilotkit">
      <CopilotSidebar
        defaultOpen={false}
        labels={{
          title: "Carlsbad Chamber AI Assistant",
          initial: "Hi! I'm your Chamber AI assistant. I can help you manage members, events, committees, and business listings. What would you like to do?",
        }}
        clickOutsideToClose={false}
      >
        {children}
      </CopilotSidebar>
    </CopilotKit>
  )
}
