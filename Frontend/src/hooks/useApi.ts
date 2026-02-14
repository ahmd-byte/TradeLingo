import { useState, useEffect, useCallback } from 'react';
import {
  authApi,
  profileApi,
  learningPathApi,
  lessonApi,
  quizApi,
  derivApi,
  superBearApi,
  achievementsApi,
  notificationsApi,
  leaderboardApi,
  handleApiError,
  setAuthToken,
  removeAuthToken,
  isAuthenticated,
} from '../services/api';
import type {
  User,
  UserProfile,
  LearningPath,
  LessonNode,
  LessonContent,
  Quiz,
  QuizAttempt,
  UserProgress,
  TradeAnalysis,
  SuperBearMessage,
  Achievement,
  Notification,
  LeaderboardEntry,
  LeaderboardType,
  SignUpRequest,
  LoginRequest,
  SubmitQuizRequest,
  UpdateProfileRequest,
} from '../types';

// ============================================
// AUTHENTICATION HOOKS
// ============================================

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      if (isAuthenticated()) {
        try {
          const currentUser = await authApi.getCurrentUser();
          setUser(currentUser);
          setToken(localStorage.getItem('superbear_token'));
        } catch (error) {
          removeAuthToken();
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (credentials: LoginRequest) => {
    try {
      const response = await authApi.login(credentials);
      setAuthToken(response.token);
      setUser(response.user);
      setToken(response.token);
      localStorage.setItem('superbear_user', JSON.stringify(response.user));
      return { success: true, user: response.user };
    } catch (error) {
      return { success: false, error: handleApiError(error) };
    }
  };

  const signUp = async (data: SignUpRequest) => {
    try {
      const response = await authApi.signUp(data);
      setAuthToken(response.token);
      setUser(response.user);
      setToken(response.token);
      localStorage.setItem('superbear_user', JSON.stringify(response.user));
      return { success: true, user: response.user };
    } catch (error) {
      return { success: false, error: handleApiError(error) };
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      removeAuthToken();
      setUser(null);
      setToken(null);
      localStorage.removeItem('superbear_user');
    }
  };

  return {
    user,
    token,
    loading,
    isAuthenticated: !!user,
    login,
    signUp,
    logout,
  };
};

// ============================================
// USER PROFILE HOOKS
// ============================================

export const useUserProfile = (userId: string) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const data = await profileApi.getProfile(userId);
      setProfile(data);
      setError(null);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchProfile();
    }
  }, [userId, fetchProfile]);

  const updateProfile = async (data: UpdateProfileRequest) => {
    try {
      const updated = await profileApi.updateProfile(userId, data);
      setProfile(updated);
      return { success: true, profile: updated };
    } catch (err) {
      const errorMsg = handleApiError(err);
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  return { profile, loading, error, updateProfile, refetch: fetchProfile };
};

export const useUserProgress = (userId: string) => {
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProgress = useCallback(async () => {
    try {
      setLoading(true);
      const data = await profileApi.getProgress(userId);
      setProgress(data);
      setError(null);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchProgress();
    }
  }, [userId, fetchProgress]);

  return { progress, loading, error, refetch: fetchProgress };
};

// ============================================
// LEARNING PATH HOOKS
// ============================================

export const useLearningPaths = () => {
  const [paths, setPaths] = useState<LearningPath[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPaths = async () => {
      try {
        setLoading(true);
        const data = await learningPathApi.getAllPaths();
        setPaths(data);
        setError(null);
      } catch (err) {
        setError(handleApiError(err));
      } finally {
        setLoading(false);
      }
    };

    fetchPaths();
  }, []);

  return { paths, loading, error };
};

export const useLearningPath = (pathId: string) => {
  const [path, setPath] = useState<LearningPath | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPath = async () => {
      try {
        setLoading(true);
        const data = await learningPathApi.getPath(pathId);
        setPath(data);
        setError(null);
      } catch (err) {
        setError(handleApiError(err));
      } finally {
        setLoading(false);
      }
    };

    if (pathId) {
      fetchPath();
    }
  }, [pathId]);

  return { path, loading, error };
};

// ============================================
// LESSON HOOKS
// ============================================

export const useLesson = (lessonId: string) => {
  const [lesson, setLesson] = useState<LessonNode | null>(null);
  const [content, setContent] = useState<LessonContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        setLoading(true);
        const [lessonData, contentData] = await Promise.all([
          lessonApi.getLesson(lessonId),
          lessonApi.getLessonContent(lessonId),
        ]);
        setLesson(lessonData);
        setContent(contentData);
        setError(null);
      } catch (err) {
        setError(handleApiError(err));
      } finally {
        setLoading(false);
      }
    };

    if (lessonId) {
      fetchLesson();
    }
  }, [lessonId]);

  const startLesson = async () => {
    try {
      await lessonApi.startLesson(lessonId);
    } catch (err) {
      console.error('Error starting lesson:', err);
    }
  };

  const completeLesson = async (timeSpent: number, xpEarned: number) => {
    try {
      const progress = await lessonApi.completeLesson(lessonId, {
        lessonId,
        timeSpent,
        completed: true,
        xpEarned,
      });
      return { success: true, progress };
    } catch (err) {
      return { success: false, error: handleApiError(err) };
    }
  };

  return {
    lesson,
    content,
    loading,
    error,
    startLesson,
    completeLesson,
  };
};

// ============================================
// QUIZ HOOKS
// ============================================

