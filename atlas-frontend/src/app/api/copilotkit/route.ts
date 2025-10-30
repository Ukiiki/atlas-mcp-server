import { CopilotRuntime, OpenAIAdapter, copilotRuntimeNextJSAppRouterEndpoint } from "@copilotkit/runtime";
import OpenAI from "openai";
import { NextRequest } from "next/server";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

// Create CopilotRuntime instance
const copilotKit = new CopilotRuntime();

// Use OpenAI GPT-4 as the service adapter - works reliably with CopilotKit
const serviceAdapter = new OpenAIAdapter({ 
  openai,
  model: "gpt-4o", // Fast, capable, and works perfectly with all MCP tools
});

export const POST = async (req: NextRequest) => {
  const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
    runtime: copilotKit,
    serviceAdapter,
    endpoint: "/api/copilotkit",
  });

  return handleRequest(req);
};
