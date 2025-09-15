
import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from "axios";
import type { ProfileApiSuccess, ProfileApiError } from '@/types/profile';

const httpClient: AxiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1",
    timeout: 10000,
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true,
});

// CSRF Token storage
let csrfToken: string | null = null;
const STORAGE_KEY = 'rsb_csrf_token';

// Function to get CSRF token from storage
const getCsrfToken = (): string | null => {
    if (csrfToken) return csrfToken;
    
    if (typeof window !== 'undefined') {
        try {
            const token = sessionStorage.getItem(STORAGE_KEY);
            if (token) {
                csrfToken = token; // Cache in memory
                return token;
            }
        } catch (error) {
            console.warn('Failed to retrieve CSRF token from sessionStorage:', error);
        }
    }
    return null;
};

// Function to set CSRF token
export const setCsrfToken = (token: string) => {
    csrfToken = token;
    
    if (typeof window !== 'undefined') {
        try {
            sessionStorage.setItem(STORAGE_KEY, token);
            console.log('🔒 CSRF Token stored:', {
                tokenPreview: `${token.substring(0, 8)}...`,
                storage: 'sessionStorage (plain text)'
            });
        } catch (error) {
            console.warn('Failed to store CSRF token in sessionStorage:', error);
        }
    }
};

// Function to clear CSRF token
export const clearCsrfToken = () => {
    csrfToken = null;
    if (typeof window !== 'undefined') {
        try {
            sessionStorage.removeItem(STORAGE_KEY);
        } catch (error) {
            console.warn('Failed to clear CSRF token from sessionStorage:', error);
        }
    }
};

// Function to detect Safari
const isSafari = (): boolean => {
    if (typeof window === 'undefined') return false;
    const userAgent = window.navigator.userAgent;
    return /^((?!chrome|android).)*safari/i.test(userAgent);
};

httpClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        if (['post', 'put', 'patch', 'delete'].includes(config.method?.toLowerCase() || '')) {
            const token = getCsrfToken();
            const safari = isSafari();
            
            console.log('🔍 Request Debug:', {
                method: config.method,
                url: config.url,
                isSafari: safari,
                csrfToken: token ? `${token.substring(0, 8)}...` : 'null',
                headers: config.headers
            });
            
            if (token) {
                config.headers['X-CSRF-Token'] = token;
                
                // Safari özel handling
                if (safari) {
                    console.log('🦎 Safari detected - CSRF handling');
                    // Safari için ek header'lar eklenebilir
                    config.headers['X-Requested-With'] = 'XMLHttpRequest';
                }
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

httpClient.interceptors.response.use(
    (response: AxiosResponse) => {
        return response;
    },

    async (error: AxiosError) => {
        const originalRequest = error.config as any;

        if (error.response?.status === 401 && originalRequest) {
            if (originalRequest._retry) {
                return Promise.reject(error);
            }
            if (originalRequest.url?.includes('/auth/login') || originalRequest.url?.includes('/auth/register') || originalRequest.url?.includes('/auth/login-recovery')) {
                return Promise.reject(error);
            }
            try {
                if (!isRefreshing) {
                    isRefreshing = true;
                    refreshPromise = (async () => {
                        try {
                            const resp = await httpClient.post('/auth/refresh', undefined, { withCredentials: true });
                            const payload = resp.data as ProfileApiSuccess<any> | ProfileApiError;
                            if ((payload as ProfileApiError).success === false) {
                                return false;
                            }
                            return true;
                        } catch {
                            return false;
                        }
                    })();
                }
                const ok = await refreshPromise;
                if (ok) {
                    originalRequest._retry = true;
                    return httpClient(originalRequest);
                }
            } finally {
                isRefreshing = false;
                refreshPromise = null;
            }
        }

        if (error.response?.status === 429) {
            console.error('Rate limit exceeded:', error.response?.data);
        }

        if (error.response?.status === 409) {
            console.log('Conflict detected:', (error.response?.data as any)?.message);
        }

        if (error.response?.status === 500) {
            console.error('Server error:', error.response?.data);
        }

        if (error.response) {
            const errorMessage = (error.response.data as any)?.message || error.message;
            console.error('API Error:', errorMessage);
        } else if (error.request) {
            console.error('Network Error:', error.message);
        } else {
            console.error('Error:', error.message);
        }

        return Promise.reject(error);
    }
);

export default httpClient;


export async function apiGet<T = any>(url: string, config?: any): Promise<T> {
    const response = await httpClient.get<ProfileApiSuccess<T>>(url, config);
    
    // Debug CSRF endpoint
    if (url.includes('/auth/csrf')) {
        console.log('🔍 Raw CSRF Response:', response);
        console.log('🔍 Response data:', response.data);
        console.log('🔍 Response status:', response.status);
    }
    
    const payload = response.data as unknown as ProfileApiSuccess<T> | ProfileApiError;
    
    // CSRF endpoint özel durumu - direct response dönüyor
    if (url.includes('/auth/csrf')) {
        console.log('🔧 CSRF Special handling - returning direct response');
        return response.data as T;
    }
    
    if ((payload as ProfileApiError).success === false) {
        throw payload as ProfileApiError;
    }
    return (payload as ProfileApiSuccess<T>).data;
}

export async function apiPost<T = any>(url: string, body?: any, config?: any): Promise<T> {
    const response = await httpClient.post<ProfileApiSuccess<T>>(url, body, config);
    const payload = response.data as unknown as ProfileApiSuccess<T> | ProfileApiError;
    if ((payload as ProfileApiError).success === false) {
        throw payload as ProfileApiError;
    }
    return (payload as ProfileApiSuccess<T>).data;
}

export async function apiPut<T = any>(url: string, body?: any, config?: any): Promise<T> {
    const response = await httpClient.put<ProfileApiSuccess<T>>(url, body, config);
    const payload = response.data as unknown as ProfileApiSuccess<T> | ProfileApiError;
    if ((payload as ProfileApiError).success === false) {
        throw payload as ProfileApiError;
    }
    return (payload as ProfileApiSuccess<T>).data;
}

export async function apiDelete<T = any>(url: string, config?: any): Promise<T> {
    const response = await httpClient.delete<ProfileApiSuccess<T>>(url, config);
    const payload = response.data as unknown as ProfileApiSuccess<T> | ProfileApiError;
    if ((payload as ProfileApiError).success === false) {
        throw payload as ProfileApiError;
    }
    return (payload as ProfileApiSuccess<T>).data;
}


export async function apiPatch<T = any>(url: string, body?: any, config?: any): Promise<T> {
    const response = await httpClient.patch<ProfileApiSuccess<T>>(url, body, config);
    const payload = response.data as unknown as ProfileApiSuccess<T> | ProfileApiError;
    if ((payload as ProfileApiError).success === false) {
        throw payload as ProfileApiError;
    }
    return (payload as ProfileApiSuccess<T>).data;
}