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

/** Progress info from mastery detection */
export interface ProgressInfo {
  mastery_detected: boolean;
  confidence_level: number;
  module_completed?: boolean;
  completion_message?: string;
  next_module?: Record<string, unknown>;
  curriculum_complete?: boolean;
  score_incremented?: boolean;
  new_mastery_score?: number;
}

/** Educational response (lesson_question / research intents) */
export interface EducationalResponse {
  type: "educational";
  observation?: string;
  analysis?: string;
  learning_concept?: string;
  why_it_matters?: string;
  teaching_explanation?: string;
  teaching_example?: string;
  actionable_takeaway?: string;
  next_learning_suggestion?: string;
  progress?: ProgressInfo | null;
}

/** Deep trade diagnostic response (trade_explain with real trade data) */
export interface TradeDiagnosticResponse {
  type: "trade_diagnostic";
  trade_id?: string | null;
  trade_metrics?: TradeMetrics | null;
  trade_summary?: string;
  technical_analysis?: {
    entry_quality?: string;
    exit_quality?: string;
    risk_management?: string;
  };
  behavioral_analysis?: {
    bias_detected?: string;
    emotional_pattern?: string;
  };
  core_mistake?: string;
  linked_knowledge_gap?: string;
  recommended_lesson_topic?: string;
  suggested_module_index?: number | null;
  improvement_framework?: string[];
  tone_style_used?: string;
  progress?: ProgressInfo | null;
}

/** Conceptual trade explanation (trade_explain without trade data) */
export interface TradeExplainConceptualResponse {
  type: "trade_explain_conceptual";
  what_happened?: string;
  general_analysis?: string;
  common_mistakes?: string;
  linked_knowledge_gap?: string;
  recommended_lesson_topic?: string;
  suggested_module_index?: number | null;
  improvement_suggestion?: string;
  tone_style_used?: string;
  progress?: ProgressInfo | null;
}

/** Trade explain error fallback */
export interface TradeExplainErrorResponse {
  type: "trade_explain_error";
  error?: string;
  fallback_advice?: string;
  progress?: ProgressInfo | null;
}

/** Curriculum modification response */
export interface CurriculumModifyResponse {
  type: "curriculum_modify";
  adjustment_type?: string;
  new_focus?: string;
  updated_module?: {
    topic?: string;
    difficulty?: string;
    explanation_style?: string;
    estimated_duration?: string;
  };
  progress?: ProgressInfo | null;
}

/** Wellness / therapy response from SuperBear */
export interface WellnessResponse {
  type: "wellness";
  emotional_state?: string;
  validation?: string;
  perspective?: string;
  coping_strategy?: string;
  educational_focus?: string;
  actionable_steps?: string[];
  encouragement?: string;
  related_concept?: string;
  progress?: ProgressInfo | null;
}

/** Integrated response (both educational + wellness) */
export interface IntegratedResponse {
  type: "integrated";
  primary_mode: "therapy" | "research";
  therapy?: WellnessResponse | null;
  research?: EducationalResponse | null;
  progress?: ProgressInfo | null;
}

/** Union of all possible SuperBear response shapes */
export type SuperBearResponse =
  | EducationalResponse
  | TradeDiagnosticResponse
  | TradeExplainConceptualResponse
  | TradeExplainErrorResponse
  | CurriculumModifyResponse
  | WellnessResponse
  | IntegratedResponse;

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
