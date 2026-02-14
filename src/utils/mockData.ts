/**
 * Mock Data Utilities for Development
 * 
 * These utilities provide sample data while the backend is not yet integrated.
 * Replace with actual API calls when backend is ready.
 */

import type {
  User,
  UserProfile,
  LearningPath,
  LessonNode,
  Quiz,
  Question,
  Achievement,
  TradeAnalysis,
  SuperBearMessage,
  Notification,
  UserProgress,
} from '../types';

// ============================================
// MOCK USERS
// ============================================

export const mockUser: User = {
  id: 'user-123',
  username: 'traderpro',
  email: 'trader@example.com',
  createdAt: '2024-01-15T10:00:00Z',
  updatedAt: '2024-02-15T10:00:00Z',
};

export const mockUserProfile: UserProfile = {
  userId: 'user-123',
  traderType: 'day-trading',
  totalXP: 2450,
  currentLevel: 8,
  currentStreak: 12,
  longestStreak: 28,
  derivAccountConnected: true,
  derivAccountId: 'CR1234567',
  completedLessons: ['lesson-1', 'lesson-2', 'lesson-3', 'lesson-4'],
  achievements: [],
  createdAt: '2024-01-15T10:00:00Z',
  updatedAt: '2024-02-15T10:00:00Z',
};

// ============================================
// MOCK LEARNING PATHS
// ============================================

export const mockLessonNodes: LessonNode[] = [
  {
    id: 'lesson-1',
    type: 'start',
    title: 'Start Your Journey',
    description: 'Begin your trading education',
    status: 'completed',
    order: 1,
    pathId: 'path-1',
    prerequisites: [],
  },
  {
    id: 'lesson-2',
    type: 'lesson',
    title: 'Understanding Market Basics',
    description: 'Learn the fundamentals of trading',
    status: 'completed',
    xp: 100,
    order: 2,
    pathId: 'path-1',
    prerequisites: ['lesson-1'],
  },
  {
    id: 'lesson-3',
    type: 'lesson',
    title: 'Chart Reading 101',
    description: 'Master the art of reading charts',
    status: 'active',
    xp: 150,
    order: 3,
    pathId: 'path-1',
    prerequisites: ['lesson-2'],
  },
  {
    id: 'lesson-4',
    type: 'lesson',
    title: 'Technical Indicators',
    description: 'Learn key technical indicators',
    status: 'available',
    xp: 200,
    order: 4,
    pathId: 'path-1',
    prerequisites: ['lesson-3'],
  },
  {
    id: 'lesson-5',
    type: 'milestone',
    title: 'Foundation Complete',
    description: 'You have mastered the basics!',
    status: 'locked',
    xp: 500,
    order: 5,
    pathId: 'path-1',
    prerequisites: ['lesson-4'],
  },
];

export const mockLearningPaths: LearningPath[] = [
  {
    id: 'path-1',
    title: 'Trading Fundamentals',
    description: 'Master the basics of trading',
    category: 'Beginner',
    difficulty: 'beginner',
    lessons: mockLessonNodes,
    totalXP: 1500,
    estimatedDuration: 180,
    isLocked: false,
  },
  {
    id: 'path-2',
    title: 'Advanced Strategies',
    description: 'Learn advanced trading techniques',
    category: 'Advanced',
    difficulty: 'advanced',
    lessons: [],
    totalXP: 3000,
    estimatedDuration: 360,
    isLocked: true,
  },
];

// ============================================
// MOCK QUIZ DATA
// ============================================

export const mockQuestions: Question[] = [
  {
    id: 'q1',
    type: 'multiple-choice',
    question: 'What is a support level in technical analysis?',
    options: [
      'A price level where selling pressure is strong',
      'A price level where buying pressure is strong',
      'The highest price an asset can reach',
      'The average price over time',
    ],
    correctAnswer: 1,
    explanation: 'A support level is where buying pressure typically exceeds selling pressure, preventing the price from falling further.',
    difficulty: 'easy',
    tags: ['technical-analysis', 'support-resistance'],
  },
  {
    id: 'q2',
    type: 'multiple-choice',
    question: 'What does RSI stand for?',
    options: [
      'Real Stock Index',
      'Relative Strength Index',
      'Rapid Signal Indicator',
      'Rate of Stock Investment',
    ],
    correctAnswer: 1,
    explanation: 'RSI stands for Relative Strength Index, a momentum indicator that measures the speed and magnitude of price movements.',
    difficulty: 'medium',
    tags: ['indicators', 'momentum'],
  },
  {
    id: 'q3',
    type: 'true-false',
    question: 'Day trading involves holding positions for several weeks.',
    options: ['True', 'False'],
    correctAnswer: 1,
    explanation: 'Day trading involves opening and closing positions within the same trading day, not holding for weeks.',
    difficulty: 'easy',
    tags: ['trading-styles', 'day-trading'],
  },
];

export const mockQuiz: Quiz = {
  id: 'quiz-1',
  lessonId: 'lesson-3',
  type: 'lesson',
  title: 'Chart Reading Quiz',
  questions: mockQuestions,
  passingScore: 70,
  xpReward: 150,
  timeLimit: 300,
};

export const mockDiagnosticQuiz: Quiz = {
  id: 'quiz-diagnostic',
  type: 'diagnostic',
  title: 'Trading Knowledge Assessment',
  questions: mockQuestions,
  passingScore: 60,
  xpReward: 200,
};

// ============================================
// MOCK ACHIEVEMENTS
// ============================================

