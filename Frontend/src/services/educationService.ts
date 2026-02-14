import api from "./api";
import type {
  StartEducationResponse,
  SubmitQuizPayload,
  SubmitQuizResponse,
  LessonPlan,
} from "../types/api";

/**
 * Phase 1 — Start education: generates a diagnostic quiz for the user.
 * POST /education/start
 */
export async function startEducation(): Promise<StartEducationResponse> {
  const { data } = await api.post<StartEducationResponse>("/education/start");
  return data;
}

/**
 * Phase 2 — Submit quiz answers and receive a personalised curriculum.
 * POST /education/submit-quiz
 */
export async function submitQuiz(payload: SubmitQuizPayload): Promise<SubmitQuizResponse> {
  const { data } = await api.post<SubmitQuizResponse>("/education/submit-quiz", payload);
  return data;
}

/**
 * Get user's learning progress.
 * GET /education/progress
 */
export async function getProgress(): Promise<LessonPlan> {
  const { data } = await api.get<LessonPlan>("/education/progress");
  return data;
}
