// 🔧 DEVELOPMENT CONFIGURATION
// Auth bypass'ı kontrol etmek için merkezi konfigürasyon

export const DEV_CONFIG = {
    // Auth bypass - geliştirme aşamasında true, production'da false
    AUTH_BYPASS: false,
    MOCK_USER: {
        userId: 1,
        username: 'dev_admin',
        roles: ['ADMIN', 'USER', 'MANAGER'],
        permissions: ['READ', 'WRITE', 'DELETE', 'MANAGE_USERS', 'MANAGE_MENU', 'MANAGE_ORDERS'],
        email: 'admin@restaurant.com',
        phone: '+90 555 123 4567',
        fullName: 'Development Admin',
        firstName: 'Development',
        lastName: 'Admin',
        isActive: true,
        restaurantId: 1,
        restaurantName: 'Dev Restaurant',
        lastLoginAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        preferences: {
            theme: 'light' as const,
            language: 'tr',
            timezone: 'Europe/Istanbul',
            notifications: true
        }
    },
    MOCK_TOKEN: 'dev_mock_token_2024',

    // Splash screen delay (ms)
    SPLASH_DELAY: 2000, // Production delay
};

// Production'a geçerken bu değerleri değiştirin:
// AUTH_BYPASS: false
// SPLASH_DELAY: 2000
