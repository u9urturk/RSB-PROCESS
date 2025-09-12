// src/utils/safariDebug.ts
// Safari debugging utilities

export class SafariDebugger {
  static logCookies(): void {
    if (typeof document === 'undefined') return;
    
    console.log('=== Safari Cookie Debug ===');
    console.log('All cookies:', document.cookie);
    
    const cookies = document.cookie.split('; ');
    cookies.forEach(cookie => {
      const [name, value] = cookie.split('=');
      console.log(`Cookie: ${name} = ${value}`);
    });
    
    console.log('=== End Cookie Debug ===');
  }

  static logUserAgent(): void {
    if (typeof navigator === 'undefined') return;
    
    console.log('=== Safari User Agent Debug ===');
    console.log('User Agent:', navigator.userAgent);
    console.log('Is Safari:', /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent));
    console.log('=== End User Agent Debug ===');
  }

  static logLocalStorage(): void {
    if (typeof localStorage === 'undefined') return;
    
    console.log('=== Safari LocalStorage Debug ===');
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        console.log(`LocalStorage: ${key} = ${localStorage.getItem(key)}`);
      }
    }
    console.log('=== End LocalStorage Debug ===');
  }

  static logSessionStorage(): void {
    if (typeof sessionStorage === 'undefined') return;
    
    console.log('=== Safari SessionStorage Debug ===');
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key) {
        console.log(`SessionStorage: ${key} = ${sessionStorage.getItem(key)}`);
      }
    }
    console.log('=== End SessionStorage Debug ===');
  }

  static async testCsrfEndpoint(): Promise<void> {
    try {
      console.log('=== Safari CSRF Endpoint Test ===');
      
      const response = await fetch('/api/v1/auth/csrf', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', [...response.headers.entries()]);
      
      const data = await response.json();
      console.log('Response data:', data);
      
      // Check cookies after request
      this.logCookies();
      
      console.log('=== End CSRF Endpoint Test ===');
    } catch (error) {
      console.error('CSRF endpoint test failed:', error);
    }
  }

  static debugAll(): void {
    this.logUserAgent();
    this.logCookies();
    this.logLocalStorage();
    this.logSessionStorage();
    this.testCsrfEndpoint();
  }
}

// Auto-debug in Safari when in development
if (typeof window !== 'undefined' && 
    /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent) &&
    import.meta.env.DEV) {
  console.log('Safari detected in development mode - enabling debug utilities');
  console.log('Use SafariDebugger.debugAll() to run full debug');
  (window as any).SafariDebugger = SafariDebugger;
}
