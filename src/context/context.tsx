import { createContext } from 'react';
import { 
    NavigationContextType, 
    AuthContextType, 
    NotificationContextType, 
    RestaurantContextType 
} from '../types';

export const NavigationContext = createContext<NavigationContextType | undefined>(undefined);
export const AuthContext = createContext<AuthContextType | undefined>(undefined);
export const NotificationContext = createContext<NotificationContextType | undefined>(undefined);
export const RestaurantContext = createContext<RestaurantContextType | undefined>(undefined);
