import {
  CopilotRuntime,
  OpenAIAdapter,
  copilotRuntimeNextJSAppRouterEndpoint,
} from "@copilotkit/runtime";
import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";

// Check if API key is configured
const apiKey = process.env.OPENAI_API_KEY || 'sk-placeholder';

const openai = new OpenAI({
  apiKey,
  dangerouslyAllowBrowser: false,
});

const serviceAdapter = new OpenAIAdapter({ openai });
const runtime = new CopilotRuntime();

export const POST = async (req: NextRequest) => {
  // If no real API key is configured, return a helpful error
  if (apiKey === 'sk-placeholder') {
    return NextResponse.json({
      error: 'CopilotKit is not configured. Please add OPENAI_API_KEY to your environment variables.',
    }, { status: 503 });
  }

  const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
    runtime,
    serviceAdapter,
    endpoint: "/api/copilotkit",
  });

  return handleRequest(req);
};
