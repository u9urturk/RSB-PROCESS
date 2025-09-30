import { createContext, useContext } from 'react';
import { 
    NavigationContextType, 
    NotificationContextType, 
    RestaurantContextType 
} from '../types';

export const NavigationContext = createContext<NavigationContextType | undefined>(undefined);
export const NotificationContext = createContext<NotificationContextType | undefined>(undefined);
export const RestaurantContext = createContext<RestaurantContextType | undefined>(undefined);

export const useRestaurant = () => {
    const context = useContext(RestaurantContext);
    if (!context) {
        throw new Error('useRestaurant must be used within a RestaurantProvider');
    }
    return context;
};
