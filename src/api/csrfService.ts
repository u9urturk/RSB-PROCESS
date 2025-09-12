// src/api/csrfService.ts
import { apiGet } from './httpClient';

export const fetchCsrfToken = async () => await apiGet('/auth/csrf');

// Safari CSRF token management
class CSRFService {
  private cachedToken: string | null = null;
  private tokenExpiry: number = 0;
  private readonly TOKEN_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  async getCsrfToken(): Promise<string | null> {
    try {
      // Check cache first
      if (this.cachedToken && Date.now() < this.tokenExpiry) {
        return this.cachedToken;
      }

      // Fetch new token
      const response = await fetch('/api/v1/auth/csrf', { 
        credentials: 'include',
        method: 'GET'
      });
      
      if (!response.ok) {
        throw new Error(`CSRF endpoint returned ${response.status}`);
      }
      
      const data = await response.json();
      
      // Get token from response
      let token = data.csrfToken;
      
      // Fallback: try to get from cookie (non-httpOnly)
      if (!token) {
        token = document.cookie
          .split('; ')
          .find(row => row.startsWith('csrf_header_token='))
          ?.split('=')[1];
      }
      
      if (token) {
        this.cachedToken = token;
        this.tokenExpiry = Date.now() + this.TOKEN_CACHE_DURATION;
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
