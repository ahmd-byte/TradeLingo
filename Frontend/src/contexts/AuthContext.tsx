import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '../hooks/useApi';
import type { User, SignUpRequest, LoginRequest } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginRequest) => Promise<{ success: boolean; user?: User; error?: string }>;
  signUp: (data: SignUpRequest) => Promise<{ success: boolean; user?: User; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
  useMockAuth?: boolean; // Enable mock authentication for development
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children, useMockAuth = true }: AuthProviderProps) => {
  const realAuth = useAuth();
  
  // Mock authentication state for development
  const [mockUser, setMockUser] = useState<User | null>(null);
  const [mockLoading, setMockLoading] = useState(true);

  useEffect(() => {
    if (useMockAuth) {
      // Check localStorage for existing mock user
      const storedUser = localStorage.getItem('superbear_user');
      if (storedUser) {
        try {
          setMockUser(JSON.parse(storedUser));
        } catch (e) {
          localStorage.removeItem('superbear_user');
        }
      }
      setMockLoading(false);
    }
  }, [useMockAuth]);

  // Mock login function
  const mockLogin = async (credentials: LoginRequest) => {
    setMockLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const mockUserData: User = {
      id: 'mock-user-' + Date.now(),
      username: credentials.email.split('@')[0],
      email: credentials.email,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    setMockUser(mockUserData);
    localStorage.setItem('superbear_user', JSON.stringify(mockUserData));
    localStorage.setItem('superbear_token', 'mock-token-' + Date.now());
    setMockLoading(false);
    
    return { success: true, user: mockUserData };
  };

  // Mock signup function
  const mockSignUp = async (data: SignUpRequest) => {
    setMockLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const mockUserData: User = {
      id: 'mock-user-' + Date.now(),
      username: data.username,
      email: data.email,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    setMockUser(mockUserData);
    localStorage.setItem('superbear_user', JSON.stringify(mockUserData));
    localStorage.setItem('superbear_token', 'mock-token-' + Date.now());
    setMockLoading(false);
    
    return { success: true, user: mockUserData };
  };

  // Mock logout function
  const mockLogout = async () => {
    setMockUser(null);
    localStorage.removeItem('superbear_user');
    localStorage.removeItem('superbear_token');
  };

  // Use mock or real auth based on flag
  const contextValue: AuthContextType = useMockAuth
    ? {
        user: mockUser,
        token: localStorage.getItem('superbear_token'),
        loading: mockLoading,
        isAuthenticated: !!mockUser,
        login: mockLogin,
        signUp: mockSignUp,
        logout: mockLogout,
      }
    : realAuth;

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

export const useAuthContext = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};
