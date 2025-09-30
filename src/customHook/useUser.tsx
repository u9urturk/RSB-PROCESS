import { useMemo } from 'react';
import { useAuth } from '../context/provider/AuthProvider';
import type { User } from '../context/provider/AuthProvider';

// Permission Definitions (Single Responsibility)
interface UserPermissions {
  // Dashboard & Analytics
  canViewDashboard: boolean;
  canViewAnalytics: boolean;
  canExportReports: boolean;
  
  // User Management
  canManageUsers: boolean;
  canViewUsers: boolean;
  canDeleteUsers: boolean;
  
  // Order Management
  canManageOrders: boolean;
  canViewOrders: boolean;
  canUpdateOrderStatus: boolean;
  canCancelOrders: boolean;
  
  // Restaurant Management
  canManageRestaurants: boolean;
  canViewRestaurants: boolean;
  canApproveRestaurants: boolean;
  
  // System Administration
  canAccessSystemSettings: boolean;
  canManageRoles: boolean;
  canViewSystemLogs: boolean;
  
  // Content Management
  canManageContent: boolean;
  canManagePromotions: boolean;
  canManageCategories: boolean;
}

// Enhanced User Interface
interface EnhancedUser extends User {
  displayName: string;
  initials: string;
  avatar: string;
  permissions: UserPermissions;
  isAdmin: boolean;
  isManager: boolean;
  isUser: boolean;
}

// Return Type for Hook
interface UseUserReturn {
  // User Data
  user: EnhancedUser | null;
  isAuthenticated: boolean;
  
  // Role Checkers
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
  hasAllRoles: (roles: string[]) => boolean;
  
  // Permission Checkers
  hasPermission: (permission: keyof UserPermissions) => boolean;
  hasAnyPermission: (permissions: (keyof UserPermissions)[]) => boolean;
  hasAllPermissions: (permissions: (keyof UserPermissions)[]) => boolean;
  
  // Utility Functions
  getUserInfo: () => Pick<EnhancedUser, 'displayName' | 'initials' | 'avatar'> | null;
  getUserSummary: () => {
    username: string;
    roleCount: number;
    primaryRole: string;
    permissionCount: number;
  } | null;
  
  // Quick Access Properties
  isAdmin: boolean;
  isManager: boolean;
  isRegularUser: boolean;
}

// Permission Calculator (Business Logic Separation)
class PermissionCalculator {
  private static rolePermissionMap: Record<string, Partial<UserPermissions>> = {
    ADMIN: {
      canViewDashboard: true,
      canViewAnalytics: true,
      canExportReports: true,
      canManageUsers: true,
      canViewUsers: true,
      canDeleteUsers: true,
      canManageOrders: true,
      canViewOrders: true,
      canUpdateOrderStatus: true,
      canCancelOrders: true,
      canManageRestaurants: true,
      canViewRestaurants: true,
      canApproveRestaurants: true,
      canAccessSystemSettings: true,
      canManageRoles: true,
      canViewSystemLogs: true,
      canManageContent: true,
      canManagePromotions: true,
      canManageCategories: true,
    },
    MANAGER: {
      canViewDashboard: true,
      canViewAnalytics: true,
      canExportReports: true,
      canViewUsers: true,
      canManageOrders: true,
      canViewOrders: true,
      canUpdateOrderStatus: true,
      canCancelOrders: true,
      canViewRestaurants: true,
      canApproveRestaurants: true,
      canManageContent: true,
      canManagePromotions: true,
      canManageCategories: true,
    },
    USER: {
      canViewDashboard: true,
      canViewOrders: true,
      canViewRestaurants: true,
    },
    RESTAURANT_OWNER: {
      canViewDashboard: true,
      canViewOrders: true,
      canUpdateOrderStatus: true,
      canViewRestaurants: true,
      canManageContent: true,
    },
    DELIVERY_PARTNER: {
      canViewOrders: true,
      canUpdateOrderStatus: true,
    },
  };

  static calculatePermissions(roles: string[]): UserPermissions {
    const basePermissions: UserPermissions = {
      canViewDashboard: false,
      canViewAnalytics: false,
      canExportReports: false,
      canManageUsers: false,
      canViewUsers: false,
      canDeleteUsers: false,
      canManageOrders: false,
      canViewOrders: false,
      canUpdateOrderStatus: false,
      canCancelOrders: false,
      canManageRestaurants: false,
      canViewRestaurants: false,
      canApproveRestaurants: false,
      canAccessSystemSettings: false,
      canManageRoles: false,
      canViewSystemLogs: false,
      canManageContent: false,
      canManagePromotions: false,
      canManageCategories: false,
    };

    // Merge permissions from all roles
    roles.forEach(role => {
      const rolePermissions = this.rolePermissionMap[role];
      if (rolePermissions) {
        Object.assign(basePermissions, rolePermissions);
      }
    });

    return basePermissions;
  }
}

