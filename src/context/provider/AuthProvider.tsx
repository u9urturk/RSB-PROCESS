import React, { useState, useCallback, useEffect, useContext, createContext } from 'react';
import { AuthContextType } from '../../types';
import { isTokenExpired } from '../../utils/tokenUtils';
import { DEV_CONFIG } from '../../config/dev';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    // 🔧 DEV MODE: Auth bypass for development
    const DEV_MODE_AUTH_BYPASS = DEV_CONFIG.AUTH_BYPASS;
    
    const [user, setUser] = useState<AuthContextType['user']>(
        DEV_MODE_AUTH_BYPASS ? DEV_CONFIG.MOCK_USER : null
    );
    const [token, setToken] = useState<string | null>(
        DEV_MODE_AUTH_BYPASS ? DEV_CONFIG.MOCK_TOKEN : null
    );
    const [loading, setLoading] = useState(false);
    const [initializing, setInitializing] = useState(!DEV_MODE_AUTH_BYPASS); // Dev mode'da hemen hazır

    // Component mount olduğunda localStorage'dan kullanıcı bilgilerini yükle
    useEffect(() => {
        // 🔧 DEV MODE: Skip localStorage check in development
        if (DEV_MODE_AUTH_BYPASS) {
            setInitializing(false);
            return;
        }
        
        const savedToken = localStorage.getItem('auth_token');
        const savedUserData = localStorage.getItem('user_data');
        
        if (savedToken && savedUserData) {
            try {
                // Token'ın süresi dolmuş mu kontrol et
                if (isTokenExpired(savedToken)) {
                    console.log('Token expired, clearing localStorage');
                    localStorage.removeItem('auth_token');
                    localStorage.removeItem('user_data');
                } else {
                    // Token geçerli, kullanıcı bilgilerini yükle
                    const userData = JSON.parse(savedUserData);
                    setUser(userData);
                    setToken(savedToken);
                    console.log('User restored from localStorage:', userData);
                }
            } catch (error) {
                console.error('Error parsing saved user data:', error);
                // Bozuk veri varsa temizle
                localStorage.removeItem('auth_token');
                localStorage.removeItem('user_data');
            }
        }
        
        // Yükleme tamamlandı
        setInitializing(false);
    }, []);

    const login = useCallback(async (phone: string) => {
        try {
            setLoading(true);
            // Bu artık useLogin hook'u tarafından hallediliyor
            console.log('Login attempt with phone:', phone);
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    }, []);

    const verifyOtp = useCallback(async (otp: string) => {
        try {
            setLoading(true);
            // Bu artık useLogin hook'u tarafından hallediliyor
            console.log('OTP verification with:', otp);
        } catch (error) {
            console.error('OTP error:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    }, []);

    // Manuel kullanıcı setleme - useLogin hook'u tarafından çağrılacak
    const setUserData = useCallback((userData: any, authToken: string) => {
        // Backend'den role bilgisi gelmiyorsa varsayılan olarak 'user' ata
        const userWithRole = {
            ...userData,
            role: (userData.role as 'user' | 'admin') || 'user' // Type assertion ile düzelt
        };
        
        setUser(userWithRole);
        setToken(authToken);
        localStorage.setItem('auth_token', authToken);
        localStorage.setItem('user_data', JSON.stringify(userWithRole));
        console.log('User data set in AuthContext:', userWithRole);
    }, []);

    const logout = useCallback(() => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
        console.log('User logged out');
    }, []);

    const value: AuthContextType = {
        user,
        token,
        loading,
        initializing,
        login,
        verifyOtp,
        setUserData,
        logout,
        isAuthenticated: !!user && !!token
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
