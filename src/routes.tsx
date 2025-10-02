import React, { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useUser } from "./customHook/useUser";
import type { UserPermissions } from "./customHook/useUser";

import DashBoard from "./pages/DashBoard";
import Layout from "./pages/Layout";
import Login from "./pages/Login";
import MenuBusinessMain from "./pages/menubusiness/MenuBusinessMain";
import OnlineOrders from "./pages/OnlineOrders";
import RestaurantStatusMain from "./pages/restaurantstatus/RestaurantStatusMain";
import SplashScreen from "./pages/SplashScreen";
import StockBusinessMain from "./pages/stockbusiness/StockBusinessMain";
import StockTypeManagement from "./pages/stockbusiness/StockTypeManagement";
import WarehouseManagement from "./pages/stockbusiness/WarehouseManagement";
import SupplierManagement from "./pages/stockbusiness/SupplierManagement";
import ProfilePage from "./pages/Profile";
import UserManagementPage from "./pages/UserManagementPage";
import { WebSocketDemoPage } from "./pages/WebSocketDemoPage";

interface CustomRouteObject {
    path?: string;
    element?: ReactNode;
    // Authentication
    auth?: boolean;
    // Role-based protection
    requireRoles?: string[];
    requireAnyRole?: string[];
    requireAllRoles?: string[];
    // Permission-based protection
    requirePermissions?: (keyof UserPermissions)[];
    requireAnyPermission?: (keyof UserPermissions)[];
    // Legacy support
    admin?: boolean;
    type?: "admin" | "user" | "manager" | "waiter" | "cashier";
    // Custom check
    customCheck?: (user: any) => boolean;
    // Route properties
    index?: any;
    children?: CustomRouteObject[];
}

// Loading Component
const RouteLoading: React.FC = () => (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Yükleniyor...</p>
        </div>
    </div>
);

// Unauthorized Component
const UnauthorizedAccess: React.FC<{ message?: string; details?: string }> = ({
    message = "Bu sayfaya erişim yetkiniz bulunmuyor.",
    details
}) => (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6">
            <div className="mb-6">
                <svg className="w-20 h-20 text-red-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
            </div>
            <h1 className="text-4xl font-bold text-red-600 mb-4">403</h1>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Erişim Engellendi</h2>
            <p className="text-gray-600 mb-4">{message}</p>
            {details && (
                <div className="bg-gray-100 p-3 rounded-lg mb-6">
                    <p className="text-sm text-gray-700">{details}</p>
                </div>
            )}
            <div className="space-y-3">
                <button
                    onClick={() => window.history.back()}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg w-full transition-colors"
                >
                    Geri Dön
                </button>
                <button
                    onClick={() => window.location.href = '/dashboard'}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg w-full transition-colors"
                >
                    Ana Sayfaya Git
                </button>
            </div>
        </div>
    </div>
);