export const mockAchievements: Achievement[] = [
  {
    id: 'ach-1',
    title: 'First Steps',
    description: 'Complete your first lesson',
    iconUrl: '🎯',
    type: 'lesson',
    rarity: 'common',
    unlockedAt: '2024-01-16T10:00:00Z',
  },
  {
    id: 'ach-2',
    title: 'Knowledge Seeker',
    description: 'Complete 5 lessons',
    iconUrl: '📚',
    type: 'lesson',
    rarity: 'rare',
    unlockedAt: '2024-01-20T10:00:00Z',
  },
  {
    id: 'ach-3',
    title: 'Streak Master',
    description: 'Maintain a 7-day streak',
    iconUrl: '🔥',
    type: 'streak',
    rarity: 'epic',
    unlockedAt: '2024-01-25T10:00:00Z',
  },
  {
    id: 'ach-4',
    title: 'Quiz Champion',
    description: 'Score 100% on any quiz',
    iconUrl: '🏆',
    type: 'quiz',
    rarity: 'legendary',
    unlockedAt: '2024-02-01T10:00:00Z',
  },
];

// ============================================
// MOCK DERIV ANALYSIS
// ============================================

export const mockTradeAnalysis: TradeAnalysis = {
  userId: 'user-123',
  totalTrades: 127,
  winRate: 0.58,
  avgProfit: 45.32,
  avgLoss: -38.50,
  bestPerformingAsset: 'EUR/USD',
  worstPerformingAsset: 'GBP/JPY',
  tradingPatterns: ['Trades more in morning hours', 'Higher win rate on EUR pairs', 'Tends to exit early'],
  suggestedTraderType: 'day-trading',
  knowledgeGaps: ['Risk management', 'Position sizing', 'Stop loss placement'],
  recommendedLessons: ['lesson-5', 'lesson-6', 'lesson-7'],
  analyzedAt: '2024-02-15T10:00:00Z',
};

// ============================================
// MOCK SUPERBEAR MESSAGES
// ============================================

export const mockSuperBearMessages: SuperBearMessage[] = [
  {
    id: 'msg-1',
    userId: 'user-123',
    message: "Great job on your progress! You're building solid foundations! 🎉",
    type: 'encouragement',
    createdAt: '2024-02-15T09:00:00Z',
  },
  {
    id: 'msg-2',
    userId: 'user-123',
    message: 'Quick tip: Always set stop losses before entering a trade!',
    type: 'tip',
    createdAt: '2024-02-15T10:30:00Z',
  },
  {
    id: 'msg-3',
    userId: 'user-123',
    message: "I noticed you're doing well with EUR/USD. Have you tried incorporating technical indicators?",
    type: 'analysis',
    createdAt: '2024-02-15T11:15:00Z',
  },
];

// ============================================
// MOCK NOTIFICATIONS
// ============================================

export const mockNotifications: Notification[] = [
  {
    id: 'notif-1',
    userId: 'user-123',
    type: 'achievement',
    title: 'New Achievement!',
    message: 'You unlocked "Streak Master" 🔥',
    isRead: false,
    createdAt: '2024-02-15T09:00:00Z',
  },
  {
    id: 'notif-2',
    userId: 'user-123',
    type: 'streak',
    title: 'Keep It Going!',
    message: "You're on a 12-day streak! Don't break it!",
    isRead: false,
    createdAt: '2024-02-15T08:00:00Z',
  },
  {
    id: 'notif-3',
    userId: 'user-123',
    type: 'lesson',
    title: 'New Lesson Available',
    message: 'Advanced Risk Management is now unlocked!',
    isRead: true,
    actionUrl: '/lessons/lesson-10',
    createdAt: '2024-02-14T15:00:00Z',
  },
];

// ============================================
// MOCK USER PROGRESS
// ============================================

export const mockUserProgress: UserProgress = {
  userId: 'user-123',
  currentPathId: 'path-1',
  currentLessonId: 'lesson-3',
  completedLessons: ['lesson-1', 'lesson-2'],
  totalXP: 2450,
  level: 8,
  streaks: {
    currentStreak: 12,
    longestStreak: 28,
    lastCheckinDate: '2024-02-15',
    streakHistory: [
      { date: '2024-02-15', lessonsCompleted: 1, xpEarned: 150 },
      { date: '2024-02-14', lessonsCompleted: 2, xpEarned: 300 },
      { date: '2024-02-13', lessonsCompleted: 1, xpEarned: 100 },
    ],
  },
  achievements: mockAchievements,
  lastActivityAt: '2024-02-15T11:30:00Z',
};

// ============================================
// HELPER FUNCTIONS TO SIMULATE API CALLS
// ============================================

/**
 * Simulates an API delay
 */
export const simulateApiDelay = (ms: number = 500): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Simulates an API call with mock data
 */
export const mockApiCall = async <T>(data: T, delay: number = 500): Promise<T> => {
  await simulateApiDelay(delay);
  return data;
};

/**
 * Simulates an API error
 */
export const mockApiError = async (message: string, delay: number = 500): Promise<never> => {
  await simulateApiDelay(delay);
  throw new Error(message);
};

// ============================================
// MOCK API SERVICE WRAPPER
// ============================================

/**
 * Use this to toggle between mock and real API calls
 * Set USE_MOCK_API to false when backend is integrated
 */
export const USE_MOCK_API = true;

/**
 * Wrapper function to switch between mock and real API
 */
export const apiCall = async <T>(
  realApiFn: () => Promise<T>,
  mockData: T,
  useMock: boolean = USE_MOCK_API
): Promise<T> => {
  if (useMock) {
    return mockApiCall(mockData);
  }
  return realApiFn();
};
