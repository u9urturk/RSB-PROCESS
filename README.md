# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

## 🔧 Development Mode - Auth Bypass

**Geliştirme aşamasında auth sistemi geçici olarak devre dışı bırakılmıştır.**

### Nasıl çalışır:
- `src/config/dev.ts` dosyasında `AUTH_BYPASS: true` ayarı ile auth kontrolü bypass edilir
- Uygulama direkt dashboard'a yönlendirilir
- Mock user bilgileri otomatik olarak set edilir

### Production'a geçiş:
`src/config/dev.ts` dosyasında şu değişiklikleri yapın:
```typescript
export const DEV_CONFIG = {
    AUTH_BYPASS: false, // true'dan false'a çevir
    SPLASH_DELAY: 2000, // Normal splash delay
};
```

### Etkilenen dosyalar:
- `src/context/provider/AuthProvider.tsx` - Mock user ve token
- `src/utils/routeUtils.tsx` - PrivateRoute bypass
- `src/pages/Login.tsx` - Login sayfası bypass
- `src/pages/SplashScreen.tsx` - Direkt dashboard yönlendirmesi

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript and enable type-aware lint rules. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
