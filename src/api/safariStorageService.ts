// src/api/safariStorageService.ts
// Safari-specific storage-based CSRF token management

export class SafariStorageService {
  private static readonly CSRF_TOKEN_KEY = 'safari_csrf_token';
  private static readonly CSRF_EXPIRY_KEY = 'safari_csrf_expiry';
  private static readonly TOKEN_DURATION = 5 * 60 * 1000; // 5 minutes

  static saveToken(token: string): void {
    if (typeof localStorage === 'undefined') return;
    
    try {
      const expiry = Date.now() + this.TOKEN_DURATION;
      localStorage.setItem(this.CSRF_TOKEN_KEY, token);
      localStorage.setItem(this.CSRF_EXPIRY_KEY, expiry.toString());
      console.log('Safari CSRF token saved to localStorage');
    } catch (error) {
      console.error('Failed to save Safari CSRF token to localStorage:', error);
    }
  }

  static getToken(): string | null {
    if (typeof localStorage === 'undefined') return null;
    
    try {
      const token = localStorage.getItem(this.CSRF_TOKEN_KEY);
      const expiryStr = localStorage.getItem(this.CSRF_EXPIRY_KEY);
      
      if (!token || !expiryStr) return null;
      
      const expiry = parseInt(expiryStr, 10);
      if (Date.now() > expiry) {
        this.clearToken();
        return null;
      }
      
      return token;
    } catch (error) {
      console.error('Failed to get Safari CSRF token from localStorage:', error);
      return null;
    }
  }

  static clearToken(): void {
    if (typeof localStorage === 'undefined') return;
    
    try {
      localStorage.removeItem(this.CSRF_TOKEN_KEY);
      localStorage.removeItem(this.CSRF_EXPIRY_KEY);
      console.log('Safari CSRF token cleared from localStorage');
    } catch (error) {
      console.error('Failed to clear Safari CSRF token from localStorage:', error);
    }
  }

  static isTokenValid(): boolean {
    if (typeof localStorage === 'undefined') return false;
    
    try {
      const expiryStr = localStorage.getItem(this.CSRF_EXPIRY_KEY);
      if (!expiryStr) return false;
      
      const expiry = parseInt(expiryStr, 10);
      return Date.now() < expiry;
    } catch (error) {
      return false;
    }
  }
}

export default SafariStorageService;
