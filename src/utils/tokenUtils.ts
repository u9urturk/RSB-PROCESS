// Token utility fonksiyonları

interface JWTPayload {
    exp: number;
    iat: number;
    [key: string]: any;
}

/**
 * JWT token'ı decode eder (imza doğrulaması yapmaz)
 */
export const decodeToken = (token: string): JWTPayload | null => {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) {
            return null;
        }

        const payload = parts[1];
        const decoded = atob(payload);
        return JSON.parse(decoded);
    } catch (error) {
        console.error('Token decode error:', error);
        return null;
    }
};

/**
 * Token'ın süresi dolmuş mu kontrol eder
 */
export const isTokenExpired = (token: string): boolean => {
    if (!token) return true;
    
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const expiry = payload.exp * 1000; // saniyeden milisaniyeye çevir
        return Date.now() > expiry;
    } catch (e) {
        console.error('Error parsing token:', e);
        return true;
    }
};

/**
 * Token'ın süresi dolacak mı kontrol eder (varsayılan 5 dakika)
 */
export const isTokenExpiring = (token: string, bufferMinutes: number = 5): boolean => {
    const payload = decodeToken(token);
    if (!payload || !payload.exp) {
        return true;
    }

    const currentTime = Math.floor(Date.now() / 1000);
    const bufferTime = bufferMinutes * 60;
    return payload.exp < (currentTime + bufferTime);
};

/**
 * Token'dan kullanıcı bilgilerini alır
 */
export const getUserFromToken = (token: string): any => {
    const payload = decodeToken(token);
    return payload;
};
