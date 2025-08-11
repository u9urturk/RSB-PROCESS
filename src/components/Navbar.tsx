import React, { useState, useEffect } from 'react';
import { IoFastFoodOutline } from 'react-icons/io5';
import { FiBell, FiMessageSquare, FiSettings, FiMenu, FiX } from 'react-icons/fi';
import Menu from './Menu';
import { NavbarProps } from '../types';
import { useAuth } from '../context/provider/AuthProvider';

const Navbar: React.FC<NavbarProps> = ({ 
    title = "Başlık", 
    showMobileMenu = true,
    className = ''
}) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const { logout } = useAuth();

    // Scroll efekti için
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    // Menu dışına tıklandığında kapat
    const closeMenu = () => {
        setIsMenuOpen(false);
    };

    return (
        <div className={`w-full ${className} sticky top-0 z-50`}>
            {/* Navbar */}
            <div className={`
                w-full h-16
                bg-white/95 backdrop-blur-md
                border-b border-gray-100
                flex items-center justify-between
                px-4 sm:px-6 lg:px-8
                transition-all duration-300 ease-out
                ${isScrolled 
                    ? 'shadow-lg shadow-orange-500/5 border-orange-100/50' 
                    : 'shadow-sm'
                }
            `}>
                {/* Logo & Title */}
                <div className="flex items-center gap-3 group">
                    <div className="
                        w-10 h-10 rounded-xl 
                        bg-gradient-to-br from-orange-500 to-red-500 
                        text-white flex items-center justify-center
                        shadow-lg shadow-orange-500/25
                        transition-all duration-300 ease-out
                        group-hover:scale-105 group-hover:shadow-xl group-hover:shadow-orange-500/30
                        relative overflow-hidden
                    ">
                        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <IoFastFoodOutline size={22} className="relative z-10" />
                    </div>
                    <h1 className="
                        font-bold text-gray-800 text-lg
                        transition-colors duration-300
                        group-hover:text-orange-600
                    ">
                        {title}
                    </h1>
                </div>

                {/* Action Icons */}
                <div className="flex items-center gap-2">
                    {/* Notification */}
                    <button className="
                        relative p-2.5 rounded-xl
                        text-gray-600 hover:text-orange-500
                        hover:bg-orange-50
                        transition-all duration-300 ease-out
                        group
                    ">
                        <FiBell size={20} className="transition-transform duration-300 group-hover:scale-110" />
                        <div className="
                            absolute -top-1 -right-1 w-3 h-3
                            bg-red-500 rounded-full
                            border-2 border-white
                            animate-pulse
                        " />
                    </button>

                    {/* Messages */}
                    <button className="
                        relative p-2.5 rounded-xl
                        text-gray-600 hover:text-orange-500
                        hover:bg-orange-50
                        transition-all duration-300 ease-out
                        group
                    ">
                        <FiMessageSquare size={20} className="transition-transform duration-300 group-hover:scale-110" />
                        <div className="
                            absolute -top-1 -right-1 w-3 h-3
                            bg-green-500 rounded-full
                            border-2 border-white
                        " />
                    </button>

                    {/* Settings/Logout */}
                    <button 
                        onClick={logout}
                        className="
                            p-2.5 rounded-xl
                            text-gray-600 hover:text-red-500
                            hover:bg-red-50
                            transition-all duration-300 ease-out
                            group
                        "
                    >
                        <FiSettings size={20} className="transition-transform duration-300 group-hover:rotate-90" />
                    </button>
                    
                    {/* Menu Toggle */}
                    {showMobileMenu && (
                        <button 
                            onClick={toggleMenu}
                            className={`
                                p-2.5 rounded-xl
                                transition-all duration-300 ease-out
                                group relative overflow-hidden
                                ${isMenuOpen 
                                    ? 'text-white bg-orange-500 shadow-lg shadow-orange-500/25' 
                                    : 'text-gray-600 hover:text-orange-500 hover:bg-orange-50'
                                }
                            `}
                        >
                            <div className={`
                                transition-all duration-300 ease-out
                                ${isMenuOpen ? 'rotate-180 scale-110' : 'rotate-0 scale-100'}
                            `}>
                                {isMenuOpen ? <FiX size={20} /> : <FiMenu size={20} />}
                            </div>
                        </button>
                    )}
                </div>
            </div>
            
            {/* Responsive Menu */}
            {showMobileMenu && (
                <>
                    {/* Mobile & Tablet: Bottom Center */}
                    <div className={`
                        lg:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-50
                        w-[95vw] max-w-md
                        transition-all duration-500 ease-out
                        ${isMenuOpen 
                            ? 'translate-y-0 opacity-100 scale-100' 
                            : 'translate-y-8 opacity-0 scale-95 pointer-events-none'
                        }
                    `}>
                        <Menu />
                    </div>
                    
                    {/* Desktop: Below Navbar Center */}
                    <div className={`
                        hidden lg:block fixed top-20 left-1/2 -translate-x-1/2 z-50
                        w-auto
                        transition-all duration-500 ease-out
                        ${isMenuOpen 
                            ? 'translate-y-0 opacity-100 scale-100' 
                            : '-translate-y-4 opacity-0 scale-95 pointer-events-none'
                        }
                    `}>
                        <Menu />
                    </div>
                    
                    {/* Enhanced Backdrop Overlay */}
                    {isMenuOpen && (
                        <div 
                            className="
                                fixed inset-0 z-40
                                bg-black/20 backdrop-blur-sm
                                transition-all 
                            "
                            onClick={closeMenu}
                            style={{
                                background: 'linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(75,85,99,0.3))'
                            }}
                        />
                    )}
                </>
            )}
        </div>
    );
};

export default Navbar;
