
// Error Types
interface ErrorResponse {
    message: string;
    code?: string;
    status?: number;
    data?: any;
}

interface NetworkError {
    isNetworkError: boolean;
    message: string;
}

interface ValidationError {
    field: string;
    message: string;
}

// Global Error Handler Service (Single Responsibility Principle)
class ErrorHandlerService {
    /**
     * Extract error message from various error types
     * @param error - Error object from API call
     * @returns Formatted error message
     */
    static extractErrorMessage(error: any): string {
        // Axios error response structure
        if (error?.response?.data?.message) {
            return error.response.data.message;
        }

        // Axios error with data as string
        if (error?.response?.data && typeof error.response.data === 'string') {
            return error.response.data;
        }

        // Axios error with data as object
        if (error?.response?.data) {
            return JSON.stringify(error.response.data);
        }

        // Network or other errors
        if (error?.message) {
            return error.message;
        }

        // Fallback error message
        return 'Unknown error occurred';
    }

    /**
     * Get detailed error information
     * @param error - Error object
     * @returns Detailed error response
     */
    static getErrorDetails(error: any): ErrorResponse {
        const baseError: ErrorResponse = {
            message: this.extractErrorMessage(error),
            status: error?.response?.status,
            code: error?.code,
            data: error?.response?.data,
        };

        return baseError;
    }

    /**
     * Check if error is a conflict error (409)
     * @param error - Error object
     * @returns true if conflict error
     */
    static isConflictError(error: any): boolean {
        return error?.response?.status === 409;
    }

    /**
     * Check if error is unauthorized (401)
     * @param error - Error object
     * @returns true if unauthorized error
     */
    static isUnauthorizedError(error: any): boolean {
        return error?.response?.status === 401;
    }

    /**
     * Check if error is forbidden (403)
     * @param error - Error object
     * @returns true if forbidden error
     */
    static isForbiddenError(error: any): boolean {
        return error?.response?.status === 403;
    }

    /**
     * Check if error is not found (404)
     * @param error - Error object
     * @returns true if not found error
     */
    static isNotFoundError(error: any): boolean {
        return error?.response?.status === 404;
    }

    /**
     * Check if error is a validation error (422)
     * @param error - Error object
     * @returns true if validation error
     */
    static isValidationError(error: any): boolean {
        return error?.response?.status === 422;
    }

    /**
     * Check if error is rate limit error (429)
     * @param error - Error object
     * @returns true if rate limit error
     */
    static isRateLimitError(error: any): boolean {
        return error?.response?.status === 429;
    }

    /**
     * Check if error is a server error (5xx)
     * @param error - Error object
     * @returns true if server error
     */
    static isServerError(error: any): boolean {
        return error?.response?.status >= 500 && error?.response?.status < 600;
    }

    /**
     * Check if error is a client error (4xx)
     * @param error - Error object
     * @returns true if client error
     */
    static isClientError(error: any): boolean {
        return error?.response?.status >= 400 && error?.response?.status < 500;
    }

    /**
     * Check if error is a network error
     * @param error - Error object
     * @returns NetworkError object
     */
    static isNetworkError(error: any): NetworkError {
        const isNetwork = error?.code === 'NETWORK_ERROR' ||
            error?.code === 'ECONNABORTED' ||
            !error?.response;

        return {
            isNetworkError: isNetwork,
            message: isNetwork ? 'Network connection failed' : '',
        };
    }

    /**
     * Check if error is a timeout error
     * @param error - Error object
     * @returns true if timeout error
     */
    static isTimeoutError(error: any): boolean {
        return error?.code === 'ECONNABORTED' ||
            error?.message?.includes('timeout');
    }

    /**
     * Get validation errors from response
     * @param error - Error object
     * @returns Array of validation errors
     */
    static getValidationErrors(error: any): ValidationError[] {
        if (!this.isValidationError(error)) {
            return [];
        }

        const errors = error?.response?.data?.errors || {};
        const validationErrors: ValidationError[] = [];

        Object.keys(errors).forEach(field => {
            const fieldErrors = Array.isArray(errors[field]) ? errors[field] : [errors[field]];
            fieldErrors.forEach((message: string) => {
                validationErrors.push({ field, message });
            });
        });

        return validationErrors;
    }

    /**
     * Get user-friendly error message based on error type
     * @param error - Error object
     * @returns User-friendly error message
     */
    static getUserFriendlyMessage(error: any): string {
        const networkError = this.isNetworkError(error);
        if (networkError.isNetworkError) {
            return 'İnternet bağlantınızı kontrol edin ve tekrar deneyin.';
        }

        if (this.isTimeoutError(error)) {
            return 'İstek zaman aşımına uğradı. Lütfen tekrar deneyin.';
        }

        if (this.isUnauthorizedError(error)) {
            return 'Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.';
        }

        if (this.isForbiddenError(error)) {
            return 'Bu işlemi gerçekleştirmek için yetkiniz bulunmuyor.';
        }

        if (this.isNotFoundError(error)) {
            return 'Aradığınız kaynak bulunamadı.';
        }

        if (this.isConflictError(error)) {
            return 'Bu işlem çakışma nedeniyle gerçekleştirilemedi.';
        }

        if (this.isValidationError(error)) {
            const validationErrors = this.getValidationErrors(error);
            if (validationErrors.length > 0) {
                return validationErrors.map(err => `${err.field}: ${err.message}`).join(', ');
            }
            return 'Gönderilen veriler geçersiz.';
        }

        if (this.isRateLimitError(error)) {
            return 'Çok fazla istek gönderdiniz. Lütfen bir süre bekleyin.';
        }

        if (this.isServerError(error)) {
            return 'Sunucu hatası oluştu. Lütfen daha sonra tekrar deneyin.';
        }

        // Fallback to extracted message
        return this.extractErrorMessage(error);
    }

    /**
     * Log error with context
     * @param error - Error object
     * @param context - Additional context
     */
    static logError(error: any, context?: string): void {
        const errorDetails = this.getErrorDetails(error);
        const logContext = context ? `[${context}]` : '';

        console.error(`${logContext} API Error:`, {
            message: errorDetails.message,
            status: errorDetails.status,
            code: errorDetails.code,
            url: error?.config?.url,
            method: error?.config?.method,
            data: errorDetails.data,
        });
    }

    /**
     * Handle error and return appropriate response
     * @param error - Error object
     * @param context - Context for logging
     * @returns Processed error with user-friendly message
     */
    static handleError(error: any, context?: string): {
        message: string;
        userMessage: string;
        status?: number;
        isRetryable: boolean;
    } {
        this.logError(error, context);

        const networkError = this.isNetworkError(error);
        const isRetryable = networkError.isNetworkError ||
            this.isTimeoutError(error) ||
            this.isServerError(error);

        return {
            message: this.extractErrorMessage(error),
            userMessage: this.getUserFriendlyMessage(error),
            status: error?.response?.status,
            isRetryable,
        };
    }
}

export { ErrorHandlerService };
export type { ErrorResponse, NetworkError, ValidationError };