// Private Route Component
interface PrivateRouteProps {
    children: ReactNode;
    requireRoles?: string[];
    requireAnyRole?: string[];
    requireAllRoles?: string[];
    requirePermissions?: (keyof UserPermissions)[];
    requireAnyPermission?: (keyof UserPermissions)[];
    admin?: boolean;
    type?: "admin" | "user" | "manager" | "waiter" | "cashier";
    customCheck?: (user: any) => boolean;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({
    children,
    requireRoles = [],
    requireAnyRole = [],
    requireAllRoles = [],
    requirePermissions = [],
    requireAnyPermission = [],
    admin = false,
    type,
    customCheck
}) => {
    const {
        user,
        isAuthenticated,
        hasRole,
        hasAnyRole,
        hasAllRoles,
        hasPermission,
        hasAnyPermission,
    } = useUser();

    // Show loading while authentication is being determined
    if (isAuthenticated === undefined) {
        return <RouteLoading />;
    }

    // TEMP DEV BYPASS (remove when backend ready)
    const AUTH_BYPASS = (window as any).__AUTH_BYPASS__ === true || import.meta.env.VITE_AUTH_BYPASS === '1';
    if (AUTH_BYPASS && (!isAuthenticated || !user)) {
        // fake pass-through
        return <>{children}</>;
    }
    // Redirect to login if not authenticated (normal flow)
    if (!isAuthenticated || !user) {
        return <Navigate to="/" replace />;
    }

    // Legacy support for admin prop
    if (admin && !hasRole('ADMIN')) {
        return <UnauthorizedAccess
            message="Bu sayfa sadece yöneticiler için erişilebilir."
            details="ADMIN rolü gereklidir."
        />;
    }

    // Legacy support for type prop
    if (type) {
        const typeRoleMap: Record<string, string[]> = {
            admin: ['ADMIN'],
            manager: ['ADMIN', 'MANAGER'],
            user: ['USER', 'ADMIN', 'MANAGER'],
            waiter: ['WAITER', 'ADMIN', 'MANAGER'],
            cashier: ['CASHIER', 'ADMIN', 'MANAGER']
        };

        const allowedRoles = typeRoleMap[type] || [];
        if (allowedRoles.length > 0 && !hasAnyRole(allowedRoles)) {
            return <UnauthorizedAccess
                message={`Bu sayfa ${type} rolü için erişilebilir.`}
                details={`Gerekli roller: ${allowedRoles.join(', ')}`}
            />;
        }
    }

    // Check specific roles requirement
    if (requireRoles.length > 0) {
        const hasRequiredRoles = requireRoles.every(role => hasRole(role));
        if (!hasRequiredRoles) {
            return <UnauthorizedAccess
                message="Gerekli rollere sahip değilsiniz."
                details={`Gerekli roller: ${requireRoles.join(', ')}`}
            />;
        }
    }

    // Check any role requirement
    if (requireAnyRole.length > 0) {
        if (!hasAnyRole(requireAnyRole)) {
            return <UnauthorizedAccess
                message="Gerekli rollerden birine sahip değilsiniz."
                details={`Gerekli rollerden biri: ${requireAnyRole.join(', ')}`}
            />;
        }
    }

    // Check all roles requirement
    if (requireAllRoles.length > 0) {
        if (!hasAllRoles(requireAllRoles)) {
            return <UnauthorizedAccess
                message="Tüm gerekli rollere sahip değilsiniz."
                details={`Tüm gerekli roller: ${requireAllRoles.join(', ')}`}
            />;
        }
    }

    // Check specific permissions requirement
    if (requirePermissions.length > 0) {
        const hasRequiredPermissions = requirePermissions.every(permission => hasPermission(permission));
        if (!hasRequiredPermissions) {
            return <UnauthorizedAccess
                message="Bu işlemi gerçekleştirmek için yetkiniz bulunmuyor."
                details={`Gerekli yetkiler: ${requirePermissions.join(', ')}`}
            />;
        }
    }

    // Check any permission requirement
    if (requireAnyPermission.length > 0) {
        if (!hasAnyPermission(requireAnyPermission)) {
            return <UnauthorizedAccess
                message="Bu işlemi gerçekleştirmek için yetkiniz bulunmuyor."
                details={`Gerekli yetkilerden biri: ${requireAnyPermission.join(', ')}`}
            />;
        }
    }

    // Custom check function
    if (customCheck && !customCheck(user)) {
        return <UnauthorizedAccess
            message="Bu sayfaya erişim için özel koşulları sağlamıyorsunuz."
            details="Ek business logic kontrolü başarısız."
        />;
    }

    return <>{children}</>;
};

// Route definitions
const routes: CustomRouteObject[] = [
    {
        path: '/',
        element: <SplashScreen />,
    },
    {
        path: '/login',
        element: <Login />,
    },
    {
        path: '/dashboard',
        element: <Layout />,
        auth: true,
        requireAnyRole: ['USER', 'ADMIN', 'MANAGER', 'WAITER', 'CASHIER'],
        children: [
            {
                index: true,
                element: <DashBoard />,
                auth: true,
                requireAnyRole: ['USER', 'ADMIN', 'MANAGER'],
                requireAnyPermission: ['canViewDashboard']
            },
            {
                path: 'onlineorders',
                element: <OnlineOrders />,
                auth: true,
                requireAnyRole: ['ADMIN', 'MANAGER', 'WAITER'],
                requireAnyPermission: ['canViewOrders', 'canManageOrders']
            },
            {
                path: 'restaurantstatus',
                element: <RestaurantStatusMain />,
                auth: true,
                requireAnyRole: ['ADMIN', 'MANAGER', 'WAITER'],
                requireAnyPermission: ['canViewRestaurants', 'canManageRestaurants']
            },
            {
                path: 'stockbusiness',
                element: <StockBusinessMain />,
                auth: true,
                requireAnyRole: ['ADMIN', 'MANAGER'],
                requireAnyPermission: ['canManageContent', 'canManageCategories'],
                customCheck: (user) => {
                    const hasStockPermission = user?.permissions?.canManageContent || user?.permissions?.canManageCategories;
                    const hasAnalyticsOrAdmin = user?.permissions?.canViewAnalytics || user?.roles?.includes('ADMIN');
                    return hasStockPermission && hasAnalyticsOrAdmin;
                },
                children: [
                    {
                        path: 'stock-types',
                        element: <StockTypeManagement />,
                        auth: true,
                        requireAnyRole: ['ADMIN', 'MANAGER'],
                        requireAnyPermission: ['canManageCategories']
                    },
                    {
                        path: 'warehouse',
                        element: <WarehouseManagement />,
                        auth: true,
                        requireAnyRole: ['ADMIN', 'MANAGER'],
                        requireAnyPermission: ['canManageContent']
                    },
                    {
                        path: 'suppliers',
                        element: <SupplierManagement />,
                        auth: true,
                        requireAnyRole: ['ADMIN', 'MANAGER'],
                        requireAnyPermission: ['canManageContent']
                    }
                ]
            },
            {
                path: 'menubusiness',
                element: <MenuBusinessMain />,
                auth: true,
                requireAnyRole: ['ADMIN', 'MANAGER'],
                requireAnyPermission: ['canManageContent', 'canManageCategories'],
                customCheck: (user) => {
                    // Menü yönetimi için özel business logic
                    const hasMenuPermission = user?.permissions?.canManageContent;
                    const isManagerOrAdmin = user?.roles?.includes('ADMIN') || user?.roles?.includes('MANAGER');
                    return hasMenuPermission && isManagerOrAdmin;
                }
            },
            {
                path: 'users',
                element: <UserManagementPage />,
                auth: true,
                requireAnyRole: ['ADMIN', 'MANAGER'],
                requireAnyPermission: ['canManageUsers', 'canViewUsers']
            }
            ,
            {
                path: 'profile',
                element: <ProfilePage />,
                auth: true,
                requireAnyRole: ['USER', 'ADMIN', 'MANAGER', 'WAITER', 'CASHIER']
            },
            {
                path: 'websocket-demo',
                element: <WebSocketDemoPage />,
                auth: true,
                requireAnyRole: ['ADMIN']
            }
        ]
    },
    // Unauthorized sayfası
    {
        path: '/unauthorized',
        element: (
            <UnauthorizedAccess
                message="Bu sayfaya erişim yetkiniz bulunmamaktadır."
                details="Lütfen sistem yöneticinizle iletişime geçin."
            />
        )
    },
    // 404 Not Found sayfası
    {
        path: '*',
        element: (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <h1 className="text-6xl font-bold text-gray-400 mb-4">404</h1>
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">Sayfa Bulunamadı</h2>
                    <p className="text-gray-600 mb-8">Aradığınız sayfa mevcut değil.</p>
                    <div className="space-y-3">
                        <button
                            onClick={() => window.history.back()}
                            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg transition-colors"
                        >
                            Geri Dön
                        </button>
                        <button
                            onClick={() => window.location.href = '/dashboard'}
                            className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg transition-colors"
                        >
                            Ana Sayfaya Dön
                        </button>
                    </div>
                </div>
            </div>
        )
    }
];

// Enhanced auth check function
const authCheck = (routes: CustomRouteObject[]): CustomRouteObject[] =>
    routes.map((route) => {
        if (route?.auth) {
            // Authentication ve authorization parametrelerini hazırla
            const authProps: PrivateRouteProps = { children: route.element };

            // Role kontrolü parametreleri
            if (route.requireRoles) authProps.requireRoles = route.requireRoles;
            if (route.requireAnyRole) authProps.requireAnyRole = route.requireAnyRole;
            if (route.requireAllRoles) authProps.requireAllRoles = route.requireAllRoles;

            // Permission kontrolü parametreleri
            if (route.requirePermissions) authProps.requirePermissions = route.requirePermissions;
            if (route.requireAnyPermission) authProps.requireAnyPermission = route.requireAnyPermission;

            // Custom check function
            if (route.customCheck) authProps.customCheck = route.customCheck;

            // Legacy support
            if (route.type) authProps.type = route.type;
            if (route.admin) authProps.admin = route.admin;

            // PrivateRoute ile sarmal
            route.element = <PrivateRoute {...authProps} />;
        }

        // Children routes için recursive auth check
        if (route?.children) {
            route.children = authCheck(route.children);
        }

        return route;
    });

export default authCheck(routes);