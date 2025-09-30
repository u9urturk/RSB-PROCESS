// 🛡️ Input Validation Utilities
export interface ValidationResult {
    isValid: boolean;
    error?: string;
}

export const validateInput = {
    username: (value: string): ValidationResult => {
        // Trim whitespace
        const trimmed = value.trim();
        
        // Check length
        if (trimmed.length < 3 || trimmed.length > 20) {
            return { isValid: false, error: 'Kullanıcı adı 3-20 karakter arasında olmalı' };
        }
        
        // Check allowed characters (alphanumeric and underscore only)
        const usernameRegex = /^[a-zA-Z0-9_]+$/;
        if (!usernameRegex.test(trimmed)) {
            return { isValid: false, error: 'Kullanıcı adı sadece harf, rakam ve alt çizgi içerebilir' };
        }
        
        // Check for malicious patterns
        const maliciousPatterns = [
            /script/i, /javascript/i, /vbscript/i, /onload/i, /onerror/i,
            /<[^>]*>/g, // HTML tags
            /['"`;]/g // Potentially dangerous characters
        ];
        
        for (const pattern of maliciousPatterns) {
            if (pattern.test(trimmed)) {
                return { isValid: false, error: 'Geçersiz karakterler tespit edildi' };
            }
        }
        
        return { isValid: true };
    },
    
    otpCode: (value: string): ValidationResult => {
        const trimmed = value.trim();
        
        // Must be exactly 6 digits
        const otpRegex = /^\d{6}$/;
        if (!otpRegex.test(trimmed)) {
            return { isValid: false, error: 'OTP kodu tam olarak 6 haneli olmalı' };
        }
        
        return { isValid: true };
    },
    
    recoveryCode: (value: string): ValidationResult => {
        const trimmed = value.trim().toUpperCase();
        
        // Must be exactly 8 alphanumeric characters
        const recoveryRegex = /^[A-Z0-9]{8}$/;
        if (!recoveryRegex.test(trimmed)) {
            return { isValid: false, error: 'Kurtarma kodu 8 karakterli olmalı (harf ve rakam)' };
        }
        
        return { isValid: true };
    }
};

// 🛡️ Data Sanitization
export const sanitizeInput = {
    username: (value: string): string => {
        return value.trim().replace(/[^a-zA-Z0-9_]/g, '');
    },
    
    otpCode: (value: string): string => {
        return value.replace(/\D/g, '').slice(0, 6);
    },
    
    recoveryCode: (value: string): string => {
        return value.replace(/[^A-Z0-9]/g, '').slice(0, 8);
    }
};

// 🛡️ XSS Prevention
export const isValidBase64Image = (str: string): boolean => {
    const base64ImageRegex = /^data:image\/(png|jpe?g|gif|webp);base64,([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;
    return base64ImageRegex.test(str);
};
