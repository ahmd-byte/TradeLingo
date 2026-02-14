import api from "./api";
import type { TradeDiagnostic, ExplainTradePayload } from "../types/api";

/**
 * Request a deep diagnostic explanation for a trade.
 * POST /trades/explain
 *
 * If no trade_id is provided the backend analyses the user's latest trade.
 */
export async function explainTrade(
  tradeId?: string,
  userMessage?: string,
  detectedEmotion?: string,
): Promise<TradeDiagnostic> {
  const payload: ExplainTradePayload = {};
  if (tradeId) payload.trade_id = tradeId;
  if (userMessage) payload.user_message = userMessage;
  if (detectedEmotion) payload.detected_emotion = detectedEmotion;

  const { data } = await api.post<TradeDiagnostic>("/trades/explain", payload);
  return data;
}

/**
 * Fetch user's recent trades.
 * GET /trades/list
 */
export async function listTrades(limit = 10): Promise<{ trades: Record<string, unknown>[]; count: number }> {
  const { data } = await api.get<{ trades: Record<string, unknown>[]; count: number }>(
    `/trades/list?limit=${limit}`,
  );
  return data;
}
