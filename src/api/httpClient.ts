
import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from "axios";
import type { ProfileApiSuccess, ProfileApiError } from '@/types/profile';
import { csrfService } from './csrfService';
import { safariCSRFService } from './safariCsrfService';

const httpClient: AxiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1",
    timeout: 10000,
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true,
});

// Safari detection for enhanced cookie handling
const isSafari = typeof window !== 'undefined' && 
  /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);

// Safari-specific configuration
if (isSafari) {
    console.log('Safari detected - applying enhanced cookie configuration');
    
    // Set default headers for Safari (remove problematic headers)
    httpClient.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
}

httpClient.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
        // Add CSRF token for state-changing methods
        if (config.method && ['post', 'put', 'delete', 'patch'].includes(config.method.toLowerCase())) {
            try {
                let token: string | null = null;
                
                // Use Safari-specific CSRF service for Safari
                if (isSafari) {
                    token = await safariCSRFService.getSafariCsrfToken();
                } else {
                    token = await csrfService.getCsrfToken();
                }
                
                if (token) {
                    config.headers['X-CSRF-Token'] = token;
                    console.log('CSRF token added to request');
                } else {
                    console.warn('No CSRF token available, proceeding without token');
                    // Don't fail the request, let backend handle missing token
                }
            } catch (error) {
                console.warn('Could not get CSRF token, proceeding without token:', error);
                // Don't fail the request, let backend handle missing token
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

        // 403 CSRF Token error handling
        if (error.response?.status === 403) {
            const errorMessage = (error.response.data as any)?.message || '';
            if (errorMessage.includes('CSRF') || errorMessage.includes('csrf')) {
                console.log('CSRF token error detected, clearing cache and retrying...');
                csrfService.clearCache();
                
                // Retry the request once with new token
                if (!originalRequest._csrfRetry) {
                    originalRequest._csrfRetry = true;
                    try {
                        const newToken = await csrfService.getCsrfToken();
                        if (newToken) {
                            originalRequest.headers['X-CSRF-Token'] = newToken;
                            return httpClient(originalRequest);
                        }
                    } catch (tokenError) {
                        console.error('Failed to get new CSRF token:', tokenError);
                    }
                }
            }
        }

        // 401 Unauthorized handling (cookie-only)
        if (error.response?.status === 401 && originalRequest) {
            if (originalRequest._retry) {
                // İkinci kez 401 -> login
                if (typeof window !== 'undefined') window.location.href = '/login';
                return Promise.reject(error);
            }
            // Auth endpoints için refresh deneme
            if (originalRequest.url?.includes('/auth/login') || originalRequest.url?.includes('/auth/register') || originalRequest.url?.includes('/auth/login-recovery')) {
                if (typeof window !== 'undefined') window.location.href = '/login';
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
                if (typeof window !== 'undefined') window.location.href = '/login';
            } finally {
                isRefreshing = false;
                refreshPromise = null;
            }
        }

        // 429 Too Many Requests (Rate limiting)
        if (error.response?.status === 429) {
            console.error('Rate limit exceeded:', error.response?.data);
        }

        // 409 Conflict (Kullanıcı zaten var)
        if (error.response?.status === 409) {
            console.log('Conflict detected:', (error.response?.data as any)?.message);
        }

        // 500 Internal Server Error
        if (error.response?.status === 500) {
            console.error('Server error:', error.response?.data);
        }

        // Diğer hatalar için genel hata yönetimi
        if (error.response) {
            // Sunucudan gelen hata mesajını göster
            const errorMessage = (error.response.data as any)?.message || error.message;
            console.error('API Error:', errorMessage);
        } else if (error.request) {
            // İstek yapıldı ama cevap alınamadı
            console.error('Network Error:', error.message);
        } else {
            // İstek oluşturulurken hata oluştu
            console.error('Error:', error.message);
        }

        return Promise.reject(error);
    }
);

export default httpClient;

// Generic helpers that unwrap backend ApiSuccess<T> wrapper
export async function apiGet<T = any>(url: string, config?: any): Promise<T> {
    const response = await httpClient.get<ProfileApiSuccess<T>>(url, config);
    const payload = response.data as unknown as ProfileApiSuccess<T> | ProfileApiError;
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