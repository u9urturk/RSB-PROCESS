import React, { useState, createContext, useContext } from 'react';
import { NavigationContextType } from '../../types';

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const useNavigation = () => {
    const context = useContext(NavigationContext);
    if (!context) {
        throw new Error('useNavigation must be used within a NavigationProvider');
    }
    return context;
};

interface NavigationProviderProps {
    children: React.ReactNode;
}

export const NavigationProvider: React.FC<NavigationProviderProps> = ({ children }) => {
    const [activePath, setActivePath] = useState<string>('');
    const [previousPath, setPreviousPath] = useState<string>('');

    const value: NavigationContextType = {
        activePath,
        setActivePath,
        previousPath,
        setPreviousPath
    };

    return (
        <NavigationContext.Provider value={value}>
            {children}
        </NavigationContext.Provider>
    );
};
