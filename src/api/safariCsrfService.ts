// src/api/safariCsrfService.ts
import { csrfService } from './csrfService';
import { SafariStorageService } from './safariStorageService';

class SafariCSRFService {
  private isInitialized = false;
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
    this.isInitialized = true;
  }

  // Safari-specific CSRF token method that doesn't rely on cookies
  async getSafariCsrfToken(): Promise<string | null> {
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

      // Make direct request to CSRF endpoint using XMLHttpRequest to avoid fetch override
      const token = await this.fetchTokenWithXHR();
      
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

  private async fetchTokenWithXHR(): Promise<string | null> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', '/api/v1/auth/csrf', true);
      xhr.withCredentials = true;
      xhr.setRequestHeader('Accept', 'application/json');
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
      
      xhr.onload = function() {
        if (xhr.status === 200) {
          try {
            const data = JSON.parse(xhr.responseText);
            console.log('Safari CSRF XHR response:', data);
            
            // Get token from response
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
            
            resolve(token);
          } catch (error) {
            console.error('Failed to parse CSRF response:', error);
            resolve(null);
          }
        } else {
          console.error(`Safari CSRF XHR failed with status ${xhr.status}`);
          resolve(null);
        }
      };
      
      xhr.onerror = function() {
        console.error('Safari CSRF XHR network error');
        resolve(null);
      };
      
      xhr.send();
    });
  }

  clearSafariCache(): void {
    this.safariTokenCache = null;
    this.safariTokenExpiry = 0;
    SafariStorageService.clearToken();
  }

  destroy(): void {
    this.isInitialized = false;
  }

  isActive(): boolean {
    return this.isInitialized;
  }
}

export const safariCSRFService = new SafariCSRFService();
