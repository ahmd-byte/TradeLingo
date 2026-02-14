// ============================================
// USER & AUTHENTICATION TYPES
// ============================================

export interface User {
  id: string;
  username: string;
  email: string;
  createdAt: string;
  updatedAt: string;
  profile?: UserProfile;
}

export interface UserProfile {
  userId: string;
  traderType?: 'scalper' | 'day-trading' | 'swing-trading' | 'investment';
  totalXP: number;
  currentLevel: number;
  currentStreak: number;
  longestStreak: number;
  derivAccountConnected: boolean;
  derivAccountId?: string;
  completedLessons: string[];
  achievements: Achievement[];
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SignUpRequest {
  username: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  expiresIn: number;
}

// ============================================
// LESSON & LEARNING PATH TYPES
// ============================================

export interface LessonNode {
  id: string;
  type: 'start' | 'lesson' | 'locked' | 'milestone';
  title: string;
  description?: string;
  status: 'active' | 'completed' | 'locked' | 'available';
  xp?: number;
  order: number;
  pathId: string;
  prerequisites: string[];
  content?: LessonContent;
  quiz?: Quiz;
}

export interface LearningPath {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  lessons: LessonNode[];
  totalXP: number;
  estimatedDuration: number; // in minutes
  isLocked: boolean;
}

export interface LessonContent {
  lessonId: string;
  sections: LessonSection[];
}

export interface LessonSection {
  id: string;
  type: 'text' | 'image' | 'video' | 'interactive' | 'example';
  title?: string;
  content: string;
  order: number;
  media?: {
    url: string;
    altText?: string;
    caption?: string;
  };
}

// ============================================
// QUIZ TYPES
// ============================================

export interface Quiz {
  id: string;
  lessonId?: string;
  type: 'lesson' | 'diagnostic' | 'assessment';
  title: string;
  questions: Question[];
  passingScore: number;
  xpReward: number;
  timeLimit?: number; // in seconds
}

export interface Question {
  id: string;
  type: 'multiple-choice' | 'true-false' | 'fill-blank';
  question: string;
  options?: string[];
  correctAnswer: string | number;
  explanation?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
}

export interface QuizAttempt {
  id: string;
  userId: string;
  quizId: string;
  answers: QuizAnswer[];
  score: number;
  passed: boolean;
  xpEarned: number;
  completedAt: string;
  timeSpent: number; // in seconds
}

export interface QuizAnswer {
  questionId: string;
  answer: string | number;
  isCorrect: boolean;
  timeSpent: number;
}

// ============================================
// DERIV INTEGRATION TYPES
// ============================================

export interface DerivConnection {
  userId: string;
  derivAccountId: string;
  accountToken: string;
  connectedAt: string;
  lastSyncAt: string;
  isActive: boolean;
}

export interface DerivTrade {
  id: string;
  userId: string;
  derivTradeId: string;
  symbol: string;
  type: 'call' | 'put' | 'buy' | 'sell';
  stake: number;
  profit: number;
  duration: number;
  entryTime: string;
  exitTime: string;
  outcome: 'win' | 'loss';
  analyzedAt?: string;
}

export interface TradeAnalysis {
  userId: string;
  totalTrades: number;
  winRate: number;
  avgProfit: number;
  avgLoss: number;
  bestPerformingAsset: string;
  worstPerformingAsset: string;
  tradingPatterns: string[];
  suggestedTraderType: 'scalper' | 'day-trading' | 'swing-trading' | 'investment';
  knowledgeGaps: string[];
  recommendedLessons: string[];
  analyzedAt: string;
}

// ============================================
// PROGRESS & GAMIFICATION TYPES
// ============================================

export interface UserProgress {
  userId: string;
  currentPathId: string;
  currentLessonId: string;
  completedLessons: string[];
  totalXP: number;
  level: number;
  streaks: StreakData;
  achievements: Achievement[];
  lastActivityAt: string;
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastCheckinDate: string;
  streakHistory: StreakRecord[];
}

export interface StreakRecord {
  date: string;
  lessonsCompleted: number;
  xpEarned: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  iconUrl: string;
  type: 'lesson' | 'streak' | 'xp' | 'quiz' | 'special';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockedAt: string;
  progress?: {
    current: number;
    target: number;
  };
}

// ============================================
// SUPERBEAR (AI COMPANION) TYPES
// ============================================

export interface SuperBearMessage {
  id: string;
  userId: string;
  message: string;
  type: 'encouragement' | 'tip' | 'analysis' | 'question' | 'response';
  context?: {
    lessonId?: string;
    quizId?: string;
    tradeId?: string;
  };
  createdAt: string;
}

export interface SuperBearInteraction {
  userId: string;
  totalInteractions: number;
  lastInteractionAt: string;
  favoriteTopics: string[];
  learningStyle?: 'visual' | 'reading' | 'practical' | 'mixed';
}

// ============================================
// NOTIFICATION TYPES
// ============================================

export interface Notification {
  id: string;
  userId: string;
  type: 'achievement' | 'streak' | 'lesson' | 'reminder' | 'system';
  title: string;
  message: string;
  isRead: boolean;
  actionUrl?: string;
  createdAt: string;
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}

export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

// ============================================
// API REQUEST TYPES
// ============================================

export interface CreateLessonProgressRequest {
  lessonId: string;
  timeSpent: number;
  completed: boolean;
  xpEarned: number;
}

export interface SubmitQuizRequest {
  quizId: string;
  answers: QuizAnswer[];
  timeSpent: number;
}

export interface ConnectDerivRequest {
  accountId: string;
  accountToken: string;
}

export interface UpdateProfileRequest {
  username?: string;
  avatarUrl?: string;
  traderType?: 'scalper' | 'day-trading' | 'swing-trading' | 'investment';
}

// ============================================
// ANALYTICS TYPES
// ============================================

export interface UserAnalytics {
  userId: string;
  totalTimeSpent: number; // in seconds
  lessonsCompleted: number;
  quizzesCompleted: number;
  averageQuizScore: number;
  xpEarned: number;
  loginStreak: number;
  mostActiveDay: string;
  learningPeakTime: string;
  period: {
    start: string;
    end: string;
  };
}

// ============================================
// LEADERBOARD TYPES
// ============================================

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  avatarUrl?: string;
  score: number;
  level: number;
  badge?: string;
}

export type LeaderboardType = 'xp' | 'streak' | 'lessons' | 'weekly' | 'monthly' | 'alltime';
