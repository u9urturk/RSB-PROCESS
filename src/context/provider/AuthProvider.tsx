import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { RealtimeService, realtimeServiceRegistry } from '@/realtime/RealtimeService';
import { authApiService } from '../../api/authApi';
import { useNotification } from './NotificationProvider';
import type {
  RegisterRequest,
  LoginRequest,
  RecoveryLoginRequest,
  RegisterData,
  User
} from '../../api/authApi';
import { setAccessTokenGetter } from '@/api/httpClient';


interface AuthState {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  registrationData: RegisterData | null;
  newRecoveryCode: string | null;
}

interface AuthContextType extends AuthState {
  login: (credentials: LoginRequest) => Promise<void>;
  loginWithRecovery: (credentials: RecoveryLoginRequest) => Promise<string>;
  register: (userData: RegisterRequest) => Promise<RegisterData>;
  logout: () => void;
  clearError: () => void;
  clearRegistrationData: () => void;
  clearNewRecoveryCode: () => void;
}

type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: { user: User; accessToken: string | null } }
  | { type: 'REFRESH_TOKEN'; payload: { accessToken: string } }
  | { type: 'UPDATE_USER'; payload: { user: User } }
  | { type: 'AUTH_FAILURE'; payload: string }
  | { type: 'REGISTER_SUCCESS'; payload: RegisterData }
  | { type: 'RECOVERY_LOGIN_SUCCESS'; payload: { user: User; accessToken: string | null; newRecoveryCode: string } }
  | { type: 'LOGOUT' }
  | { type: 'CLEAR_ERROR' }
  | { type: 'CLEAR_REGISTRATION_DATA' }
  | { type: 'CLEAR_NEW_RECOVERY_CODE' }
  | { type: 'SET_LOADING'; payload: boolean };

