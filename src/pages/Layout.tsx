import React from 'react';
import { Outlet, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/provider/AuthProvider';
import { useNavigation } from '../context/provider/NavigationProvider';

interface LayoutProps {
    children?: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = () => {
    const location = useLocation();
    const { isAuthenticated } = useAuth();
    const { activePath } = useNavigation();
    console.log(isAuthenticated, 'isAuthenticated in Layout');

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    const getTitle = (): string => {
        switch (activePath) {
            case '/dashboard':
                return 'Dashboard';
            case '/dashboard/restaurantstatus':
                return 'Restoran Durumu';
            case '/dashboard/stockbusiness':
                return 'Stok Yönetimi';
            case '/dashboard/menubusiness':
                return 'Menü Yönetimi';
            case '/dashboard/onlineorders':
                return 'Online Siparişler';
            default:
                return 'Dashboard';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar title={getTitle()} />
            <AnimatePresence mode="wait">
                <Outlet key={location.pathname} />
            </AnimatePresence>
        </div>
    );
};

export default Layout;
