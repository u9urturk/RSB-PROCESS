import httpClient from "./httpClient";

// API Response türleri
interface LoginResponse {
    status: "success" | "error";
    message: string;
    sessionId?: string;
    userId?: string;
}

interface VerifyOtpResponse {
    access_token: string;
    refresh_token: string;
    user: {
        id: string;
        phone: string;
        name?: string; // Optional - backend'den gelmeyebilir
        role?: "admin" | "user"; // Optional - backend'den gelmeyebilir
    };
}

interface VerifyOtpRequest {
    phoneNumber: string;
    otpCode: string;
    deviceId?: string;
}

// Global değişkenler - session state için
let currentPhoneNumber: string | null = null;
let currentSessionId: string | null = null;

// Telefon numarası ile OTP başlatma
export const loginWithPhone = async (phone: string): Promise<LoginResponse> => {
    const res = await httpClient.post("/auth/login", { phoneNumber: phone });
    console.log("loginWithPhone response:", res);
    
    // Session bilgilerini sakla
    currentPhoneNumber = phone;
    currentSessionId = res.data.sessionId || null;
    
    return res.data;
};

// OTP ile giriş/doğrulama
export const verifyOtpWithApi = async (otp: string): Promise<VerifyOtpResponse> => {
    if (!currentPhoneNumber) {
        throw new Error("Telefon numarası bulunamadı. Lütfen tekrar giriş yapın.");
    }

    const requestData: VerifyOtpRequest = {
        phoneNumber: currentPhoneNumber,
        otpCode: otp,
        deviceId: generateDeviceId()
    };

    // Session ID varsa ekle
    if (currentSessionId) {
        (requestData as any).sessionId = currentSessionId;
    }

    console.log("verifyOtp request:", requestData);
    
    const res = await httpClient.post("/auth/verify-login", requestData);
    console.log("verifyOtp response:", res);
    
    // Başarılı giriş sonrası session bilgilerini temizle
    currentPhoneNumber = null;
    currentSessionId = null;
    
    return res.data;
};

// Device ID üretme fonksiyonu
function generateDeviceId(): string {
    // Browser fingerprint oluştur
    const userAgent = navigator.userAgent;
    const screenRes = `${screen.width}x${screen.height}`;
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    
    const fingerprint = `${userAgent}-${screenRes}-${timezone}`;
    
    // Basit hash fonksiyonu
    let hash = 0;
    for (let i = 0; i < fingerprint.length; i++) {
        const char = fingerprint.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // 32bit integer'a dönüştür
    }
    
    return `device_${Math.abs(hash)}_${Date.now()}`;
}
