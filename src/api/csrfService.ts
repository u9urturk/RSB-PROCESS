// src/api/csrfService.ts
import { apiGet } from './httpClient';

export const fetchCsrfToken = async () => await apiGet('/auth/csrf');

// Safari CSRF token management
class CSRFService {
  private cachedToken: string | null = null;
  private tokenExpiry: number = 0;
  private readonly TOKEN_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  private readonly isSafari = typeof window !== 'undefined' && 
    /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);

  async getCsrfToken(): Promise<string | null> {
    try {
      // Check cache first
      if (this.cachedToken && Date.now() < this.tokenExpiry) {
        return this.cachedToken;
      }

      // Fetch new token with Safari-specific configuration
      const fetchOptions: RequestInit = { 
        credentials: 'include',
        method: 'GET'
      };

      // Add Safari-specific headers
      if (this.isSafari) {
        fetchOptions.headers = {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          // Force Safari to include cookies
          'X-Requested-With': 'XMLHttpRequest'
        };
      }

      const response = await fetch('/api/v1/auth/csrf', fetchOptions);
      
      if (!response.ok) {
        throw new Error(`CSRF endpoint returned ${response.status}`);
      }
      
      const data = await response.json();
      console.log('CSRF response data:', data);
      
      // Get token from response - prioritize response body
      let token = data.csrfToken || data.token || data._token;
      
      // Fallback: try multiple cookie names
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
          if (token) {
            console.log(`Token found in cookie: ${cookieName}`);
            break;
          }
        }
      }

      // Safari-specific: also check localStorage as fallback
      if (!token && this.isSafari && typeof localStorage !== 'undefined') {
        token = localStorage.getItem('csrf_token');
        if (token) {
          console.log('Token found in localStorage (Safari fallback)');
        }
      }
      
      if (token) {
        this.cachedToken = token;
        this.tokenExpiry = Date.now() + this.TOKEN_CACHE_DURATION;
        console.log(`CSRF token cached: ${token.substring(0, 10)}...`);
      } else {
        console.warn('No CSRF token found in response, cookies, or localStorage');
      }
      
      return token;
    } catch (error) {
      console.error('CSRF token alınamadı:', error);
      return null;
    }
  }

  clearCache(): void {
    this.cachedToken = null;
    this.tokenExpiry = 0;
  }
}

export const csrfService = new CSRFService();
