import { AxiosResponse } from 'axios';
import httpClient from './httpClient';
import { ErrorHandlerService } from '../utils/ErrorHandlerService';
import { User } from '../types';
import { JWTUtil } from '../utils/jtwUtils';

// API Response Types
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
  message: string;
  access_token: string;
}

interface RecoveryLoginData {
  message: string;
  access_token: string;
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

// Auth API Service (Single Responsibility + Open/Closed Principle)
class AuthApiService {
  // Register user
  async register(userData: RegisterRequest): Promise<RegisterData> {
    try {
      const response: AxiosResponse<ApiResponse<RegisterData>> = await httpClient.post(
        '/auth/register',
        userData
      );

      if (!response.data.success) {
        throw new Error(response.data.data?.message || 'Registration failed');
      }

      return response.data.data;
    } catch (error) {
      // Handle specific errors
      if (ErrorHandlerService.isConflictError(error)) {
        throw new Error('User already exists');
      }
      
      // Use global error handler
      const handledError = ErrorHandlerService.handleError(error, 'AuthApi.register');
      throw new Error(handledError.userMessage);
    }
  }

  // Login with OTP
  async login(credentials: LoginRequest): Promise<{ user: User; token: string }> {
    try {
      const response: AxiosResponse<ApiResponse<LoginData>> = await httpClient.post(
        '/auth/login',
        credentials
      );

      if (!response.data.success) {
        throw new Error(response.data.data?.message || 'Login failed');
      }

      const user = JWTUtil.parseToken(response.data.data.access_token);
      if (!user) {
        throw new Error('Invalid token received');
      }

      return {
        user,
        token: response.data.data.access_token,
      };
    } catch (error) {
      // Use global error handler
      const handledError = ErrorHandlerService.handleError(error, 'AuthApi.login');
      throw new Error(handledError.userMessage);
    }
  }

  // Login with recovery code
  async loginWithRecovery(credentials: RecoveryLoginRequest): Promise<{
    user: User;
    token: string;
    newRecoveryCode: string;
  }> {
    try {
      const response: AxiosResponse<ApiResponse<RecoveryLoginData>> = await httpClient.post(
        '/auth/login-recovery',
        credentials
      );

      if (!response.data.success) {
        throw new Error(response.data.data?.message || 'Recovery login failed');
      }

      const user = JWTUtil.parseToken(response.data.data.access_token);
      if (!user) {
        throw new Error('Invalid token received');
      }

      return {
        user,
        token: response.data.data.access_token,
        newRecoveryCode: response.data.data.newRecoveryCode,
      };
    } catch (error) {
      // Use global error handler
      const handledError = ErrorHandlerService.handleError(error, 'AuthApi.loginWithRecovery');
      throw new Error(handledError.userMessage);
    }
  }

  // Logout (if needed for API call)
  async logout(): Promise<void> {
    try {
      await httpClient.post('/auth/logout');
    } catch (error) {
      // Don't throw logout errors, just log them
      ErrorHandlerService.logError(error, 'AuthApi.logout');
    }
  }

  // Refresh token (future use)
  async refreshToken(): Promise<{ token: string; user: User }> {
    try {
      const response: AxiosResponse<ApiResponse<LoginData>> = await httpClient.post(
        '/auth/refresh'
      );

      if (!response.data.success) {
        throw new Error('Token refresh failed');
      }

      const user = JWTUtil.parseToken(response.data.data.access_token);
      if (!user) {
        throw new Error('Invalid token received');
      }

      return {
        user,
        token: response.data.data.access_token,
      };
    } catch (error) {
      // Use global error handler
      const handledError = ErrorHandlerService.handleError(error, 'AuthApi.refreshToken');
      throw new Error(handledError.userMessage);
    }
  }

  // Verify token (check if token is still valid)
  async verifyToken(): Promise<User> {
    try {
      const response: AxiosResponse<ApiResponse<{ user: User }>> = await httpClient.get(
        '/auth/verify'
      );

      if (!response.data.success) {
        throw new Error('Token verification failed');
      }

      return response.data.data.user;
    } catch (error) {
      // Use global error handler
      const handledError = ErrorHandlerService.handleError(error, 'AuthApi.verifyToken');
      throw new Error(handledError.userMessage);
    }
  }
}

// Export singleton instance
export const authApiService = new AuthApiService();

// Export types
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