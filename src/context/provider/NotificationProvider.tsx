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

    // New showNotification supports countdown and onComplete
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
                            px-4 py-2 rounded-lg shadow-lg text-white flex items-center
                            ${countdownNotification.type === 'success' ? 'bg-green-500' :
                              countdownNotification.type === 'error' ? 'bg-red-500' :
                              countdownNotification.type === 'warning' ? 'bg-yellow-500' :
                              'bg-blue-500'}
                        `}
                    >
                        <span>{countdownNotification.message}</span>
                        {typeof countdownNotification.countdown === 'number' && typeof remaining === 'number' && remaining > 0 && (
                            <span className="ml-2 font-bold">{remaining}</span>
                        )}
                        {typeof countdownNotification.countdown === 'number' && remaining === 0 && (
                            <span className="ml-2 font-bold">0</span>
                        )}
                    </div>
                ) : (
                    notifications.map(notification => (
                        <div
                            key={notification.id}
                            className={`
                                px-4 py-2 rounded-lg shadow-lg text-white
                                ${notification.type === 'success' ? 'bg-green-500' :
                                  notification.type === 'error' ? 'bg-red-500' :
                                  notification.type === 'warning' ? 'bg-yellow-500' :
                                  'bg-blue-500'}
                            `}
                        >
                            {notification.message}
                        </div>
                    ))
                )}
            </div>
        </NotificationContext.Provider>
    );
};
