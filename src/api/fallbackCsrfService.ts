// src/api/fallbackCsrfService.ts
// Fallback CSRF service when main CSRF endpoint fails

export class FallbackCSRFService {
  private static readonly FALLBACK_TOKEN_KEY = 'fallback_csrf_token';

  // Generate a client-side temporary token as absolute fallback
  static generateFallbackToken(): string {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substr(2, 9);
    const fallbackToken = `fallback_${timestamp}_${random}`;
    
    // Store in localStorage for consistency
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(this.FALLBACK_TOKEN_KEY, fallbackToken);
    }
    
    console.warn('Generated fallback CSRF token:', fallbackToken);
    return fallbackToken;
  }

  static getFallbackToken(): string | null {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem(this.FALLBACK_TOKEN_KEY);
    }
    return null;
  }

  static clearFallbackToken(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(this.FALLBACK_TOKEN_KEY);
    }
  }

  // Try to extract token from any possible source
  static extractTokenFromAnywhere(): string | null {
    // 1. Try meta tags (if backend sets them)
    if (typeof document !== 'undefined') {
      const metaToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
      if (metaToken) {
        console.log('Found CSRF token in meta tag');
        return metaToken;
      }

      // 2. Try data attributes on body/html
      const bodyToken = document.body?.dataset?.csrfToken;
      if (bodyToken) {
        console.log('Found CSRF token in body data attribute');
        return bodyToken;
      }

      // 3. Try window globals (if backend sets them)
      const windowToken = (window as any).csrfToken || (window as any).CSRF_TOKEN;
      if (windowToken) {
        console.log('Found CSRF token in window global');
        return windowToken;
      }
    }

    // 4. Return existing fallback token
    const fallbackToken = this.getFallbackToken();
    if (fallbackToken) {
      console.log('Using existing fallback token');
      return fallbackToken;
    }

    // 5. Generate new fallback token
    return this.generateFallbackToken();
  }
}

export default FallbackCSRFService;
