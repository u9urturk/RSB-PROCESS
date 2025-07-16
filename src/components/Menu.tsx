import React from 'react';
import { Link } from 'react-router-dom';
import { LayoutDashboard, MenuSquare, ShoppingCart, Users, Boxes } from 'lucide-react';
import { useNavigation } from '../context/provider/NavigationProvider';
import { MenuItemType, MenuProps, NavigationContextType } from '../types';

const menuItems: MenuItemType[] = [
    { to: '/dashboard', icon: <LayoutDashboard size={22} />, label: 'Dashboard', show: true },
    { to: '/dashboard/restaurantstatus', icon: <MenuSquare size={22} />, label: 'Restoran Durumu', show: true },
    { to: '/dashboard/stockbusiness', icon: <Boxes size={22} />, label: 'Stok Yönetimi', show: true },
    { to: '/dashboard/menubusiness', icon: <MenuSquare size={22} />, label: 'Menü Yönetimi', show: true },
    { to: '/dashboard/onlineorders', icon: <ShoppingCart size={22} />, label: 'Online Siparişler', show: false },
    { to: '/dashboard/customers', icon: <Boxes size={22} />, label: 'Mutfak Yönetimi', show: false },
    { to: '/dashboard/customers', icon: <Users size={22} />, label: 'Raporlar & Analitik', show: false },
    { to: '/dashboard/customers', icon: <Users size={22} />, label: 'Kampanya Yönetimi', show: false },
    { to: '/dashboard/customers', icon: <Users size={22} />, label: 'Çalışan Yönetimi', show: false },
];

const Menu: React.FC<MenuProps> = ({ className = '' }) => {
    const { activePath } = useNavigation() as NavigationContextType;

    return (
        <div className={`
            w-full p-2 rounded-2xl
            bg-white
            shadow-lg shadow-black/5
            transform transition-all duration-200 ease-in-out
            hover:shadow-xl
            ${className}
        `}>
            <div className="flex items-center justify-around gap-1">
                {menuItems
                    .filter(item => item.show)
                    .map((item, index) => (
                        <Link
                            key={index}
                            to={item.to}
                            className={`
                                flex-1 py-2 px-1
                                flex flex-col items-center justify-center gap-1
                                text-xs font-medium
                                transition-all duration-200
                                sm:hover:bg-orange-50 sm:hover:text-orange-500
                                rounded-xl
                                ${activePath === item.to ? 'text-orange-500' : 'text-gray-500'}
                            `}
                        >
                            {item.icon}
                            <span className="text-[10px] text-center">{item.label}</span>
                        </Link>
                    ))}
            </div>
        </div>
    );
};

export default Menu;
