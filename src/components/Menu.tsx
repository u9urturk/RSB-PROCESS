import React from 'react';
import { Link } from 'react-router-dom';
import { LayoutDashboard, MenuSquare, Boxes, ChefHat, BarChart3, Megaphone, UserCog, ShoppingCart } from 'lucide-react';
import { useNavigation } from '../context/provider/NavigationProvider';
import { MenuItemType, MenuProps, NavigationContextType } from '../types';

const menuItems: MenuItemType[] = [
    { 
        to: '/dashboard', 
        icon: <LayoutDashboard size={20} />, 
        label: 'Dashboard', 
        show: true,
        color: 'from-blue-500 to-blue-600'
    },
    { 
        to: '/dashboard/restaurantstatus', 
        icon: <MenuSquare size={20} />, 
        label: 'Restoran', 
        show: true,
        color: 'from-orange-500 to-red-500'
    },
    { 
        to: '/dashboard/stockbusiness', 
        icon: <Boxes size={20} />, 
        label: 'Stok', 
        show: true,
        color: 'from-green-500 to-emerald-500'
    },
    { 
        to: '/dashboard/menubusiness', 
        icon: <ChefHat size={20} />, 
        label: 'Menü', 
        show: true,
        color: 'from-purple-500 to-violet-500'
    },
    { 
        to: '/dashboard/onlineorders', 
        icon: <ShoppingCart size={20} />, 
        label: 'Siparişler', 
        show: false,
        color: 'from-yellow-500 to-orange-500'
    },
    { 
        to: '/dashboard/kitchen', 
        icon: <ChefHat size={20} />, 
        label: 'Mutfak', 
        show: false,
        color: 'from-red-500 to-pink-500'
    },
    { 
        to: '/dashboard/reports', 
        icon: <BarChart3 size={20} />, 
        label: 'Raporlar', 
        show: false,
        color: 'from-indigo-500 to-blue-500'
    },
    { 
        to: '/dashboard/campaigns', 
        icon: <Megaphone size={20} />, 
        label: 'Kampanya', 
        show: false,
        color: 'from-pink-500 to-rose-500'
    },
    { 
        to: '/dashboard/staff', 
        icon: <UserCog size={20} />, 
        label: 'Çalışanlar', 
        show: false,
        color: 'from-gray-500 to-slate-500'
    },
];

const Menu: React.FC<MenuProps> = ({ className = '' }) => {
    const { activePath } = useNavigation() as NavigationContextType;
    const visibleItems = menuItems.filter(item => item.show);

    return (
        <div className={`menu
            w-full p-3 rounded-2xl
            bg-white/95 backdrop-blur-lg
            shadow-2xl shadow-black/10
            border border-gray-100/50
            transform transition-all duration-500 ease-out
            hover:shadow-3xl hover:shadow-orange-500/10
            group
            ${className}
        `}>
            {/* Menu Content - Bu kısım yukarı kayacak */}
            <div className="
                flex items-center justify-around gap-2
                transform transition-transform duration-300 ease-out
                group-hover:-translate-y-1
            ">
                {visibleItems.map((item, index) => {
                    const isActive = activePath === item.to;
                    
                    return (
                        <Link
                            key={index}
                            to={item.to}
                            className={`
                                flex-1 py-3 px-2
                                flex flex-col items-center justify-center gap-2
                                text-xs font-medium
                                rounded-xl
                                transition-all duration-300 ease-out
                                group/item relative overflow-hidden
                                ${isActive 
                                    ? 'text-white scale-105' 
                                    : 'text-gray-600 hover:text-white hover:scale-105'
                                }
                            `}
                            style={{
                                animationDelay: `${index * 50}ms`
                            }}
                        >
                            {/* Active/Hover Background */}
                            <div className={`
                                absolute inset-0 rounded-xl
                                bg-gradient-to-br ${item.color || 'from-orange-500 to-red-500'}
                                transition-all duration-300 ease-out
                                ${isActive 
                                    ? 'opacity-100 scale-100' 
                                    : 'opacity-0 scale-95 group-hover/item:opacity-100 group-hover/item:scale-100'
                                }
                            `} />
                            
                            {/* Subtle hover background for non-active items */}
                            <div className={`
                                absolute inset-0 rounded-xl
                                bg-gray-100
                                transition-all duration-300 ease-out
                                ${!isActive ? 'opacity-0 group-hover/item:opacity-100' : 'opacity-0'}
                            `} />
                            
                            {/* Icon */}
                            <div className={`
                                relative z-10 
                                transition-all duration-300 ease-out
                                ${isActive 
                                    ? 'transform scale-110' 
                                    : 'group-hover/item:scale-110'
                                }
                            `}>
                                {item.icon}
                            </div>
                            
                            {/* Label */}
                            <span className={`
                                relative z-10 text-[10px] text-center font-semibold
                                transition-all duration-300 ease-out
                                ${isActive 
                                    ? 'opacity-100' 
                                    : 'opacity-80 group-hover/item:opacity-100'
                                }
                            `}>
                                {item.label}
                            </span>
                            
                            {/* Active indicator */}
                            {isActive && (
                                <div className="
                                    absolute -top-1 left-1/2 -translate-x-1/2
                                    w-2 h-2 rounded-full
                                    bg-white shadow-lg
                                    animate-pulse
                                " />
                            )}
                        </Link>
                    );
                })}
            </div>
        </div>
    );
};

export default Menu;