// Avatar Generator Utility
class AvatarGenerator {
  private static readonly AVATAR_COLORS = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', 
    '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'
  ];

  static generateAvatar(username: string): string {
    const initials = username
      .split(' ')
      .map(name => name.charAt(0).toUpperCase())
      .join('')
      .slice(0, 2);
    
    const colorIndex = username.length % this.AVATAR_COLORS.length;
    const backgroundColor = this.AVATAR_COLORS[colorIndex];
    
    // SVG avatar generation
    return `data:image/svg+xml,${encodeURIComponent(`
      <svg width="40" height="40" xmlns="http://www.w3.org/2000/svg">
        <circle cx="20" cy="20" r="20" fill="${backgroundColor}"/>
        <text x="20" y="26" font-family="Arial, sans-serif" font-size="14" 
              font-weight="bold" text-anchor="middle" fill="white">
          ${initials}
        </text>
      </svg>
    `)}`;
  }
}

// Main Hook Implementation
export const useUser = (): UseUserReturn => {
  const { user, isAuthenticated } = useAuth();

  // Enhanced User Object (Memoized for Performance)
  const enhancedUser = useMemo((): EnhancedUser | null => {
    if (!user) return null;

    const displayName = user.username || 'Unknown User';
    const initials = displayName
      .split(' ')
      .map(name => name.charAt(0).toUpperCase())
      .join('')
      .slice(0, 2);

    const avatar = AvatarGenerator.generateAvatar(displayName);
    const permissions = PermissionCalculator.calculatePermissions(user.roles);

    return {
      ...user,
      displayName,
      initials,
      avatar,
      permissions,
      isAdmin: user.roles.includes('ADMIN'),
      isManager: user.roles.includes('MANAGER'),
      isUser: user.roles.includes('USER'),
    };
  }, [user]);

  // Role Checking Functions (Memoized)
  const hasRole = useMemo(() => (role: string): boolean => {
    return user?.roles.includes(role) ?? false;
  }, [user]);

  const hasAnyRole = useMemo(() => (roles: string[]): boolean => {
    return roles.some(role => hasRole(role));
  }, [hasRole]);

  const hasAllRoles = useMemo(() => (roles: string[]): boolean => {
    return roles.every(role => hasRole(role));
  }, [hasRole]);

  // Permission Checking Functions (Memoized)
  const hasPermission = useMemo(() => (permission: keyof UserPermissions): boolean => {
    return enhancedUser?.permissions[permission] ?? false;
  }, [enhancedUser]);

  const hasAnyPermission = useMemo(() => (permissions: (keyof UserPermissions)[]): boolean => {
    return permissions.some(permission => hasPermission(permission));
  }, [hasPermission]);

  const hasAllPermissions = useMemo(() => (permissions: (keyof UserPermissions)[]): boolean => {
    return permissions.every(permission => hasPermission(permission));
  }, [hasPermission]);

  // Utility Functions (Memoized)
  const getUserInfo = useMemo(() => (): Pick<EnhancedUser, 'displayName' | 'initials' | 'avatar'> | null => {
    if (!enhancedUser) return null;
    return {
      displayName: enhancedUser.displayName,
      initials: enhancedUser.initials,
      avatar: enhancedUser.avatar,
    };
  }, [enhancedUser]);

  const getUserSummary = useMemo(() => () => {
    if (!enhancedUser) return null;
    
    const permissionCount = Object.values(enhancedUser.permissions)
      .filter(Boolean).length;
    
    const primaryRole = enhancedUser.roles[0] || 'USER';
    
    return {
      username: enhancedUser.username,
      roleCount: enhancedUser.roles.length,
      primaryRole,
      permissionCount,
    };
  }, [enhancedUser]);

  // Quick Access Properties
  const isAdmin = enhancedUser?.isAdmin ?? false;
  const isManager = enhancedUser?.isManager ?? false;
  const isRegularUser = enhancedUser?.isUser ?? false;

  return {
    // User Data
    user: enhancedUser,
    isAuthenticated,
    
    // Role Checkers
    hasRole,
    hasAnyRole,
    hasAllRoles,
    
    // Permission Checkers
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    
    // Utility Functions
    getUserInfo,
    getUserSummary,
    
    // Quick Access Properties
    isAdmin,
    isManager,
    isRegularUser,
  };
};

// Export types for external use
export type { 
  EnhancedUser, 
  UserPermissions, 
  UseUserReturn 
};