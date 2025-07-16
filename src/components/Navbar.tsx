import React, { useState } from 'react';
import { IoFastFoodOutline } from 'react-icons/io5';
import { FiBell, FiMessageSquare, FiSettings, FiMenu, FiX } from 'react-icons/fi';
import Menu from './Menu';
import { NavbarProps } from '../types';

const Navbar: React.FC<NavbarProps> = ({ 
    title = "Başlık", 
    showMobileMenu = true,
    className = ''
}) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    return (
        <div className={`w-full ${className}`}>
            <div className="
                w-full h-16
                bg-white
                border-b
                flex items-center justify-between
                px-4 sm:px-8
            ">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-orange-500 text-white flex items-center justify-center">
                        <IoFastFoodOutline size={22} />
                    </div>
                    <h1 className="font-semibold text-gray-700">{title}</h1>
                </div>

                <div className="flex items-center gap-4">
                    <div className='cursor-pointer hover:scale-125 transition-all'>
                        <FiBell size={22} />
                    </div>
                    <div className='cursor-pointer hover:scale-125 transition-all'>
                        <FiMessageSquare size={22} />
                    </div>
                    <div className='cursor-pointer hover:scale-125 transition-all'>
                        <FiSettings size={22} />
                    </div>
                    
                    {/* Menu Toggle Button */}
                    {showMobileMenu && (
                        <button 
                            onClick={toggleMenu}
                            className="cursor-pointer hover:scale-125 transition-all p-1"
                        >
                            {isMenuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
                        </button>
                    )}
                </div>
            </div>
            
            {/* Responsive Menu - Animasyonlu açılır kapanır */}
            {showMobileMenu && (
                <>
                    {/* Mobil ve Tablet: Alt orta hatta animasyonlu */}
                    <div className={`lg:hidden fixed bottom-3 left-1/2 -translate-x-1/2 z-50 w-[95vw] max-w-md transition-all duration-300 ease-in-out ${
                        isMenuOpen 
                            ? 'translate-y-0 opacity-100' 
                            : 'translate-y-16 opacity-0 pointer-events-none'
                    }`}>
                        <Menu />
                    </div>
                    
                    {/* Desktop: Navbar ortasında animasyonlu */}
                    <div className={`hidden lg:block fixed top-16 left-1/2 -translate-x-1/2 z-50 w-auto transition-all duration-300 ease-in-out ${
                        isMenuOpen 
                            ? 'translate-y-0 opacity-100' 
                            : '-translate-y-4 opacity-0 pointer-events-none'
                    }`}>
                        <Menu />
                    </div>
                    
                    {/* Overlay - Menu açıkken arka planı hafif soluklaştırır */}
                    {isMenuOpen && (
                        <div 
                            className="fixed inset-0  backdrop-blur-xs z-40 transition-all duration-300"
                            onClick={toggleMenu}
                        />
                    )}
                </>
            )}
        </div>
    );
};

export default Navbar;