const initialState: AuthState = {
  user: null,
  accessToken: null,
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
        accessToken: action.payload.accessToken,
        error: null,
      };

    case 'REFRESH_TOKEN':
      return {
        ...state,
        isLoading: false,
        isAuthenticated: true,
        accessToken: action.payload.accessToken,
        error: null,
      };

    case 'UPDATE_USER':
      return {
        ...state,
        isLoading: false,
        isAuthenticated: true,
        user: action.payload.user,
        error: null,
      };

    case 'AUTH_FAILURE':
      return {
        ...state,
        isLoading: false,
        isAuthenticated: false,
        user: null,
        accessToken: null,
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
        accessToken: action.payload.accessToken,
        newRecoveryCode: action.payload.newRecoveryCode,
        error: null,
      };

    case 'LOGOUT':
      return {
        ...state,
        user: null,
        accessToken: null,
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

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { showNotification } = useNotification();
  const sessionIdRef = React.useRef<string | undefined>(undefined);
  const [state, dispatch] = useReducer(authReducer, {
    ...initialState,
    accessToken: null,
    isAuthenticated: false,
  });

  useEffect(() => {
    sessionIdRef.current = state.user?.sessionId;
  }, [state.user?.sessionId]);

  const REALTIME_LOGOUT_ENABLED = false;
  // const REALTIME_BASE = 'ws://localhost:3000';
  const REALTIME_BASE = false;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const refreshed = await authApiService.refreshSession();
        console.log('🔄 Refresh Token Response:', refreshed.access_token);
        if (!cancelled) {
          dispatch({ type: 'REFRESH_TOKEN', payload: { accessToken: refreshed.access_token } });
        }
      } catch (error) {
        console.log('🚫 Refresh failed:', error);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const user = await authApiService.profile();
        if (!cancelled) dispatch({ type: 'UPDATE_USER', payload: { user } });
      } catch { /* yok say */ }
    })();
    return () => { cancelled = true; };

  }, [state.accessToken]);


  useEffect(() => {
    if (!REALTIME_LOGOUT_ENABLED) return;
    if (!REALTIME_BASE) {
      console.warn('[RT] REALTIME_BASE empty -> realtime disabled');
      return;
    }
    if (!realtimeServiceRegistry.instance) {
      realtimeServiceRegistry.instance = new RealtimeService({
        baseUrl: REALTIME_BASE,
        debug: ((import.meta as any).env?.VITE_DEBUG_REALTIME === 'true'),
        getCurrentSessionId: () => sessionIdRef.current,
        onCurrentSessionRevoked: ({ reason }) => {
          showNotification(
            'warning',
            'Oturumunuz sonlandırılıyor!',
            {
              countdown: 10,
              onComplete: () => {
                logout();
                realtimeServiceRegistry.instance?.disconnect();
                console.info('[RT] current session revoked', reason);
              }
            }
          );
        },
        onOtherSessionRevoked: ({ sessionId }) => {
          console.info('[RT] other session revoked (no logout expected)', sessionId);
        },
        onAuthError: () => {
          (async () => {
            console.warn('[RT] auth_error received -> attempting silent refresh');
            try { await authApiService.refreshSession(); console.log('[RT] silent refresh success, reconnecting'); } catch { console.warn('[RT] silent refresh failed'); }
            realtimeServiceRegistry.instance?.connect();
          })();
        }
      });
      if (typeof window !== 'undefined') (window as any).__RT__ = realtimeServiceRegistry.instance;
    }

  }, [REALTIME_LOGOUT_ENABLED, REALTIME_BASE, state.user?.sessionId]);

  useEffect(() => {
    if (!REALTIME_LOGOUT_ENABLED || !realtimeServiceRegistry.instance) return;
    const handleDisconnect = () => {
      if (state.isAuthenticated) {
        setTimeout(() => {
          realtimeServiceRegistry.instance?.connect();
        }, 2000);
      }
    };
    const socket = realtimeServiceRegistry.instance['socket'];
    if (socket) {
      socket.on('disconnect', handleDisconnect);
    }
    return () => {
      if (socket) {
        socket.off('disconnect', handleDisconnect);
      }
    };
  }, [state.isAuthenticated, REALTIME_LOGOUT_ENABLED]);

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

  useEffect(() => {
    if (state.accessToken !== null) {
      console.log('🔧 Token Getter Updated, Current Token:', state.accessToken);
    } setAccessTokenGetter(() => state.accessToken);
  }, [state.accessToken]);

  const login = useCallback(async (credentials: LoginRequest): Promise<void> => {
    console.log('Attempting login with credentials:', credentials);
    try {
      dispatch({ type: 'AUTH_START' });

      const { user } = await authApiService.login(credentials);

      console.log('Login successful, user:', user);
      dispatch({ type: 'AUTH_SUCCESS', payload: { user, accessToken: user.access_token || null } });

      if (REALTIME_LOGOUT_ENABLED && realtimeServiceRegistry.instance) {
        realtimeServiceRegistry.instance.connect();
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
      throw error;
    }
  }, []);

  const loginWithRecovery = useCallback(async (credentials: RecoveryLoginRequest): Promise<string> => {
    try {
      dispatch({ type: 'AUTH_START' });

      const recoveryData = await authApiService.loginWithRecovery(credentials);
      dispatch({ type: 'RECOVERY_LOGIN_SUCCESS', payload: { user: recoveryData.user, accessToken: null, newRecoveryCode: recoveryData.newRecoveryCode } });

      if (REALTIME_LOGOUT_ENABLED && realtimeServiceRegistry.instance) {
        realtimeServiceRegistry.instance.connect();
      }
      return recoveryData.newRecoveryCode;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Recovery login failed';
      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
      throw error;
    }
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    try {
      await authApiService.logout();
    } catch (error) {
      console.warn('Logout API call failed:', error);
    } finally {
      realtimeServiceRegistry.instance?.disconnect();
      dispatch({ type: 'LOGOUT' });
    }
  }, []);

  const clearError = useCallback((): void => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  const clearRegistrationData = useCallback((): void => {
    dispatch({ type: 'CLEAR_REGISTRATION_DATA' });
  }, []);

  const clearNewRecoveryCode = useCallback((): void => {
    dispatch({ type: 'CLEAR_NEW_RECOVERY_CODE' });
  }, []);

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

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export type {
  RegisterRequest,
  LoginRequest,
  RecoveryLoginRequest,
  RegisterData,
  User,
  AuthState
};