export const useQuiz = (quizId: string) => {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        setLoading(true);
        const data = await quizApi.getQuiz(quizId);
        setQuiz(data);
        setError(null);
      } catch (err) {
        setError(handleApiError(err));
      } finally {
        setLoading(false);
      }
    };

    if (quizId) {
      fetchQuiz();
    }
  }, [quizId]);

  const submitQuiz = async (data: SubmitQuizRequest) => {
    try {
      const result = await quizApi.submitQuiz(quizId, data);
      return { success: true, result };
    } catch (err) {
      return { success: false, error: handleApiError(err) };
    }
  };

  return { quiz, loading, error, submitQuiz };
};

export const useDiagnosticQuiz = () => {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDiagnosticQuiz = async () => {
    try {
      setLoading(true);
      const data = await quizApi.getDiagnosticQuiz();
      setQuiz(data);
      setError(null);
      return { success: true, quiz: data };
    } catch (err) {
      const errorMsg = handleApiError(err);
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  return { quiz, loading, error, fetchDiagnosticQuiz };
};

// ============================================
// DERIV INTEGRATION HOOKS
// ============================================

export const useDerivConnection = (userId: string) => {
  const [connection, setConnection] = useState<any>(null);
  const [analysis, setAnalysis] = useState<TradeAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchConnectionStatus = async () => {
    try {
      setLoading(true);
      const data = await derivApi.getConnectionStatus(userId);
      setConnection(data);
      setError(null);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const connectAccount = async (accountId: string, accountToken: string) => {
    try {
      const data = await derivApi.connectAccount({ accountId, accountToken });
      setConnection(data);
      return { success: true, connection: data };
    } catch (err) {
      const errorMsg = handleApiError(err);
      return { success: false, error: errorMsg };
    }
  };

  const disconnectAccount = async () => {
    try {
      await derivApi.disconnectAccount(userId);
      setConnection(null);
      return { success: true };
    } catch (err) {
      return { success: false, error: handleApiError(err) };
    }
  };

  const syncTrades = async () => {
    try {
      await derivApi.syncTrades(userId);
      return { success: true };
    } catch (err) {
      return { success: false, error: handleApiError(err) };
    }
  };

  const fetchTradeAnalysis = async () => {
    try {
      setLoading(true);
      const data = await derivApi.getTradeAnalysis(userId);
      setAnalysis(data);
      setError(null);
      return { success: true, analysis: data };
    } catch (err) {
      const errorMsg = handleApiError(err);
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  return {
    connection,
    analysis,
    loading,
    error,
    fetchConnectionStatus,
    connectAccount,
    disconnectAccount,
    syncTrades,
    fetchTradeAnalysis,
  };
};

// ============================================
// SUPERBEAR (AI) HOOKS
// ============================================

export const useSuperBear = (userId: string) => {
  const [messages, setMessages] = useState<SuperBearMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const data = await superBearApi.getMessages(userId);
      setMessages(data);
      setError(null);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (message: string, context?: any) => {
    try {
      const response = await superBearApi.sendMessage(userId, message, context);
      setMessages((prev: SuperBearMessage[]) => [...prev, response]);
      return { success: true, message: response };
    } catch (err) {
      return { success: false, error: handleApiError(err) };
    }
  };

  const getEncouragement = async () => {
    try {
      const message = await superBearApi.getEncouragement(userId);
      return { success: true, message };
    } catch (err) {
      return { success: false, error: handleApiError(err) };
    }
  };

  const getTip = async (topic?: string) => {
    try {
      const message = await superBearApi.getTip(userId, topic);
      return { success: true, message };
    } catch (err) {
      return { success: false, error: handleApiError(err) };
    }
  };

  return {
    messages,
    loading,
    error,
    fetchMessages,
    sendMessage,
    getEncouragement,
    getTip,
  };
};

// ============================================
// ACHIEVEMENTS HOOKS
// ============================================

export const useAchievements = (userId: string) => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        setLoading(true);
        const data = await achievementsApi.getUserAchievements(userId);
        setAchievements(data);
        setError(null);
      } catch (err) {
        setError(handleApiError(err));
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchAchievements();
    }
  }, [userId]);

  return { achievements, loading, error };
};

// ============================================
// NOTIFICATIONS HOOKS
// ============================================

export const useNotifications = (userId: string) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const data = await notificationsApi.getNotifications(userId);
      setNotifications(data);
      setUnreadCount(data.filter((n) => !n.isRead).length);
      setError(null);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchNotifications();
    }
  }, [userId, fetchNotifications]);

  const markAsRead = async (notificationId: string) => {
    try {
      await notificationsApi.markAsRead(notificationId);
      setNotifications((prev: Notification[]) =>
        prev.map((n: Notification) => (n.id === notificationId ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev: number) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationsApi.markAllAsRead(userId);
      setNotifications((prev: Notification[]) => prev.map((n: Notification) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  };

  return {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    refetch: fetchNotifications,
  };
};

// ============================================
// LEADERBOARD HOOKS
// ============================================

export const useLeaderboard = (type: LeaderboardType, page: number = 1, limit: number = 50) => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        const data = await leaderboardApi.getLeaderboard(type, page, limit);
        setEntries(data.items);
        setTotalPages(data.totalPages);
        setError(null);
      } catch (err) {
        setError(handleApiError(err));
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [type, page, limit]);

  return { entries, totalPages, loading, error };
};

export const useUserRank = (userId: string, type: LeaderboardType) => {
  const [rank, setRank] = useState<LeaderboardEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRank = async () => {
      try {
        setLoading(true);
        const data = await leaderboardApi.getUserRank(userId, type);
        setRank(data);
        setError(null);
      } catch (err) {
        setError(handleApiError(err));
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchRank();
    }
  }, [userId, type]);

  return { rank, loading, error };
};
