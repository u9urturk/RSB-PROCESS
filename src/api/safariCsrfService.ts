// src/api/safariCsrfService.ts
import { csrfService } from './csrfService';

class SafariCSRFService {
  private isInitialized = false;
  private originalFetch: typeof window.fetch | null = null;

  init(): void {
    if (this.isInitialized || typeof window === 'undefined') {
      return;
    }

    const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);

    if (!isSafari) {
      console.log('Not Safari - skipping CSRF workaround');
      return;
    }

    console.log('Safari detected - implementing CSRF workaround');

    // Store original fetch
    this.originalFetch = window.fetch;

    // Override fetch for Safari CSRF handling
    window.fetch = async (url: RequestInfo | URL, options: RequestInit = {}): Promise<Response> => {
      const method = options.method?.toUpperCase() || 'GET';
      
      // Only add CSRF token for state-changing methods
      if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
        const token = await csrfService.getCsrfToken();
        
        if (token) {
          options.headers = {
            ...options.headers,
            'X-CSRF-Token': token
          };
        }
      }
      
      // Call original fetch
      const response = await this.originalFetch!(url, options);
      
      // Clear CSRF cache on 403 (invalid token)
      if (response.status === 403) {
        const responseText = await response.clone().text();
        if (responseText.includes('CSRF') || responseText.includes('csrf')) {
          console.log('CSRF token expired, clearing cache');
          csrfService.clearCache();
        }
      }
      
      return response;
    };

    this.isInitialized = true;
  }

  destroy(): void {
    if (this.originalFetch && typeof window !== 'undefined') {
      window.fetch = this.originalFetch;
      this.originalFetch = null;
    }
    this.isInitialized = false;
  }

  isActive(): boolean {
    return this.isInitialized;
  }
}

export const safariCSRFService = new SafariCSRFService();
