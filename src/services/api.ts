import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import type {
  ApiResponse,
  AuthResponse,
  SignUpRequest,
  LoginRequest,
  User,
  UserProfile,
  LearningPath,
  LessonNode,
  LessonContent,
  Quiz,
  QuizAttempt,
  SubmitQuizRequest,
  CreateLessonProgressRequest,
  UserProgress,
  ConnectDerivRequest,
  DerivConnection,
  TradeAnalysis,
  UpdateProfileRequest,
  SuperBearMessage,
  Achievement,
  Notification,
  UserAnalytics,
  LeaderboardEntry,
  LeaderboardType,
  PaginatedResponse,
} from '../types';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
const API_TIMEOUT = 30000; // 30 seconds

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ============================================
// REQUEST INTERCEPTOR (Add Auth Token)
// ============================================
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('superbear_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// ============================================
// RESPONSE INTERCEPTOR (Handle Errors)
// ============================================
apiClient.interceptors.response.use(
  (response: any) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - logout user
      localStorage.removeItem('superbear_token');
      localStorage.removeItem('superbear_user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// ============================================
// AUTHENTICATION API
// ============================================
export const authApi = {
  signUp: async (data: SignUpRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/signup', data);
    return response.data.data!;
  },

  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/login', data);
    return response.data.data!;
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
    localStorage.removeItem('superbear_token');
    localStorage.removeItem('superbear_user');
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get<ApiResponse<User>>('/auth/me');
    return response.data.data!;
  },

  refreshToken: async (): Promise<{ token: string }> => {
    const response = await apiClient.post<ApiResponse<{ token: string }>>('/auth/refresh');
    return response.data.data!;
  },
};

// ============================================
// USER PROFILE API
// ============================================
export const profileApi = {
  getProfile: async (userId: string): Promise<UserProfile> => {
    const response = await apiClient.get<ApiResponse<UserProfile>>(`/users/${userId}/profile`);
    return response.data.data!;
  },

  updateProfile: async (userId: string, data: UpdateProfileRequest): Promise<UserProfile> => {
    const response = await apiClient.patch<ApiResponse<UserProfile>>(`/users/${userId}/profile`, data);
    return response.data.data!;
  },

  getProgress: async (userId: string): Promise<UserProgress> => {
    const response = await apiClient.get<ApiResponse<UserProgress>>(`/users/${userId}/progress`);
    return response.data.data!;
  },

  getAnalytics: async (userId: string, startDate?: string, endDate?: string): Promise<UserAnalytics> => {
    const params = { startDate, endDate };
    const response = await apiClient.get<ApiResponse<UserAnalytics>>(`/users/${userId}/analytics`, { params });
    return response.data.data!;
  },
};

// ============================================
// LEARNING PATH API
// ============================================
export const learningPathApi = {
  getAllPaths: async (): Promise<LearningPath[]> => {
    const response = await apiClient.get<ApiResponse<LearningPath[]>>('/learning-paths');
    return response.data.data!;
  },

  getPath: async (pathId: string): Promise<LearningPath> => {
    const response = await apiClient.get<ApiResponse<LearningPath>>(`/learning-paths/${pathId}`);
    return response.data.data!;
  },

  getUserPaths: async (userId: string): Promise<LearningPath[]> => {
    const response = await apiClient.get<ApiResponse<LearningPath[]>>(`/users/${userId}/paths`);
    return response.data.data!;
  },
};

// ============================================
// LESSON API
// ============================================
export const lessonApi = {
  getLesson: async (lessonId: string): Promise<LessonNode> => {
    const response = await apiClient.get<ApiResponse<LessonNode>>(`/lessons/${lessonId}`);
    return response.data.data!;
  },

  getLessonContent: async (lessonId: string): Promise<LessonContent> => {
    const response = await apiClient.get<ApiResponse<LessonContent>>(`/lessons/${lessonId}/content`);
    return response.data.data!;
  },

  startLesson: async (lessonId: string): Promise<void> => {
    await apiClient.post(`/lessons/${lessonId}/start`);
  },

  completeLesson: async (lessonId: string, data: CreateLessonProgressRequest): Promise<UserProgress> => {
    const response = await apiClient.post<ApiResponse<UserProgress>>(`/lessons/${lessonId}/complete`, data);
    return response.data.data!;
  },
};

// ============================================
// QUIZ API
// ============================================
export const quizApi = {
  getQuiz: async (quizId: string): Promise<Quiz> => {
    const response = await apiClient.get<ApiResponse<Quiz>>(`/quizzes/${quizId}`);
    return response.data.data!;
  },

  submitQuiz: async (quizId: string, data: SubmitQuizRequest): Promise<QuizAttempt> => {
    const response = await apiClient.post<ApiResponse<QuizAttempt>>(`/quizzes/${quizId}/submit`, data);
    return response.data.data!;
  },

  getQuizAttempts: async (userId: string, quizId?: string): Promise<QuizAttempt[]> => {
    const params = quizId ? { quizId } : {};
    const response = await apiClient.get<ApiResponse<QuizAttempt[]>>(`/users/${userId}/quiz-attempts`, { params });
    return response.data.data!;
  },

  getDiagnosticQuiz: async (): Promise<Quiz> => {
    const response = await apiClient.get<ApiResponse<Quiz>>('/quizzes/diagnostic');
    return response.data.data!;
  },
};

// ============================================
// DERIV INTEGRATION API
// ============================================
export const derivApi = {
  connectAccount: async (data: ConnectDerivRequest): Promise<DerivConnection> => {
    const response = await apiClient.post<ApiResponse<DerivConnection>>('/deriv/connect', data);
    return response.data.data!;
  },

  disconnectAccount: async (userId: string): Promise<void> => {
    await apiClient.delete(`/users/${userId}/deriv`);
  },

  syncTrades: async (userId: string): Promise<void> => {
    await apiClient.post(`/users/${userId}/deriv/sync`);
  },

  getTradeAnalysis: async (userId: string): Promise<TradeAnalysis> => {
    const response = await apiClient.get<ApiResponse<TradeAnalysis>>(`/users/${userId}/deriv/analysis`);
    return response.data.data!;
  },

  getConnectionStatus: async (userId: string): Promise<DerivConnection> => {
    const response = await apiClient.get<ApiResponse<DerivConnection>>(`/users/${userId}/deriv/status`);
    return response.data.data!;
  },
};

// ============================================
// SUPERBEAR (AI) API
// ============================================
export const superBearApi = {
  sendMessage: async (userId: string, message: string, context?: any): Promise<SuperBearMessage> => {
    const response = await apiClient.post<ApiResponse<SuperBearMessage>>(`/superbear/${userId}/message`, {
      message,
      context,
    });
    return response.data.data!;
  },

  getMessages: async (userId: string, limit: number = 20): Promise<SuperBearMessage[]> => {
    const response = await apiClient.get<ApiResponse<SuperBearMessage[]>>(`/superbear/${userId}/messages`, {
      params: { limit },
    });
    return response.data.data!;
  },

  getEncouragement: async (userId: string): Promise<SuperBearMessage> => {
    const response = await apiClient.get<ApiResponse<SuperBearMessage>>(`/superbear/${userId}/encouragement`);
    return response.data.data!;
  },

  getTip: async (userId: string, topic?: string): Promise<SuperBearMessage> => {
    const params = topic ? { topic } : {};
    const response = await apiClient.get<ApiResponse<SuperBearMessage>>(`/superbear/${userId}/tip`, { params });
    return response.data.data!;
  },
};

// ============================================
// ACHIEVEMENTS API
// ============================================
export const achievementsApi = {
  getUserAchievements: async (userId: string): Promise<Achievement[]> => {
    const response = await apiClient.get<ApiResponse<Achievement[]>>(`/users/${userId}/achievements`);
    return response.data.data!;
  },

  getAllAchievements: async (): Promise<Achievement[]> => {
    const response = await apiClient.get<ApiResponse<Achievement[]>>('/achievements');
    return response.data.data!;
  },
};

// ============================================
// NOTIFICATIONS API
// ============================================
export const notificationsApi = {
  getNotifications: async (userId: string, unreadOnly: boolean = false): Promise<Notification[]> => {
    const params = { unreadOnly };
    const response = await apiClient.get<ApiResponse<Notification[]>>(`/users/${userId}/notifications`, { params });
    return response.data.data!;
  },

  markAsRead: async (notificationId: string): Promise<void> => {
    await apiClient.patch(`/notifications/${notificationId}/read`);
  },

  markAllAsRead: async (userId: string): Promise<void> => {
    await apiClient.patch(`/users/${userId}/notifications/read-all`);
  },
};

// ============================================
// LEADERBOARD API
// ============================================
export const leaderboardApi = {
  getLeaderboard: async (
    type: LeaderboardType,
    page: number = 1,
    limit: number = 50
  ): Promise<PaginatedResponse<LeaderboardEntry>> => {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<LeaderboardEntry>>>('/leaderboard', {
      params: { type, page, limit },
    });
    return response.data.data!;
  },

  getUserRank: async (userId: string, type: LeaderboardType): Promise<LeaderboardEntry> => {
    const response = await apiClient.get<ApiResponse<LeaderboardEntry>>(`/leaderboard/user/${userId}`, {
      params: { type },
    });
    return response.data.data!;
  },
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Set authentication token in localStorage and axios headers
 */
export const setAuthToken = (token: string): void => {
  localStorage.setItem('superbear_token', token);
  apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
};

/**
 * Remove authentication token
 */
export const removeAuthToken = (): void => {
  localStorage.removeItem('superbear_token');
  delete apiClient.defaults.headers.common['Authorization'];
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem('superbear_token');
};

/**
 * Handle API errors consistently
 */
export const handleApiError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiResponse<any>>;
    
    if (axiosError.response?.data?.error) {
      return axiosError.response.data.error.message;
    }
    
    if (axiosError.response?.status === 404) {
      return 'Resource not found';
    }
    
    if (axiosError.response?.status === 500) {
      return 'Server error. Please try again later.';
    }
    
    if (axiosError.message === 'Network Error') {
      return 'Network error. Please check your connection.';
    }
    
    return axiosError.message || 'An unexpected error occurred';
  }
  
  return 'An unexpected error occurred';
};

// Export the base API client for custom requests
export default apiClient;
