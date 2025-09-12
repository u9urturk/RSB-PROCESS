// src/api/safariCsrfService.ts
import { csrfService } from './csrfService';
import { SafariStorageService } from './safariStorageService';

class SafariCSRFService {
  private isInitialized = false;
  private originalFetch: typeof window.fetch | null = null;
  private safariTokenCache: string | null = null;
  private safariTokenExpiry: number = 0;
  private readonly SAFARI_TOKEN_CACHE_DURATION = 3 * 60 * 1000; // 3 minutes (shorter for Safari)

  init(): void {
    if (this.isInitialized || typeof window === 'undefined') {
      return;
    }

    const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);

    if (!isSafari) {
      console.log('Not Safari - skipping CSRF workaround');
      return;
    }

    console.log('Safari detected - implementing enhanced CSRF workaround');

    // Store original fetch
    this.originalFetch = window.fetch;

    // Override fetch for Safari CSRF handling
    window.fetch = async (url: RequestInfo | URL, options: RequestInit = {}): Promise<Response> => {
      const method = options.method?.toUpperCase() || 'GET';
      
      // Only add CSRF token for state-changing methods
      if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
        const token = await this.getSafariCsrfToken();
        
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
          console.log('CSRF token expired in Safari, clearing cache');
          this.clearSafariCache();
          csrfService.clearCache();
        }
      }
      
      return response;
    };

    this.isInitialized = true;
  }

  // Safari-specific CSRF token method that doesn't rely on cookies
  private async getSafariCsrfToken(): Promise<string | null> {
    try {
      // Check Safari-specific cache first
      if (this.safariTokenCache && Date.now() < this.safariTokenExpiry) {
        return this.safariTokenCache;
      }

      // Check localStorage for cached token
      const storedToken = SafariStorageService.getToken();
      if (storedToken && SafariStorageService.isTokenValid()) {
        this.safariTokenCache = storedToken;
        this.safariTokenExpiry = Date.now() + this.SAFARI_TOKEN_CACHE_DURATION;
        console.log('Safari CSRF token loaded from localStorage');
        return storedToken;
      }

      // Make direct request to CSRF endpoint
      const response = await this.originalFetch!('/api/v1/auth/csrf', { 
        credentials: 'include',
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          // Safari-specific headers
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'X-Requested-With': 'XMLHttpRequest'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Safari CSRF endpoint returned ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Safari CSRF response:', data);
      
      // Get token from response - prioritize response body over cookies for Safari
      let token = data.csrfToken || data.token || data._token;
      
      // If no token in response, try alternative cookie names for Safari
      if (!token && typeof document !== 'undefined') {
        const cookieNames = [
          'csrf_header_token',
          'XSRF-TOKEN',
          '_token',
          'csrf-token',
          'X-CSRF-TOKEN'
        ];
        
        for (const cookieName of cookieNames) {
          token = document.cookie
            .split('; ')
            .find(row => row.startsWith(`${cookieName}=`))
            ?.split('=')[1];
          if (token) break;
        }
      }
      
      if (token) {
        this.safariTokenCache = token;
        this.safariTokenExpiry = Date.now() + this.SAFARI_TOKEN_CACHE_DURATION;
        
        // Save to localStorage for Safari
        SafariStorageService.saveToken(token);
        
        console.log('Safari CSRF token cached:', token.substring(0, 10) + '...');
      } else {
        console.warn('No CSRF token found in Safari response or cookies');
      }
      
      return token;
    } catch (error) {
      console.error('Safari CSRF token alınamadı:', error);
      return null;
    }
  }

  clearSafariCache(): void {
    this.safariTokenCache = null;
    this.safariTokenExpiry = 0;
    SafariStorageService.clearToken();
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
