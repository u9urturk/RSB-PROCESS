import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/provider/AuthProvider";
import { DEV_CONFIG } from "../config/dev";

const SplashScreen: React.FC = () => {
    // 🔧 DEV MODE: Auth bypass for development
    const DEV_MODE_AUTH_BYPASS = DEV_CONFIG.AUTH_BYPASS;
    
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();

    useEffect(() => {
        const timer = setTimeout(() => {
            // Dev mode'da direkt dashboard'a git
            if (DEV_MODE_AUTH_BYPASS) {
                navigate('/dashboard');
            } else {
                navigate(isAuthenticated ? '/dashboard' : '/login');
            }
        }, DEV_CONFIG.SPLASH_DELAY);

        return () => clearTimeout(timer);
    }, [navigate, isAuthenticated]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-500 to-red-600 flex items-center
         justify-center">
            <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{
                    duration: 0.8,
                    ease: [0, 0.71, 0.2, 1.01],
                    scale: {
                        type: "spring",
                        damping: 10,
                        stiffness: 100,
                    }
                }}
                className="text-white text-center"
            >
                <h1 className="text-4xl font-bold mb-2">Trend Restoran</h1>
                <p className="text-lg opacity-90">Yönetim Paneli</p>
            </motion.div>
        </div>
    );
};

export default SplashScreen;
