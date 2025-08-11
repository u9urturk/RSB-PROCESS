import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { authApiService } from '../../api/authApi';
import type { 
  RegisterRequest, 
  LoginRequest, 
  RecoveryLoginRequest, 
  RegisterData, 
  User 
} from '../../api/authApi';
import { JWTUtil } from '../../utils/jtwUtils';

// Auth State Interface
interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  registrationData: RegisterData | null;
  newRecoveryCode: string | null;
}

// Context Type
interface AuthContextType extends AuthState {
  login: (credentials: LoginRequest) => Promise<void>;
  loginWithRecovery: (credentials: RecoveryLoginRequest) => Promise<string>;
  register: (userData: RegisterRequest) => Promise<RegisterData>;
  logout: () => void;
  clearError: () => void;
  clearRegistrationData: () => void;
  clearNewRecoveryCode: () => void;
}

// Action Types
type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'AUTH_FAILURE'; payload: string }
  | { type: 'REGISTER_SUCCESS'; payload: RegisterData }
  | { type: 'RECOVERY_LOGIN_SUCCESS'; payload: { user: User; token: string; newRecoveryCode: string } }
  | { type: 'LOGOUT' }
  | { type: 'CLEAR_ERROR' }
  | { type: 'CLEAR_REGISTRATION_DATA' }
  | { type: 'CLEAR_NEW_RECOVERY_CODE' }
  | { type: 'SET_LOADING'; payload: boolean };

// Storage Service (Single Responsibility Principle)
class StorageService {
  private static readonly TOKEN_KEY = 'access_token';

  static getToken(): string | null {
    try {
      return localStorage.getItem(this.TOKEN_KEY);
    } catch {
      return null;
    }
  }

  static setToken(token: string): void {
    try {
      localStorage.setItem(this.TOKEN_KEY, token);
    } catch (error) {
      console.error('Failed to save token:', error);
    }
  }

  static removeToken(): void {
    try {
      localStorage.removeItem(this.TOKEN_KEY);
    } catch (error) {
      console.error('Failed to remove token:', error);
    }
  }
}

// Initial State
const initialState: AuthState = {
  user: null,
  token: StorageService.getToken(),
  isLoading: false,
  isAuthenticated: false,
  error: null,
  registrationData: null,
  newRecoveryCode: null,
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
      return {
        ...state,
        isLoading: false,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        error: null,
      };
    
    case 'AUTH_FAILURE':
      return {
        ...state,
        isLoading: false,
        isAuthenticated: false,
        user: null,
        token: null,
        error: action.payload,
      };
    
    case 'REGISTER_SUCCESS':
      return {
        ...state,
        isLoading: false,
        registrationData: action.payload,
        error: null,
      };
    
    case 'RECOVERY_LOGIN_SUCCESS':
      return {
        ...state,
        isLoading: false,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        newRecoveryCode: action.payload.newRecoveryCode,
        error: null,
      };
    
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        error: null,
        newRecoveryCode: null,
      };
    
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    
    case 'CLEAR_REGISTRATION_DATA':
      return {
        ...state,
        registrationData: null,
      };
    
    case 'CLEAR_NEW_RECOVERY_CODE':
      return {
        ...state,
        newRecoveryCode: null,
      };
    
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    
    default:
      return state;
  }
};

// Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider Component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, {
    ...initialState,
    isAuthenticated: initialState.token ? !JWTUtil.isTokenExpired(initialState.token) : false,
  });

  // DEV ONLY BYPASS (set window.__AUTH_BYPASS__=true or VITE_AUTH_BYPASS=1)
  useEffect(() => {
    const bypass = (window as any).__AUTH_BYPASS__ === true || import.meta.env.VITE_AUTH_BYPASS === '1';
    if (bypass && !state.isAuthenticated) {
      const dummyUser: User = {
        id: 'dev-user',
        username: 'Dev User',
        roles: ['ADMIN'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as any;
      dispatch({ type: 'AUTH_SUCCESS', payload: { user: dummyUser, token: 'dev-token' } });
    }
  }, [state.isAuthenticated]);

  // Auto-logout when token expires
  useEffect(() => {
    if (state.token && JWTUtil.isTokenExpired(state.token)) {
      logout();
    }
  }, [state.token]);

  // Restore user from token on app start
  useEffect(() => {
    if (state.token && !state.user && !JWTUtil.isTokenExpired(state.token)) {
      const user = JWTUtil.parseToken(state.token);
      if (user) {
        dispatch({
          type: 'AUTH_SUCCESS',
          payload: { user, token: state.token },
        });
      }
    }
  }, [state.token, state.user]);

  // Register function
  const register = useCallback(async (userData: RegisterRequest): Promise<RegisterData> => {
    try {
      dispatch({ type: 'AUTH_START' });
      
      const registrationData = await authApiService.register(userData);
      
      dispatch({ 
        type: 'REGISTER_SUCCESS', 
        payload: registrationData 
      });

      return registrationData;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
      throw error;
    }
  }, []);

  // Login function
  const login = useCallback(async (credentials: LoginRequest): Promise<void> => {
    try {
      dispatch({ type: 'AUTH_START' });
      
      const loginData = await authApiService.login(credentials);
      
      StorageService.setToken(loginData.token);
      dispatch({ 
        type: 'AUTH_SUCCESS', 
        payload: loginData
      });
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
      throw error;
    }
  }, []);

  // Recovery login function
  const loginWithRecovery = useCallback(async (credentials: RecoveryLoginRequest): Promise<string> => {
    try {
      dispatch({ type: 'AUTH_START' });
      
      const recoveryData = await authApiService.loginWithRecovery(credentials);
      
      StorageService.setToken(recoveryData.token);
      dispatch({ 
        type: 'RECOVERY_LOGIN_SUCCESS', 
        payload: recoveryData
      });

      return recoveryData.newRecoveryCode;
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Recovery login failed';
      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
      throw error;
    }
  }, []);

  // Logout function
  const logout = useCallback(async (): Promise<void> => {
    try {
      // Call API logout (optional)
      await authApiService.logout();
    } catch (error) {
      // Don't block logout for API errors
      console.warn('Logout API call failed:', error);
    } finally {
      // Always clean local storage and state
      StorageService.removeToken();
      dispatch({ type: 'LOGOUT' });
    }
  }, []);

  // Clear error function
  const clearError = useCallback((): void => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  // Clear registration data function
  const clearRegistrationData = useCallback((): void => {
    dispatch({ type: 'CLEAR_REGISTRATION_DATA' });
  }, []);

  // Clear new recovery code function
  const clearNewRecoveryCode = useCallback((): void => {
    dispatch({ type: 'CLEAR_NEW_RECOVERY_CODE' });
  }, []);

  // Memoized context value
  const contextValue: AuthContextType = React.useMemo(() => ({
    ...state,
    login,
    loginWithRecovery,
    register,
    logout,
    clearError,
    clearRegistrationData,
    clearNewRecoveryCode,
  }), [
    state,
    login,
    loginWithRecovery,
    register,
    logout,
    clearError,
    clearRegistrationData,
    clearNewRecoveryCode,
  ]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom Hook (Interface Segregation Principle)
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Export types for external use
export type { 
  RegisterRequest, 
  LoginRequest, 
  RecoveryLoginRequest,
  RegisterData, 
  User, 
  AuthState 
};