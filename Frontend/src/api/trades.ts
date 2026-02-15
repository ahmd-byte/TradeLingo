import apiClient from "./client";
import type {
  TradeUploadRequest,
  TradeUploadResponse,
  TradeTypeResponse,
  TradeExplainRequest,
  TradeExplainResponse,
  TradeListResponse,
} from "./types";

// ============================================================
// Trade API
// ============================================================

/**
 * Upload trades
 */
export async function uploadTrades(
  data: TradeUploadRequest,
): Promise<TradeUploadResponse> {
  const response = await apiClient.post<TradeUploadResponse>(
    "/api/trades/upload",
    data,
  );
  return response.data;
}

/**
 * Get the user's classified trade type
 */
export async function getTradeType(): Promise<TradeTypeResponse> {
  const response = await apiClient.get<TradeTypeResponse>(
    "/api/trades/my-type",
  );
  return response.data;
}

/**
 * Deep trade diagnostic / explanation
 */
export async function explainTrade(
  data: TradeExplainRequest,
): Promise<TradeExplainResponse> {
  const response = await apiClient.post<TradeExplainResponse>(
    "/api/trades/explain",
    data,
  );
  return response.data;
}

/**
 * List user's trades
 */
export async function listTrades(
  limit: number = 10,
): Promise<TradeListResponse> {
  const response = await apiClient.get<TradeListResponse>("/api/trades/list", {
    params: { limit },
  });
  return response.data;
}
