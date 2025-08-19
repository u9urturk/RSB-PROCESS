import { User } from "@/types";

// JWT Payload Interface
interface JWTPayload {
  sub: string;
  username: string;
  roles?: string[];
  exp: number;
  iat: number;
  [key: string]: any;
}

// JWT Utility Class (Single Responsibility Principle)
class JWTUtil {
  /**
   * Parse JWT token and extract user information
   * @param token - JWT token string
   * @returns User object or null if parsing fails
   */
  static parseToken(token: string): User | null {
    try {
      if (!token || typeof token !== 'string') {
        return null;
      }

      const parts = token.split('.');
      if (parts.length !== 3) {
        return null;
      }

      const payload = JSON.parse(atob(parts[1])) as JWTPayload;
      
      return {
        userId: payload.sub || '',
        username: payload.username || '',
        roles: payload.roles || [],
      };
    } catch (error) {
      console.error('Error parsing JWT token:', error);
      return null;
    }
  }

  /**
   * Check if JWT token is expired
   * @param token - JWT token string
   * @returns true if token is expired, false otherwise
   */
  static isTokenExpired(token: string): boolean {
    try {
      if (!token || typeof token !== 'string') {
        return true;
      }

      const parts = token.split('.');
      if (parts.length !== 3) {
        return true;
      }

      const payload = JSON.parse(atob(parts[1])) as JWTPayload;
      
      if (!payload.exp) {
        return true;
      }

      // Add 30 seconds buffer to account for clock skew
      const currentTime = Math.floor(Date.now() / 1000);
      const bufferTime = 30;
      
      return currentTime >= (payload.exp - bufferTime);
    } catch (error) {
      console.error('Error checking token expiration:', error);
      return true;
    }
  }

  /**
   * Get token expiration date
   * @param token - JWT token string
   * @returns Date object or null if parsing fails
   */
  static getTokenExpirationDate(token: string): Date | null {
    try {
      if (!token || typeof token !== 'string') {
        return null;
      }

      const parts = token.split('.');
      if (parts.length !== 3) {
        return null;
      }

      const payload = JSON.parse(atob(parts[1])) as JWTPayload;
      
      if (!payload.exp) {
        return null;
      }

      return new Date(payload.exp * 1000);
    } catch (error) {
      console.error('Error getting token expiration date:', error);
      return null;
    }
  }

  /**
   * Get remaining time until token expires
   * @param token - JWT token string
   * @returns remaining time in milliseconds, or 0 if expired/invalid
   */
  static getTokenRemainingTime(token: string): number {
    try {
      const expirationDate = this.getTokenExpirationDate(token);
      if (!expirationDate) {
        return 0;
      }

      const remainingTime = expirationDate.getTime() - Date.now();
      return Math.max(0, remainingTime);
    } catch (error) {
      console.error('Error getting token remaining time:', error);
      return 0;
    }
  }

  /**
   * Check if token will expire within specified minutes
   * @param token - JWT token string
   * @param minutes - minutes to check ahead
   * @returns true if token will expire soon
   */
  static willTokenExpireSoon(token: string, minutes: number = 5): boolean {
    try {
      const remainingTime = this.getTokenRemainingTime(token);
      const thresholdTime = minutes * 60 * 1000; // Convert minutes to milliseconds
      
      return remainingTime <= thresholdTime;
    } catch (error) {
      console.error('Error checking if token will expire soon:', error);
      return true;
    }
  }

  /**
   * Extract full payload from JWT token
   * @param token - JWT token string
   * @returns JWT payload or null if parsing fails
   */
  static getTokenPayload(token: string): JWTPayload | null {
    try {
      if (!token || typeof token !== 'string') {
        return null;
      }

      const parts = token.split('.');
      if (parts.length !== 3) {
        return null;
      }

      return JSON.parse(atob(parts[1])) as JWTPayload;
    } catch (error) {
      console.error('Error getting token payload:', error);
      return null;
    }
  }

  /**
   * Validate JWT token format (basic validation)
   * @param token - JWT token string
   * @returns true if token format is valid
   */
  static isValidTokenFormat(token: string): boolean {
    try {
      if (!token || typeof token !== 'string') {
        return false;
      }

      const parts = token.split('.');
      if (parts.length !== 3) {
        return false;
      }

      // Try to decode each part
      atob(parts[0]); // header
      atob(parts[1]); // payload
      
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get user roles from token
   * @param token - JWT token string
   * @returns array of user roles
   */
  static getUserRoles(token: string): string[] {
    try {
      const user = this.parseToken(token);
      return user?.roles || [];
    } catch (error) {
      console.error('Error getting user roles:', error);
      return [];
    }
  }

  /**
   * Check if user has specific role
   * @param token - JWT token string
   * @param role - role to check
   * @returns true if user has the role
   */
  static hasRole(token: string, role: string): boolean {
    try {
      const roles = this.getUserRoles(token);
      return roles.includes(role);
    } catch (error) {
      console.error('Error checking user role:', error);
      return false;
    }
  }

  /**
   * Check if user has any of the specified roles
   * @param token - JWT token string
   * @param roles - array of roles to check
   * @returns true if user has any of the roles
   */
  static hasAnyRole(token: string, roles: string[]): boolean {
    try {
      const userRoles = this.getUserRoles(token);
      return roles.some(role => userRoles.includes(role));
    } catch (error) {
      console.error('Error checking user roles:', error);
      return false;
    }
  }
}

export { JWTUtil };
export type { User, JWTPayload };