/**
 * Shared TypeScript interfaces for API request/response types.
 * Mirrors the FastAPI backend Pydantic schemas.
 */

// ─── Auth ────────────────────────────────────────────────────────────────────

export interface TokenResponse {
  access_token: string;
  refresh_token: string | null;
  token_type: string;
  expires_in: number;
}

export interface User {
  _id: string;
  email: string;
  username: string | null;
  trading_level: string;
  learning_style: string;
  risk_tolerance: string;
  preferred_market: string;
  trading_frequency: string;
  trading_experience_years: number | null;
  trade_type: string | null;
  has_connected_trades: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface RegisterPayload {
  email: string;
  username: string;
  password: string;
  trading_level?: string;
  learning_style?: string;
  risk_tolerance?: string;
  preferred_market?: string;
  trading_frequency?: string;
  trading_experience_years?: number;
  trade_type?: string;
  has_connected_trades?: boolean;
}

export interface LoginPayload {
  email: string;
  password: string;
}

// ─── Education ───────────────────────────────────────────────────────────────

export interface QuizQuestion {
  question: string;
  options: string[];
  correct_answer?: number;
  [key: string]: unknown;
}

export interface StartEducationResponse {
  quiz_questions: QuizQuestion[];
  profile: Record<string, unknown>;
  trade_type: string | null;
}

export interface SubmitQuizPayload {
  quiz_questions: QuizQuestion[];
  quiz_answers: string[];
}

export interface SubmitQuizResponse {
  knowledge_gaps: Record<string, unknown>;
  curriculum: Record<string, unknown>;
}

export interface LessonModule {
  index: number;
  topic: string;
  difficulty: string;
  status: "locked" | "current" | "completed";
  mastery_score: number;
  interaction_count: number;
  estimated_duration: string;
}

export interface LessonPlan {
  has_lesson_plan: boolean;
  learning_objective: string | null;
  current_module: LessonModule | null;
  completed_modules: LessonModule[];
  remaining_modules: LessonModule[];
  progress_percentage: number;
  total_modules: number;
  progression_strategy: string | null;
}

// ─── Chat ────────────────────────────────────────────────────────────────────

export interface ChatRequest {
  message: string;
  session_id?: string;
}

export interface ChatResponse {
  response: string;
  intent?: string;
  research_output?: Record<string, unknown>;
  therapy_output?: Record<string, unknown>;
  [key: string]: unknown;
}

// ─── Trades ──────────────────────────────────────────────────────────────────

export interface TechnicalAnalysis {
  entry_quality: string;
  exit_quality: string;
  risk_management: string;
}

export interface BehavioralAnalysis {
  bias_detected: string;
  emotional_pattern: string;
}

export interface TradeMetrics {
  symbol: string;
  entry_price: number;
  exit_price: number;
  absolute_pnl: number;
  percentage_pnl: number;
  direction: string;
  holding_duration_str: string;
}

export interface TradeDiagnostic {
  trade_id: string | null;
  trade_metrics: TradeMetrics | null;
  trade_summary: string | null;
  technical_analysis: TechnicalAnalysis | null;
  behavioral_analysis: BehavioralAnalysis | null;
  core_mistake: string | null;
  linked_knowledge_gap: string | null;
  recommended_lesson_topic: string | null;
  suggested_module_index: number | null;
  improvement_framework: string[];
  tone_style_used: string;
}

export interface ExplainTradePayload {
  trade_id?: string;
  user_message?: string;
  detected_emotion?: string;
}
