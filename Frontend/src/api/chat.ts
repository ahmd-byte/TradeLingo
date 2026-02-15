import apiClient from "./client";
import type { ChatRequest, ChatResponse, TherapyRequest } from "./types";

// ============================================================
// Chat / SuperBear API
// ============================================================

/**
 * Send a message to SuperBear (unified chat endpoint)
 */
export async function sendChatMessage(
  data: ChatRequest,
): Promise<ChatResponse> {
  const response = await apiClient.post<ChatResponse>("/api/chat", data);
  return response.data;
}

/**
 * Send a therapy/wellness message
 */
export async function sendTherapyMessage(
  data: TherapyRequest,
): Promise<ChatResponse> {
  const response = await apiClient.post<ChatResponse>("/api/therapy", data);
  return response.data;
}
