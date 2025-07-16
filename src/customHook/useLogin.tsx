import { useState } from "react";
import { loginWithPhone, verifyOtpWithApi } from "../api/authApi.ts";
import { useAuth } from "../context/provider/AuthProvider";

interface UseLoginReturn {
    login: (phone: string) => Promise<void>;
    verifyOtp: (otp: string) => Promise<any>;
    loading: boolean;
    error: string | null;
}

export function useLogin(): UseLoginReturn {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const auth = useAuth();

    const login = async (phone: string) => {
        setLoading(true);
        setError(null);

        try {
            await loginWithPhone(phone);
        } catch (err) {
            const error = err as { response?: { data?: { message?: string } } };
            setError(error.response?.data?.message || "Bir hata oluştu");
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const verifyOtp = async (otp: string) => {
        setLoading(true);
        setError(null);

        try {
            const result = await verifyOtpWithApi(otp);
            console.log("OTP verification successful:", result);
            
            // AuthContext'e kullanıcı bilgilerini kaydet
            if (result.access_token) {
                // User objesini oluştur - backend'den gelmiyorsa varsayılan değerler
                const userObj = {
                    id: result.user?.id || 'default_user',
                    phone: result.user?.phone || 'unknown',
                    name: result.user?.name || 'unknown',
                    role: result.user?.role
                };
                
                auth.setUserData(userObj, result.access_token);
            }
            
            return result;
        } catch (err: any) {
            console.error("OTP verification failed:", err);
            
            let errorMessage = "OTP doğrulama hatası";
            
            if (err.response?.status === 400) {
                errorMessage = err.response?.data?.message || "Geçersiz OTP kodu";
            } else if (err.response?.status === 404) {
                errorMessage = "Oturum bulunamadı. Lütfen tekrar giriş yapın.";
            } else if (err.response?.status === 429) {
                errorMessage = "Çok fazla deneme. Lütfen daha sonra tekrar deneyin.";
            } else if (err.message) {
                errorMessage = err.message;
            }
            
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return { login, verifyOtp, loading, error };
}
