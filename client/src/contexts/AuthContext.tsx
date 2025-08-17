import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { apiService } from '../lib/axios';

// Types
interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  city?: string;
  specialization?: string;
  level?: string;
  role: 'student' | 'admin' | 'teacher';
  createdAt?: string;
  updatedAt?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (userData: RegisterData) => Promise<void>;
  clearError: () => void;
}

interface RegisterData {
  email: string;
  password: string;
  role: 'student' | 'admin' | 'teacher';
  firstName?: string;
  lastName?: string;
  city?: string;
  specialization?: string;
  level?: string;
}

// Action types
type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: User }
  | { type: 'AUTH_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'CLEAR_ERROR' };

// Initial state
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

// Reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'AUTH_SUCCESS':
      console.log('AuthContext: AUTH_SUCCESS dispatched, setting isAuthenticated to true');
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case 'AUTH_FAILURE':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
};

// Create context
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check if user is already authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
      console.log('AuthContext: checkAuth called, token exists:', !!token);

      if (token) {
        try {
          dispatch({ type: 'AUTH_START' });
          const user = await apiService.get<User>('/auth/user');
          console.log('AuthContext: User data fetched successfully:', user);
          dispatch({ type: 'AUTH_SUCCESS', payload: user });
        } catch (error) {
          console.log('AuthContext: Authentication failed, clearing token');
          // Clear invalid token
          localStorage.removeItem('authToken');
          sessionStorage.removeItem('authToken');
          dispatch({ type: 'AUTH_FAILURE', payload: 'Session expired' });
        }
      } else {
        console.log('AuthContext: No token found, user not authenticated');
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      console.log('AuthContext: Starting login...');
      dispatch({ type: 'AUTH_START' });

      const response = await apiService.post<{ token: string }>('/auth/login', {
        email,
        password,
      });

      console.log('AuthContext: Login API call successful, token received');
      // Store token
      localStorage.setItem('authToken', response.token);

      // Fetch user data after successful login
      const user = await apiService.get<User>('/auth/user');
      console.log('AuthContext: User data fetched, dispatching AUTH_SUCCESS');
      dispatch({ type: 'AUTH_SUCCESS', payload: user });
    } catch (error: any) {
      console.error('AuthContext: Login error:', error);
      const errorMessage = error.response?.data?.message || 'Login failed';
      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
      throw error;
    }
  };

  const register = async (userData: RegisterData) => {
    try {
      dispatch({ type: 'AUTH_START' });

      console.log('🔗 Making registration request to:', '/auth/register');
      console.log('📦 User data:', userData);

      const response = await apiService.post<{ message: string; emailVerificationRequired?: boolean }>('/auth/register', {
        user: userData
      });

      console.log('✅ Registration successful. Response:', response);

      // Don't store token or authenticate user immediately
      // Email verification is required first
      dispatch({ type: 'LOGOUT' }); // Clear loading state without error
      
      return response; // Return response so component can handle email verification message
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Registration failed';
      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Call backend logout endpoint for additional security
      await apiService.post('/auth/logout');
    } catch (error) {
      // Even if backend call fails, we still logout client-side
      console.error('Backend logout failed:', error);
    } finally {
      // Clear token from storage
      localStorage.removeItem('authToken');
      sessionStorage.removeItem('authToken');

      // Update state
      dispatch({ type: 'LOGOUT' });
    }
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value: AuthContextType = {
    ...state,
    login,
    logout,
    register,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 