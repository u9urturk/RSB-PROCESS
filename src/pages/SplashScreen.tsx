import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/provider/AuthProvider";

const SplashScreen: React.FC = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const [progress, setProgress] = useState(0);
    const [currentMessage, setCurrentMessage] = useState("Sistem başlatılıyor...");

    // Loading messages
    const loadingMessages = [
        "Sistem başlatılıyor...",
        "Bileşenler yükleniyor...",
        "Kullanıcı oturumu kontrol ediliyor...",
        "Hazırlanıyor..."
    ];

    useEffect(() => {
        // Progress animation
        const progressInterval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(progressInterval);
                    return 100;
                }
                return prev + 2;
            });
        }, 60);

        // Message rotation
        const messageInterval = setInterval(() => {
            setCurrentMessage(prev => {
                const currentIndex = loadingMessages.indexOf(prev);
                const nextIndex = (currentIndex + 1) % loadingMessages.length;
                return loadingMessages[nextIndex];
            });
        }, 750);

        // Navigation timer
        const navigationTimer = setTimeout(() => {
            if (isAuthenticated) {
                navigate('/dashboard', { replace: true });
            } else {
                navigate('/login', { replace: true });
            }
        }, 5000);

        return () => {
            clearInterval(progressInterval);
            clearInterval(messageInterval);
            clearTimeout(navigationTimer);
        };
    }, [navigate, isAuthenticated]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-500 via-red-500 to-red-600 flex items-center justify-center relative overflow-hidden">
            {/* Animated Background Grid */}
            <motion.div
                className="absolute inset-0 opacity-5"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 0.05 }}
                transition={{ duration: 2 }}
            >
                <div className="grid grid-cols-8 grid-rows-8 w-full h-full gap-4 p-8">
                    {[...Array(64)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="bg-white rounded-lg"
                            initial={{ scale: 0, rotate: 0 }}
                            animate={{ scale: 1, rotate: 360 }}
                            transition={{
                                delay: i * 0.02,
                                duration: 2,
                                repeat: Infinity,
                                repeatDelay: 5
                            }}
                        />
                    ))}
                </div>
            </motion.div>

            {/* Main Content Container */}
            <motion.div
                initial={{ scale: 0.5, opacity: 0, y: 50 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{
                    duration: 0.8,
                    ease: [0, 0.71, 0.2, 1.01],
                    scale: {
                        type: "spring",
                        damping: 10,
                        stiffness: 100,
                    }
                }}
                className="text-white text-center z-10 max-w-md mx-auto px-6"
            >
                {/* Company Logo */}
                <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{
                        delay: 0.3,
                        duration: 0.8,
                        ease: "backOut"
                    }}
                    className="mb-8"
                >
                    <div className="w-24 h-24 mx-auto bg-white/10 rounded-full flex items-center justify-center backdrop-blur-lg border border-white/20 shadow-2xl">
                        <motion.div
                            animate={{ rotate: [0, 10, -10, 0] }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                        >
                            🍽️
                        </motion.div>
                    </div>
                </motion.div>

                {/* Company Name */}
                <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                    className="text-6xl font-bold mb-4 tracking-tight bg-gradient-to-r from-white to-orange-100 bg-clip-text text-transparent"
                >
                    Trend Restoran
                </motion.h1>

                {/* Subtitle */}
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7, duration: 0.6 }}
                    className="text-xl opacity-90 mb-12 font-light tracking-wide"
                >
                    Yönetim Paneli
                </motion.p>

                {/* Loading Section */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1, duration: 0.5 }}
                    className="space-y-6"
                >
                    {/* Loading Spinner */}
                    <div className="relative flex justify-center">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: "linear"
                            }}
                            className="w-12 h-12 border-3 border-white/20 border-t-white rounded-full"
                        />
                    </div>

                    {/* Dynamic Loading Message */}
                    <AnimatePresence mode="wait">
                        <motion.p
                            key={currentMessage}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3 }}
                            className="text-sm font-medium tracking-wide"
                        >
                            {currentMessage}
                        </motion.p>
                    </AnimatePresence>

                    {/* Progress Bar */}
                    <div className="w-full max-w-xs mx-auto">
                        <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
                            <motion.div
                                className="h-full bg-gradient-to-r from-white to-orange-200 rounded-full"
                                initial={{ width: "0%" }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 0.1 }}
                            />
                        </div>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1.5 }}
                            className="text-xs text-white/60 mt-2 text-center"
                        >
                            {progress}%
                        </motion.p>
                    </div>
                </motion.div>
            </motion.div>

            {/* Version Info */}
            <motion.div
                className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-center text-white/40 text-xs"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2, duration: 0.5 }}
            >
                <p>Versiyon {import.meta.env.APP_VERSION} ({import.meta.env.GIT_SHA}) | © 2025 Trend Restoran</p>
            </motion.div>
        </div>
    );
};

export default SplashScreen;