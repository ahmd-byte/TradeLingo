import api from "./api";
import type { ChatResponse } from "../types/api";

/**
 * Send a message to the SuperBear AI chat.
 * POST /chat
 */
export async function sendMessage(message: string, sessionId?: string): Promise<ChatResponse> {
  const { data } = await api.post<ChatResponse>("/chat", {
    message,
    session_id: sessionId,
  });
  return data;
}

/**
 * Send a message to the therapy endpoint.
 * POST /therapy
 */
export async function sendTherapyMessage(message: string, sessionId?: string): Promise<ChatResponse> {
  const { data } = await api.post<ChatResponse>("/therapy", {
    message,
    session_id: sessionId,
  });
  return data;
}
