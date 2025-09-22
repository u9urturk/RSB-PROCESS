import { apiPost, setAccessTokenGetter } from './httpClient';
import { ErrorHandlerService } from '../utils/ErrorHandlerService';
import { User } from '../types';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

interface RegisterData {
  message: string;
  qrCode: string;
  recoveryCode: string;
  secret: string;
}

interface LoginData {
  success?: boolean;
  message: string;
  sessionId: string;
  refresh_expires_at: string;
  access_token: string;
}

interface RecoveryLoginData {
  message: string;
  newRecoveryCode: string;
}

// Request Types
interface RegisterRequest {
  username: string;
}

interface LoginRequest {
  username: string;
  token: string;
}

interface RecoveryLoginRequest {
  username: string;
  recoveryCode: string;
}
class AuthApiService {
  async register(userData: RegisterRequest): Promise<RegisterData> {
    try {
      const data = await apiPost<RegisterData>('/auth/register', userData);
      return data;
    } catch (error) {
      if (ErrorHandlerService.isConflictError(error)) {
        throw new Error('User already exists');
      }

      const handledError = ErrorHandlerService.handleError(error, 'AuthApi.register');
      throw new Error(handledError.userMessage);
    }
  }

  async login(credentials: LoginRequest): Promise<{ user: User }> {
    try {
      const data = await apiPost<LoginData>('/auth/login', credentials);
      setAccessTokenGetter(() => data.access_token);
      const userProfile = await this.profile();
      if (!data.access_token) {
        throw new Error(data.message || 'Login failed');
      }
      let user: User;
      user = {
        userId: userProfile.userId,
        sessionId: userProfile.sessionId,
        username: credentials.username,
        roles: userProfile.roles,
        access_token: data.access_token

      };
      return { user };
    } catch (error) {
      const handledError = ErrorHandlerService.handleError(error, 'AuthApi.login');
      throw new Error(handledError.userMessage);
    }
  }

  async loginWithRecovery(credentials: RecoveryLoginRequest): Promise<{ user: User; newRecoveryCode: string; }> {
    try {
      const data = await apiPost<RecoveryLoginData>('/auth/login-recovery', credentials);
      const user = await this.profile();
      return { user, newRecoveryCode: data.newRecoveryCode };
    } catch (error) {
      const handledError = ErrorHandlerService.handleError(error, 'AuthApi.loginWithRecovery');
      throw new Error(handledError.userMessage);
    }
  }

  async logout(): Promise<void> {
    try {
      await apiPost('/auth/logout');
    } catch (error) {
      ErrorHandlerService.logError(error, 'AuthApi.logout');
    }
  }

  async refreshSession(): Promise<any> {
    try {
      const data = await apiPost('/auth/refresh');
      return data;
    } catch (error) {
      const handledError = ErrorHandlerService.handleError(error, 'AuthApi.refreshSession');
      console.debug('[authApi] refreshSession failed', handledError.message);
      return false;
    }
  }

  async profile(): Promise<User> {
    try {
      const data = await apiPost<User>('/auth/profile');
      return data;
    } catch (error) {
      const handledError = ErrorHandlerService.handleError(error, 'AuthApi.profile');
      throw new Error(handledError.userMessage);
    }
  }
}

export const authApiService = new AuthApiService();

export type {
  RegisterRequest,
  LoginRequest,
  RecoveryLoginRequest,
  RegisterData,
  LoginData,
  RecoveryLoginData,
  User,
  ApiResponse,
};