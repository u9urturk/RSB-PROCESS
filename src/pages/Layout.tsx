import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Navbar from '../components/Navbar';
import { useNavigation } from '../context/provider/NavigationProvider';
import { useProfile } from '../context/provider/ProfileProvider';

interface LayoutProps {
    children?: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = () => {
    const location = useLocation();
    const { activePath } = useNavigation();
    const { profile } = useProfile();

    // Kullanıcı tercihlerine göre <html> class’larını güncelle
    React.useEffect(() => {
        const html = document.documentElement;
        const theme = (profile as any)?.theme ?? (profile as any)?.preferences?.theme;
        const density = (profile as any)?.density ?? (profile as any)?.preferences?.density;
        // Tema
        if (theme === 'dark') {
            html.classList.add('dark');
        } else {
            html.classList.remove('dark');
        }
        // Yoğunluk
        if (density === 'compact') {
            html.classList.add('compact');
        } else {
            html.classList.remove('compact');
        }
    }, [profile]);

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
