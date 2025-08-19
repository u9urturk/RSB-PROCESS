
import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from "axios";
import type { ProfileApiSuccess, ProfileApiError } from '@/types/profile';
// Cookie-only: Authorization header / in-memory access token kaldırıldı.
// Refresh flow: 401 -> bir kez /auth/refresh dene -> başarılıysa orijinali tekrar dene.

const httpClient: AxiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1",
    timeout: 10000,
    headers: {
        "Content-Type": "application/json",
    },
        withCredentials: true, // Tüm isteklerde cookie gönderimi
});

// Request interceptor (placeholder) — şu an ekstra header yok.
httpClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => config,
    (error) => Promise.reject(error)
);

let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

// Response interceptor - token yenileme ve hata yönetimi
httpClient.interceptors.response.use(
    (response: AxiosResponse) => {
        return response;
    },
    async (error: AxiosError) => {
        const originalRequest = error.config as any;

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