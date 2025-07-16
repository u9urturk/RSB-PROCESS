// 🔧 DEVELOPMENT CONFIGURATION
// Auth bypass'ı kontrol etmek için merkezi konfigürasyon

export const DEV_CONFIG = {
    // Auth bypass - geliştirme aşamasında true, production'da false
    AUTH_BYPASS: true,
    
    // Dev mode'da kullanılacak mock user
    MOCK_USER: {
        id: 'dev-user-001',
        phone: '1234567890',
        name: 'Dev User',
        role: 'admin' as const
    },
    
    // Dev mode'da kullanılacak mock token
    MOCK_TOKEN: 'dev-token-mock-2024',
    
    // Splash screen delay (ms)
    SPLASH_DELAY: 1000, // Dev mode'da daha hızlı
};

// Production'a geçerken bu değerleri değiştirin:
// AUTH_BYPASS: false
// SPLASH_DELAY: 2000
