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

class ErrorHandlerService {
    private static notifier: ((type: 'success' | 'error' | 'warning' | 'info', message: string) => void) | null = null;

    static registerNotifier(fn: ((type: 'success' | 'error' | 'warning' | 'info', message: string) => void) | null) {
        this.notifier = fn;
    }
    static getNotifier() {
        return this.notifier;
    }

    static extractErrorMessage(error: any): string {
        if (error?.response?.data?.message) {
            return error.response.data.message;
        }

        if (error?.response?.data && typeof error.response.data === 'string') {
            return error.response.data;
        }

        if (error?.response?.data) {
            return JSON.stringify(error.response.data);
        }

        if (error?.message) {
            return error.message;
        }

        return 'Unknown error occurred';
    }


    static getErrorDetails(error: any): ErrorResponse {
        const baseError: ErrorResponse = {
            message: this.extractErrorMessage(error),
            status: error?.response?.status,
            code: error?.code,
            data: error?.response?.data,
        };

        return baseError;
    }


    static isConflictError(error: any): boolean {
        return error?.response?.status === 409;
    }

    static isUnauthorizedError(error: any): boolean {
        return error?.response?.status === 401;
    }


    static isForbiddenError(error: any): boolean {
        return error?.response?.status === 403;
    }

    static isNotFoundError(error: any): boolean {
        return error?.response?.status === 404;
    }


    static isValidationError(error: any): boolean {
        return error?.response?.status === 422;
    }

    static isRateLimitError(error: any): boolean {
        return error?.response?.status === 429;
    }


    static isServerError(error: any): boolean {
        return error?.response?.status >= 500 && error?.response?.status < 600;
    }

    static isClientError(error: any): boolean {
        return error?.response?.status >= 400 && error?.response?.status < 500;
    }

    static isNetworkError(error: any): NetworkError {
        const isNetwork = error?.code === 'NETWORK_ERROR' ||
            error?.code === 'ECONNABORTED' ||
            !error?.response;

        return {
            isNetworkError: isNetwork,
            message: isNetwork ? 'Network connection failed' : '',
        };
    }


    static isTimeoutError(error: any): boolean {
        return error?.code === 'ECONNABORTED' ||
            error?.message?.includes('timeout');
    }


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

        return this.extractErrorMessage(error);
    }

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

function mapApiErrorToToast(error: any, context?: string) {
    const handled = ErrorHandlerService.handleError(error, context);
    const notifier = ErrorHandlerService.getNotifier?.();
    if (typeof notifier === 'function') {
        try { notifier('error', handled.userMessage); } catch (e) { /* ignore */ }
    }
    return handled;
}

export { ErrorHandlerService, mapApiErrorToToast };
export type { ErrorResponse, NetworkError, ValidationError };