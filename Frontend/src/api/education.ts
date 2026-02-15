import apiClient from "./client";
import type {
  StartEducationResponse,
  SubmitQuizRequest,
  SubmitQuizResponse,
  ProgressResponse,
} from "./types";

// ============================================================
// Education Pipeline API
// ============================================================

/**
 * Start education — generates a diagnostic quiz
 */
export async function startEducation(): Promise<StartEducationResponse> {
  const response = await apiClient.post<StartEducationResponse>(
    "/api/education/start",
  );
  return response.data;
}

/**
 * Submit quiz answers and generate curriculum
 */
export async function submitQuiz(
  data: SubmitQuizRequest,
): Promise<SubmitQuizResponse> {
  const response = await apiClient.post<SubmitQuizResponse>(
    "/api/education/submit-quiz",
    data,
  );
  return response.data;
}

/**
 * Get learning progress
 */
export async function getProgress(): Promise<ProgressResponse> {
  const response = await apiClient.get<ProgressResponse>(
    "/api/education/progress",
  );
  return response.data;
}
