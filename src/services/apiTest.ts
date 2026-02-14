/**
 * API Connection Test Utility
 * 
 * Use this to test if the backend API is reachable and responding correctly.
 * Run this from browser console or create a test page.
 */

import apiClient from './api';

export interface HealthCheckResponse {
  status: string;
  timestamp: string;
  version?: string;
}

export const testApiConnection = async (): Promise<{
  success: boolean;
  message: string;
  details?: any;
}> => {
  try {
    // Test basic connectivity
    const response = await apiClient.get<HealthCheckResponse>('/health');
    
    if (response.status === 200) {
      return {
        success: true,
        message: '✅ Backend API is connected and responding',
        details: response.data,
      };
    }
    
    return {
      success: false,
      message: '❌ Backend API returned unexpected status',
      details: { status: response.status, data: response.data },
    };
  } catch (error: any) {
    if (error.message === 'Network Error') {
      return {
        success: false,
        message: '❌ Cannot reach backend API. Is it running?',
        details: {
          error: 'Network Error',
          expectedUrl: import.meta.env.VITE_API_BASE_URL,
          hint: 'Check if backend server is running and VITE_API_BASE_URL is correct in .env',
        },
      };
    }
    
    if (error.response?.status === 404) {
      return {
        success: false,
        message: '❌ Health check endpoint not found',
        details: {
          error: '404 Not Found',
          hint: 'Ensure your FastAPI backend has a /health endpoint',
        },
      };
    }
    
    return {
      success: false,
      message: '❌ API connection error',
      details: {
        error: error.message,
        response: error.response?.data,
      },
    };
  }
};

/**
 * Test authentication endpoints
 */
export const testAuthEndpoints = async (): Promise<{
  signup: boolean;
  login: boolean;
  me: boolean;
}> => {
  const results = {
    signup: false,
    login: false,
    me: false,
  };
  
  try {
    // Test signup endpoint exists
    await apiClient.options('/auth/signup');
    results.signup = true;
  } catch (e) {
    console.warn('Signup endpoint not found or not accessible');
  }
  
  try {
    // Test login endpoint exists
    await apiClient.options('/auth/login');
    results.login = true;
  } catch (e) {
    console.warn('Login endpoint not found or not accessible');
  }
  
  try {
    // Test me endpoint exists (will return 401 if not authenticated, which is fine)
    await apiClient.get('/auth/me');
    results.me = true;
  } catch (e: any) {
    // 401 means endpoint exists but we're not authenticated - that's OK
    if (e.response?.status === 401) {
      results.me = true;
    }
  }
  
  return results;
};

/**
 * Console test runner
 * Usage: Run in browser console: window.testAPI()
 */
export const runAllTests = async () => {
  console.log('🧪 Testing SuperBear API Connection...\n');
  
  // Test 1: Basic connectivity
  console.log('Test 1: Basic Connectivity');
  const connectionTest = await testApiConnection();
  console.log(connectionTest.message);
  if (connectionTest.details) {
    console.log('Details:', connectionTest.details);
  }
  console.log('');
  
  // Test 2: Auth endpoints
  console.log('Test 2: Authentication Endpoints');
  const authTest = await testAuthEndpoints();
  console.log('Signup endpoint:', authTest.signup ? '✅' : '❌');
  console.log('Login endpoint:', authTest.login ? '✅' : '❌');
  console.log('Me endpoint:', authTest.me ? '✅' : '❌');
  console.log('');
  
  // Test 3: Environment config
  console.log('Test 3: Environment Configuration');
  console.log('API Base URL:', import.meta.env.VITE_API_BASE_URL);
  console.log('App Name:', import.meta.env.VITE_APP_NAME);
  console.log('Environment:', import.meta.env.VITE_APP_ENV);
  console.log('');
  
  // Summary
  const allPassed = connectionTest.success && authTest.signup && authTest.login && authTest.me;
  
  if (allPassed) {
    console.log('✅ All tests passed! Backend is ready for integration.');
  } else {
    console.log('⚠️ Some tests failed. Check details above.');
    console.log('\nQuick fixes:');
    console.log('1. Make sure backend server is running');
    console.log('2. Check VITE_API_BASE_URL in .env file');
    console.log('3. Verify CORS is configured in backend');
    console.log('4. Ensure required endpoints are implemented');
  }
  
  return allPassed;
};

// Make it available in browser console for quick testing
if (typeof window !== 'undefined') {
  (window as any).testAPI = runAllTests;
  console.log('💡 Tip: Run window.testAPI() in console to test API connection');
}

export default {
  testApiConnection,
  testAuthEndpoints,
  runAllTests,
};
