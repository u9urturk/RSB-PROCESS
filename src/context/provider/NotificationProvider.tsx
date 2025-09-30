import React, { useState, useCallback, createContext, useContext, useEffect } from 'react';
import { NotificationContextType } from '../../types';
import { v4 as uuidv4 } from 'uuid';

interface Notification {
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    countdown?: number;
    remaining?: number;
    onComplete?: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
};

interface NotificationProviderProps {
    children: React.ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {

    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [countdownNotification, setCountdownNotification] = useState<Notification | null>(null);
    const [remaining, setRemaining] = useState<number | undefined>(undefined);

    const showNotification = useCallback((
        type: 'success' | 'error' | 'warning' | 'info',
        message: string,
        options?: { countdown?: number; onComplete?: () => void; }
    ) => {
        if (options?.countdown) {
            const id = uuidv4();
            setCountdownNotification({ id, type, message, countdown: options.countdown, onComplete: options.onComplete });
            setRemaining(options.countdown);
        } else {
            const id = uuidv4();
            setNotifications(prev => [...prev, { id, type, message }]);
            setTimeout(() => {
                hideNotification(id);
            }, 3000);
        }
    }, []);

    const hideNotification = useCallback((id: string) => {
        setNotifications(prev => prev.filter(notification => notification.id !== id));
        if (countdownNotification && countdownNotification.id === id) {
            setCountdownNotification(null);
            setRemaining(undefined);
        }
    }, [countdownNotification]);

    const value: NotificationContextType = {
        notifications: countdownNotification
            ? [{ ...countdownNotification, remaining: remaining }]
            : notifications,
        showNotification,
        hideNotification
    };
    useEffect(() => {
        // Lazy register notifier with ErrorHandlerService to map errors to toast
        try {
            const { ErrorHandlerService } = require('../../utils/ErrorHandlerService');
            if (ErrorHandlerService && typeof ErrorHandlerService.registerNotifier === 'function') {
                ErrorHandlerService.registerNotifier(showNotification);
            }
        } catch (e) {
            // ignore
        }
        return () => {
            try {
                const { ErrorHandlerService } = require('../../utils/ErrorHandlerService');
                if (ErrorHandlerService && typeof ErrorHandlerService.registerNotifier === 'function') {
                    ErrorHandlerService.registerNotifier(null);
                }
            } catch (e) {
                // ignore
            }
        };
    }, [showNotification]);

    // Countdown effect
    useEffect(() => {
        if (countdownNotification && typeof countdownNotification.countdown === 'number' && typeof remaining === 'number') {
            if (remaining > 0) {
                const interval = setInterval(() => {
                    setRemaining(r => (typeof r === 'number' ? r - 1 : undefined));
                }, 1000);
                return () => clearInterval(interval);
            } else if (remaining === 0) {
                // Countdown finished
                if (countdownNotification.onComplete) {
                    countdownNotification.onComplete();
                }
                setTimeout(() => {
                    hideNotification(countdownNotification.id);
                }, 500);
            }
        }
    }, [countdownNotification, remaining, hideNotification]);

    return (
        <NotificationContext.Provider value={value}>
            {children}
            {/* Notification UI Component */}
            <div className="fixed bottom-4 right-4 z-50 space-y-2">
                {countdownNotification ? (
                    <div
                        key={countdownNotification.id}
                        className={`
                            px-6 py-4 rounded-lg shadow-2xl text-white flex items-center justify-between min-w-80
                            transition-all duration-300 transform hover:scale-105 relative overflow-hidden
                            ${countdownNotification.type === 'success' ? 'bg-green-500' :
                              countdownNotification.type === 'error' ? 'bg-red-500' :
                              countdownNotification.type === 'warning' ? 'bg-yellow-500' :
                              'bg-blue-500'}
                        `}
                    >
                        {/* Loading Progress Bar */}
                        {typeof countdownNotification.countdown === 'number' && typeof remaining === 'number' && (
                            <div 
                                className="absolute inset-0 transition-all duration-1000 ease-linear"
                                style={{
                                    background: `linear-gradient(90deg, 
                                        ${countdownNotification.type === 'success' ? 'rgba(34, 197, 94, 0.8)' :
                                          countdownNotification.type === 'error' ? 'rgba(239, 68, 68, 0.8)' :
                                          countdownNotification.type === 'warning' ? 'rgba(245, 158, 11, 0.8)' :
                                          'rgba(59, 130, 246, 0.8)'} 
                                        ${(remaining / countdownNotification.countdown) * 100}%, 
                                        ${countdownNotification.type === 'success' ? 'rgba(22, 163, 74, 0.3)' :
                                          countdownNotification.type === 'error' ? 'rgba(220, 38, 38, 0.3)' :
                                          countdownNotification.type === 'warning' ? 'rgba(217, 119, 6, 0.3)' :
                                          'rgba(37, 99, 235, 0.3)'} 
                                        ${(remaining / countdownNotification.countdown) * 100}%)`,
                                }}
                            />
                        )}
                        
                        {/* Content */}
                        <div className="flex items-center relative z-10">
                            <span className="text-2xl mr-3">
                                {countdownNotification.type === 'success' ? '✅' :
                                 countdownNotification.type === 'error' ? '❌' :
                                 countdownNotification.type === 'warning' ? '⚠️' :
                                 'ℹ️'}
                            </span>
                            <span className="font-medium">{countdownNotification.message}</span>
                        </div>
                        
                        {/* Countdown Circle */}
                        {typeof countdownNotification.countdown === 'number' && typeof remaining === 'number' && remaining > 0 && (
                            <div className="flex items-center ml-4 relative z-10">
                                <div className="bg-white text-orange-500 bg-opacity-20 rounded-full w-12 h-12 flex items-center justify-center relative">
                                    {/* Circular Progress */}
                                    <svg className="absolute inset-0 w-12 h-12 -rotate-90" viewBox="0 0 48 48">
                                        <circle
                                            cx="24"
                                            cy="24"
                                            r="20"
                                            fill="none"
                                            stroke="rgba(255,255,255,0.2)"
                                            strokeWidth="3"
                                        />
                                        <circle
                                            cx="24"
                                            cy="24"
                                            r="20"
                                            fill="none"
                                            stroke="rgba(255,255,255,0.8)"
                                            strokeWidth="3"
                                            strokeLinecap="round"
                                            strokeDasharray={`${2 * Math.PI * 20}`}
                                            strokeDashoffset={`${2 * Math.PI * 20 * (1 - (remaining / countdownNotification.countdown))}`}
                                            className="transition-all duration-1000 ease-linear"
                                        />
                                    </svg>
                                    <span className="font-bold text-lg relative z-10">{remaining}</span>
                                </div>
                            </div>
                        )}
                        
                        {/* Final state */}
                        {typeof countdownNotification.countdown === 'number' && remaining === 0 && (
                            <div className="flex items-center text-orange-500 ml-4 relative z-10">
                                <div className="bg-white bg-opacity-20 rounded-full w-12 h-12 flex items-center justify-center animate-pulse">
                                    <span className="font-bold text-lg">✓</span>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    notifications.map(notification => (
                        <div
                            key={notification.id}
                            className={`
                                px-6 py-4 rounded-lg shadow-lg text-white flex items-center
                                transition-all duration-300 transform hover:scale-105 min-w-80
                                ${notification.type === 'success' ? 'bg-green-500' :
                                  notification.type === 'error' ? 'bg-red-500' :
                                  notification.type === 'warning' ? 'bg-yellow-500' :
                                  'bg-blue-500'}
                            `}
                        >
                            <span className="text-2xl mr-3">
                                {notification.type === 'success' ? '✅' :
                                 notification.type === 'error' ? '❌' :
                                 notification.type === 'warning' ? '⚠️' :
                                 'ℹ️'}
                            </span>
                            <span className="font-medium">{notification.message}</span>
                        </div>
                    ))
                )}
            </div>
        </NotificationContext.Provider>
    );
};
