import React, { useState, useCallback, createContext, useContext } from 'react';
import { NotificationContextType } from '../../types';
import { v4 as uuidv4 } from 'uuid';

interface Notification {
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
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

    const showNotification = useCallback((
        type: 'success' | 'error' | 'warning' | 'info',
        message: string
    ) => {
        const id = uuidv4();
        setNotifications(prev => [...prev, { id, type, message }]);

        // Auto-hide after 3 seconds
        setTimeout(() => {
            hideNotification(id);
        }, 3000);
    }, []);

    const hideNotification = useCallback((id: string) => {
        setNotifications(prev => prev.filter(notification => notification.id !== id));
    }, []);

    const value: NotificationContextType = {
        notifications,
        showNotification,
        hideNotification
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
            {/* Notification UI Component */}
            <div className="fixed bottom-4 right-4 z-50 space-y-2">
                {notifications.map(notification => (
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
                ))}
            </div>
        </NotificationContext.Provider>
    );
};
