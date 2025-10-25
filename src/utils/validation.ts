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
    },

    // StockType validations
    stockTypeName: (value: string): ValidationResult => {
        const trimmed = value.trim();
        
        if (trimmed.length < 2 || trimmed.length > 50) {
            return { isValid: false, error: 'Stok türü adı 2-50 karakter arasında olmalıdır' };
        }

        // Check for HTML/script injection
        const maliciousPatterns = [/<[^>]*>/g, /script/i, /javascript/i];
        for (const pattern of maliciousPatterns) {
            if (pattern.test(trimmed)) {
                return { isValid: false, error: 'Geçersiz karakterler tespit edildi' };
            }
        }

        return { isValid: true };
    },

    stockTypeDescription: (value: string): ValidationResult => {
        if (!value) return { isValid: true }; // Optional field

        const trimmed = value.trim();
        
        if (trimmed.length < 10 || trimmed.length > 500) {
            return { isValid: false, error: 'Açıklama 10-500 karakter arasında olmalıdır' };
        }

        // Check for HTML/script injection
        const maliciousPatterns = [/<[^>]*>/g, /script/i, /javascript/i];
        for (const pattern of maliciousPatterns) {
            if (pattern.test(trimmed)) {
                return { isValid: false, error: 'Geçersiz karakterler tespit edildi' };
            }
        }

        return { isValid: true };
    },

    stockTypeColor: (value: string): ValidationResult => {
        if (!value) return { isValid: true }; // Optional field

        const trimmed = value.trim();
        
        // Tailwind gradient format validation
        const gradientPattern = /^from-\w+-\d{3} to-\w+-\d{3}$/;
        if (!gradientPattern.test(trimmed)) {
            return { isValid: false, error: 'Renk formatı "from-color-500 to-color-600" şeklinde olmalıdır' };
        }

        return { isValid: true };
    },

    stockTypeIcon: (value: string): ValidationResult => {
        if (!value) return { isValid: true }; // Optional field

        const trimmed = value.trim();
        
        if (trimmed.length < 1 || trimmed.length > 2) {
            return { isValid: false, error: 'Icon 1-2 karakter (emoji) olmalıdır' };
        }

        return { isValid: true };
    },

    stockTypeExamples: (value: string[]): ValidationResult => {
        if (!value || value.length === 0) return { isValid: true }; // Optional field

        if (value.length < 1) {
            return { isValid: false, error: 'En az bir örnek ürün eklemelisiniz' };
        }

        for (const example of value) {
            const trimmed = example.trim();
            if (trimmed.length < 2 || trimmed.length > 50) {
                return { isValid: false, error: 'Her örnek ürün 2-50 karakter arasında olmalıdır' };
            }
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
    },

    stockTypeName: (value: string): string => {
        return value.trim();
    },

    stockTypeDescription: (value: string): string => {
        return value.trim();
    }
};

// 🛡️ StockType Validation
export interface StockTypeData {
    name: string;
    description?: string;
    color?: string;
    icon?: string;
    examples?: string[];
}

export const validateStockType = (data: StockTypeData): ValidationResult => {
    // Validate name (required)
    const nameValidation = validateInput.stockTypeName(data.name);
    if (!nameValidation.isValid) {
        return nameValidation;
    }

    // Validate description (optional)
    if (data.description) {
        const descValidation = validateInput.stockTypeDescription(data.description);
        if (!descValidation.isValid) {
            return descValidation;
        }
    }

    // Validate color (optional)
    if (data.color) {
        const colorValidation = validateInput.stockTypeColor(data.color);
        if (!colorValidation.isValid) {
            return colorValidation;
        }
    }

    // Validate icon (optional)
    if (data.icon) {
        const iconValidation = validateInput.stockTypeIcon(data.icon);
        if (!iconValidation.isValid) {
            return iconValidation;
        }
    }

    // Validate examples (optional)
    if (data.examples) {
        const examplesValidation = validateInput.stockTypeExamples(data.examples);
        if (!examplesValidation.isValid) {
            return examplesValidation;
        }
    }

    return { isValid: true };
};

// 🛡️ XSS Prevention
export const isValidBase64Image = (str: string): boolean => {
    const base64ImageRegex = /^data:image\/(png|jpe?g|gif|webp);base64,([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;
    return base64ImageRegex.test(str);
};
