import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/provider/AuthProvider";
import { DEV_CONFIG } from "../config/dev";

interface PrivateRouteProps {
    children: React.ReactNode;
    type?: "admin" | "user";
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
    // 🔧 DEV MODE: Auth bypass for development
    const DEV_MODE_AUTH_BYPASS = DEV_CONFIG.AUTH_BYPASS;
    
    const { isAuthenticated, initializing } = useAuth();

    // Dev mode'da direkt geç
    if (DEV_MODE_AUTH_BYPASS) {
        return <>{children}</>;
    }

    // localStorage'dan veri yüklenirken loading göster
    if (initializing) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
            </div>
        );
    }

    // Şimdilik sadece authentication kontrolü yap
    // Role kontrolü backend'de role bilgisi gelene kadar devre dışı
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Role kontrolü geçici olarak kaldırıldı
    // TODO: Backend'den role bilgisi geldiğinde aktif et
    // if (type === "admin" && user.role !== "admin") {
    //     return <Navigate to="/unauthorized" replace />;
    // }

    return <>{children}</>;
};

export default PrivateRoute;
