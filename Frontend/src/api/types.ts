// ============================================================
// Backend API Type Definitions
// Mirrors the FastAPI Pydantic schemas exactly
// ============================================================

// ---- Auth Types ----

export interface UserRegisterRequest {
  email: string;
  username: string;
  password: string;
  trading_level?: string;
  learning_style?: string;
  risk_tolerance?: string;
  preferred_market?: string;
  trading_frequency?: string;
  trading_experience_years?: number | null;
  trade_type?: string | null;
  has_connected_trades?: boolean;
}

export interface UserLoginRequest {
  email: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token?: string | null;
  token_type: string;
  expires_in: number;
}

export interface TokenRefreshRequest {
  refresh_token: string;
}

export interface UserResponse {
  _id: string;
  email: string;
  username?: string;
  trading_level: string;
  learning_style: string;
  risk_tolerance: string;
  preferred_market: string;
  trading_frequency: string;
  trading_experience_years?: number | null;
  trade_type?: string | null;
  has_connected_trades: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ---- Chat Types ----

export interface UserProfile {
  name?: string;
  tradingLevel?: string;
  learningStyle?: string;
  riskTolerance?: string;
  preferredMarkets?: string;
  tradingFrequency?: string;
}

export interface TradeData {
  stockCode?: string;
  stockName?: string;
  action?: string;
  units?: string;
  price?: string;
  date?: string;
}

export interface ChatRequest {
  message: string;
  session_id?: string;
  user_profile?: UserProfile;
  trade_data?: TradeData;
}

export interface ChatResponse {
  type?: string;
  // Educational response fields
  observation?: string;
  analysis?: string;
  learning_concept?: string;
  why_it_matters?: string;
  teaching_explanation?: string;
  teaching_example?: string;
  actionable_takeaway?: string;
  next_learning_suggestion?: string;
  // Wellness/therapy response fields
  emotional_state?: string;
  validation?: string;
  perspective?: string;
  coping_strategy?: string;
  educational_focus?: string;
  actionable_steps?: string[]; // Backend returns a list
  encouragement?: string;
  related_concept?: string; // Present in wellness responses
  wellness_support?: string; // Present in educational/research responses
  // Trade explain fields
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
  improvement_framework?: string[]; // Actionable improvements from trade explain
  suggested_module_index?: number; // Matching curriculum module index
  tone_style_used?: string; // Tone used in response
  // Integrated type fields (when type === "integrated")
  primary_mode?: "therapy" | "research";
  therapy?: {
    emotional_state?: string;
    validation?: string;
    perspective?: string;
    coping_strategy?: string;
    educational_focus?: string;
    actionable_steps?: string[];
    encouragement?: string;
  };
  research?: {
    observation?: string;
    analysis?: string;
    learning_concept?: string;
    why_it_matters?: string;
    teaching_explanation?: string;
    teaching_example?: string;
    actionable_takeaway?: string;
    next_learning_suggestion?: string;
  };
  // Progress (from mastery detection)
  progress?: {
    mastery_detected?: boolean;
    confidence_level?: number;
    module_completed?: boolean;
    completion_message?: string;
    next_module?: { index: number; topic: string } | null;
    curriculum_complete?: boolean;
    score_incremented?: boolean;
    new_mastery_score?: number;
    [key: string]: unknown;
  } | null;
  // Allow additional dynamic fields
  [key: string]: unknown;
}

export interface TherapyRequest {
  message: string;
  session_id?: string;
  user_profile?: UserProfile;
  trade_data?: TradeData;
}

// ---- Trade Types ----

export interface TradeItem {
  symbol: string;
  entry_time: string; // ISO 8601
  exit_time: string; // ISO 8601
  entry_price: number;
  exit_price: number;
}

export interface TradeUploadRequest {
  trades: TradeItem[];
}

export interface TradeUploadResponse {
  inserted_count: number;
  trade_type: string;
  message: string;
}

export interface TradeTypeResponse {
  trade_type: string;
  message?: string;
}

export interface TradeExplainRequest {
  trade_id?: string;
  user_message?: string;
  detected_emotion?: string;
}

export interface TradeMetrics {
  symbol?: string;
  entry_price?: number;
  exit_price?: number;
  absolute_pnl?: number;
  percentage_pnl?: number;
  direction?: string;
  holding_duration_str?: string;
}

export interface TradeExplainResponse {
  trade_id?: string;
  trade_metrics?: TradeMetrics;
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
  suggested_module_index?: number;
  improvement_framework?: string[];
  tone_style_used?: string;
}

export interface TradeListItem {
  trade_id: string;
  symbol: string;
  entry_time: string;
  exit_time: string;
  entry_price: number;
  exit_price: number;
  pnl_direction: string;
  percentage_pnl: number;
  holding_duration: string;
}

export interface TradeListResponse {
  trades: TradeListItem[];
  count: number;
}

// ---- Education Types ----

export interface QuizQuestion {
  question: string;
  concept_tested: string;
}

export interface StartEducationResponse {
  quiz_questions: QuizQuestion[];
  profile: Record<string, unknown>;
  trade_type?: string;
}

export interface SubmitQuizRequest {
  quiz_questions: QuizQuestion[];
  quiz_answers: string[];
}

export interface KnowledgeGaps {
  strong_concepts?: string[];
  weak_concepts?: string[];
  behavioral_patterns?: string[];
  recommended_focus?: string[]; // Backend returns a list
}

export interface CurriculumModule {
  topic: string;
  difficulty: string;
  explanation_style?: string;
  estimated_duration?: string;
  status?: string;
  mastery_score?: number;
  interaction_count?: number;
}

export interface Curriculum {
  learning_objective: string;
  modules: CurriculumModule[];
  progression_strategy?: string;
}

export interface SubmitQuizResponse {
  knowledge_gaps: KnowledgeGaps;
  curriculum: Curriculum;
}

export interface ModuleProgress {
  index: number;
  topic: string;
  difficulty: string;
  status: "locked" | "current" | "completed";
  mastery_score: number;
  interaction_count: number;
  estimated_duration: string;
}

export interface ProgressResponse {
  has_lesson_plan: boolean;
  learning_objective?: string;
  current_module?: ModuleProgress;
  completed_modules: ModuleProgress[];
  remaining_modules: ModuleProgress[];
  progress_percentage: number;
  total_modules: number;
  progression_strategy?: string;
}
