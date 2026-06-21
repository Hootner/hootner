import { useState, useCallback } from "react";
import { gql } from "@apollo/client";
import { useApolloClient } from "@apollo/client";

const INVOKE_AGENT = gql`
  mutation InvokeAgent($agentId: String!, $input: AgentInput!) {
    invokeAgent(agentId: $agentId, input: $input) {
      requestId
      status
      result
    }
  }
`;

const AGENT_STATUS = gql`
  query AgentStatus($requestId: String!) {
    agentStatus(requestId: $requestId) {
      status
      result
      error
    }
  }
`;

export type AgentType = "video-intelligence" | "3d-scene-manipulation";

interface AgentRequest {
  prompt: string;
  context?: Record<string, unknown>;
  model?: string;
}

interface AgentResponse {
  requestId: string;
  status: "pending" | "running" | "completed" | "failed";
  result: unknown;
  error?: string;
}

/**
 * Hook to interact with the hootner agent orchestration system.
 * Replaces direct `spark.llm()` calls with routed requests through
 * the MCP server at heptagonal/3-communication/.
 *
 * Two specialized agents:
 * - "video-intelligence": tags, summaries, sentiment analysis, content moderation
 * - "3d-scene-manipulation": natural language to 3D scene config
 */
export function useAgentAI(agentType: AgentType) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const client = useApolloClient();

  const invoke = useCallback(
    async (request: AgentRequest): Promise<AgentResponse> => {
      setLoading(true);
      setError(null);

      try {
        const result = await client.mutate({
          mutation: INVOKE_AGENT,
          variables: {
            agentId: agentType,
            input: {
              prompt: request.prompt,
              context: JSON.stringify(request.context || {}),
              model: request.model || "gpt-4o",
            },
          },
        });

        const response = result.data?.invokeAgent;
        if (!response) throw new Error("No response from agent");

        // Poll for completion if async
        if (response.status === "pending" || response.status === "running") {
          return await pollForResult(response.requestId);
        }

        return {
          requestId: response.requestId,
          status: response.status,
          result: JSON.parse(response.result || "null"),
        };
      } catch (err) {
        const message = err instanceof Error ? err.message : "Agent invocation failed";
        setError(message);
        return {
          requestId: "",
          status: "failed",
          result: null,
          error: message,
        };
      } finally {
        setLoading(false);
      }
    },
    [agentType, client]
  );

  const pollForResult = useCallback(
    async (requestId: string, maxAttempts = 30): Promise<AgentResponse> => {
      for (let i = 0; i < maxAttempts; i++) {
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const result = await client.query({
          query: AGENT_STATUS,
          variables: { requestId },
          fetchPolicy: "network-only",
        });

        const status = result.data?.agentStatus;
        if (status?.status === "completed") {
          return {
            requestId,
            status: "completed",
            result: JSON.parse(status.result || "null"),
          };
        }
        if (status?.status === "failed") {
          return {
            requestId,
            status: "failed",
            result: null,
            error: status.error,
          };
        }
      }

      return {
        requestId,
        status: "failed",
        result: null,
        error: "Agent request timed out",
      };
    },
    [client]
  );

  return { invoke, loading, error };
}

/**
 * Convenience hook for video intelligence tasks
 */
export function useVideoIntelligence() {
  const { invoke, loading, error } = useAgentAI("video-intelligence");

  const generateTags = (videoDescription: string) =>
    invoke({ prompt: `Generate tags for: ${videoDescription}`, context: { task: "tags" } });

  const generateSummary = (videoDescription: string) =>
    invoke({ prompt: `Summarize: ${videoDescription}`, context: { task: "summary" } });

  const analyzeSentiment = (content: string) =>
    invoke({ prompt: `Analyze sentiment: ${content}`, context: { task: "sentiment" } });

  return { generateTags, generateSummary, analyzeSentiment, loading, error };
}

/**
 * Convenience hook for 3D scene manipulation
 */
export function useSceneAI() {
  const { invoke, loading, error } = useAgentAI("3d-scene-manipulation");

  const generateScene = (description: string) =>
    invoke({
      prompt: description,
      context: { task: "scene-generation", outputFormat: "hologram-project" },
    });

  const modifyScene = (currentConfig: Record<string, unknown>, instruction: string) =>
    invoke({
      prompt: instruction,
      context: { task: "scene-modification", currentConfig },
    });

  return { generateScene, modifyScene, loading, error };
}
