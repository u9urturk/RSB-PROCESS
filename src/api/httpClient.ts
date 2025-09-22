
import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from "axios";
import type { ProfileApiSuccess, ProfileApiError } from '@/types/profile';

let getAccessToken: () => string | null = () => null;

export const setAccessTokenGetter = (getter: () => string | null): void => {
    getAccessToken = getter;
};

// Login türevi endpoint'ler - Bu endpoint'lerde access token gönderilmez
const AUTH_ENDPOINTS = [
    '/auth/login',
    '/auth/register',
    '/auth/refresh',
    '/auth/login-recovery',
    '/auth/forgot-password',
    '/auth/reset-password',
    '/auth/verify-email'
];

const httpClient: AxiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1",
    timeout: 10000,
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true,
});


httpClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const isAuthEndpoint = AUTH_ENDPOINTS.some(endpoint =>
            config.url?.includes(endpoint)
        );

        if (!isAuthEndpoint) {
            const accessToken = getAccessToken();
            if (accessToken) {
                config.headers.Authorization = `Bearer ${accessToken}`;
            }
        }

        if (['post', 'put', 'patch', 'delete'].includes(config.method?.toLowerCase() || '')) {
            console.log('🔍 Request Debug:', {
                method: config.method,
                url: config.url,
                headers: config.headers,
                hasAccessToken: !isAuthEndpoint && !!getAccessToken()
            });
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
                } else {
                    // window.location.href = '/login';
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