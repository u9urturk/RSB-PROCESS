import { apiGet, setCsrfToken } from './httpClient';

export const fetchCsrfToken = async () => {
    try {
        console.log('🔒 Fetching CSRF token...');
        const tokenData = await apiGet('/auth/csrf');
        
        // Debug: Response'u logla
        console.log('🔍 CSRF Response:', tokenData);
        console.log('🔍 Token field:', tokenData?.token);
        console.log('🔍 CsrfToken field:', tokenData?.csrfToken);
        console.log('🔍 Response type:', typeof tokenData);
        console.log('🔍 Response keys:', tokenData ? Object.keys(tokenData) : 'null/undefined');
        
        // Backend csrfToken field'ı kullanıyor
        let token = null;
        if (tokenData) {
            // Backend'den gelen format: { success: true, csrfToken: "..." }
            token = tokenData.csrfToken || tokenData.token;
        }
        
        console.log('🎯 Extracted token:', token);
        
        if (token) {
            setCsrfToken(token);
            console.log('✅ CSRF token set successfully');
            return { token, ...tokenData };
        } else {
            console.warn('⚠️ No CSRF token found in response');
            return tokenData;
        }
    } catch (error) {
        console.error('❌ Failed to fetch CSRF token:', error);
        throw error;
    }
};
