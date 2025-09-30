# 🍽️ Restaurant Management System (RMS)

## 🆕 Recent Updates

- All API services are now modular and type-safe (auth, profile, role, activity)
- New generic HTTP helpers: apiGet, apiPost, apiPut, apiPatch, apiDelete
- Role management: dynamic role list, update/remove role via API
- User activity logs: paginated, context-managed, with new service
- Modernized UI: uniform card sizes, glassmorphism InfoBalloon, improved modals
- Centralized error handling and JWT utilities
- SOLID & Clean Code: all modules refactored for single responsibility

A comprehensive restaurant management system built with modern web technologies, featuring real-time table management, order processing, inventory tracking, barcode scanning, and staff coordination.

![Version](https://img.shields.io/badge/Version-1.2.0-purple.svg)
![React](https://img.shields.io/badge/React-19.0.0-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue.svg)
![Electron](https://img.shields.io/badge/Electron-34.3.0-brightgreen.svg)
![Vite](https://img.shields.io/badge/Vite-6.2.0-orange.svg)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4.0.9-38bdf8.svg)

---

## 🚀 Features

### 🏪 Restaurant Status Management
- **Real-time Table Management**: Monitor table occupancy, capacity, and status
- **Waiter Assignment**: Assign waiters to tables and track their performance
- **Order Tracking**: Real-time order status updates (pending, preparing, ready, delivered)
- **Table Transfer**: Seamlessly transfer orders between tables
- **Payment Processing**: Handle cash and card payments with detailed receipts

### 🍔 Menu Management
- **Dynamic Menu System**: Add, edit, and remove menu items
- **Category Management**: Organize menu items by categories
- **Pricing Control**: Flexible pricing system with special offers
- **Availability Tracking**: Track item availability in real-time

### 📦 Inventory Management
- **Stock Tracking**: Monitor inventory levels with low-stock alerts
- **Barcode Scanner**: Integrated barcode scanning for quick item identification
    - **Barcode Search**: Scan barcode to search for products
    - **Auto-Add Modal**: If barcode not found, opens add-stock modal with barcode pre-filled
    - **Bip Sound**: Successful scan triggers a bip sound for user feedback
- **Supplier Management**: Track suppliers and purchase orders
- **Automatic Reordering**: Set minimum stock levels for automatic reorder alerts

### 📊 Analytics & Reporting
- **Sales Analytics**: Comprehensive sales reports and charts
- **Performance Metrics**: Track waiter performance and table turnover
- **Revenue Tracking**: Real-time revenue monitoring
- **Customer Insights**: Analyze customer behavior and preferences

---

## 🛠️ Tech Stack

### Frontend
- **React 19.0.0**: Latest React with concurrent features
- **TypeScript 5.8.3**: Type-safe development
- **Vite 6.2.0**: Lightning-fast build tool
- **Tailwind CSS 4.0.9**: Utility-first CSS framework (custom keyframes & transitions used, no external animation lib in core dashboards)

### Desktop Application
- **Electron 34.3.0**: Cross-platform desktop application
- **Node.js Integration**: Native desktop capabilities

### UI Components & Icons
- **Lucide React 0.479.0**: Modern icon library
- **React Icons 5.5.0**: Comprehensive icon set
- **Recharts 2.15.1**: Data visualization library

### State Management & Routing
- **React Router DOM 7.2.0**: Client-side routing
- **React Context API**: Global state management
- **Custom Hooks**: Reusable state logic (scroll lock, table transfer, auth, etc.)

### Development Tools
- **ESLint**: Code linting and formatting
- **TypeScript ESLint**: TypeScript-specific linting
- **Autoprefixer**: CSS vendor prefixing
- **PostCSS**: CSS processing

---

## 📁 Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── Card.tsx
│   ├── Navbar.tsx
│   ├── Menu.tsx
│   └── ...
├── context/             # React Context providers
│   └── provider/
│       ├── AuthProvider.tsx
│       ├── RestaurantProvider.tsx
│       └── NotificationProvider.tsx
├── pages/               # Page components
│   ├── DashBoard.tsx
│   ├── Login.tsx
│   ├── restaurantstatus/
│   ├── menubusiness/
│   └── stockbusiness/
├── types/               # TypeScript type definitions
├── utils/               # Utility functions
├── assets/              # Static assets
└── api/                 # API client configuration
```

---

## 🚦 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/u9urturk/RSB-PROCESS.git
   cd RSB-PROCESS
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```
   - To allow access from other devices on your network, Vite is configured with `host: '0.0.0.0'` in `vite.config.js`.
   - Access the app via your local IP (e.g. `http://192.168.1.5:5173`) from other devices.

### Environment Variables
Create a `.env.local` (ignored by git) based on `.env.example`.

Key variables:

| Variable | Purpose | Example |
|----------|---------|---------|
| `VITE_API_BASE_URL` | REST API base (HTTP) | `https://localhost:3000` |
| `VITE_REALTIME_WS_BASE` | WebSocket base (ws/wss) | `ws://localhost:3000` |
| `VITE_FEATURE_REALTIME_LOGOUT` | Enable realtime logout feature | `true` |
| `VITE_DEBUG_REALTIME` | Console debug for websocket | `false` |
| `VITE_APP_NAME` | App display name | `Restaurant Management System` |
| `VITE_BUILD_VERSION` | Build/version string | `1.2.0` |

If `VITE_REALTIME_WS_BASE` is omitted the client attempts to derive `ws(s)` URL from `VITE_API_BASE_URL`.

After changing env vars restart `npm run dev` (Vite only inlines at build/start).

4. **Run as Electron app**
   ```bash
   npm run start
   ```

### Build for Production

1. **Build web application**

### 👤 Profile Management (NEW)
- **Profile Dashboard**: View and edit user info, avatar, preferences, sessions, activity log
- **Preferences Panel**: Live theme, density, language, time zone, notification settings
- **MFA Setup Wizard**: Secure multi-factor authentication flow
- **Session Management**: List and revoke active sessions
- **Activity Log**: Paginated audit log for profile actions
- **Password Change**: Secure password update with validation
- **Avatar Upload**: Drag-drop, preview, and upload with validation
- **Mock Auth Bypass**: Frontend-only test mode for rapid development
   ```bash

- **Custom Utility Classes**: surface-panel, chip-base, focus-ring, card-elevate-hover, compact mod spacing


- **ProfileProvider**: Dedicated context for profile state, preferences, sessions, MFA, avatar
**During development, the auth system is temporarily disabled.**

- `src/config/dev.ts` file with `AUTH_BYPASS: true` setting bypasses auth control
- Application redirects directly to dashboard
- Mock user information is automatically set


**Production transition:**  
Change `AUTH_BYPASS` to `false` in `src/config/dev.ts`.


---


- **Profile API endpoints are also mocked for frontend-only testing.**
- **Custom Hooks**: Reusable business logic

- **SOLID & Clean Code Refactor**: Multi-stage refactor plan applied to all major modules
- **Status Mapping**: Centralized status style/label logic for tables & orders
- **Build Metadata**: Dynamic version and git SHA shown in Splash Screen


- **Compact Mode**: Live spacing/density switch for all major UI components
- **Animations**: Lightweight Tailwind-powered keyframes & transitions (removed dependency on external animation libs in dashboard modules)

- **Profile module MVP**: Dashboard, edit form, avatar upload, preferences, sessions, activity log, MFA wizard
- **Compact mod utilities**: All major UI components support live density switching
- **Live theme/language/timezone**: Preferences panel applies changes instantly
- **Mocked profile API**: Frontend-only test mode for profile endpoints
- **Build metadata**: Version and git SHA shown in Splash Screen
- **Route Protection**: Private route guards

- **Profile page**: Modern, modular, MVP-level with all core features
---

- **SOLID refactor**: All major modules refactored for single responsibility and testability


- **NestJS + PostgreSQL + Prisma + Redis**: Backend profile module context engineering plan eklendi
- **Domain-driven design**: User, session, activity, preferences, MFA, avatar, audit log
- **SOLID service layer**: Interface-based, testable, modular
- **RESTful API**: DTO validation, error handling, JWT auth, rate limit, cache
- **Edge case & error handling**: All major scenarios covered
- **Swagger/OpenAPI**: Endpoint documentation
- Detaylar için: `backendbrief/profileModule-backend-plan.md`
- **Type Safety**: TypeScript compile-time checks
- **ESLint**: Code quality and consistency
- **Manual Testing**: Comprehensive feature testing

---

## 📈 Performance Optimization

- **Vite Build**: Optimized production builds
- **Code Splitting**: Lazy loading of components
- **Image Optimization**: Optimized asset delivery
- **Caching**: Efficient caching strategies

---

## 🚀 Deployment

### Web Deployment (Netlify)
1. Build the project: `npm run build`
2. Deploy `dist/` folder to Netlify
3. Configure `_redirects` for SPA routing

### Desktop Application
1. Package with Electron Builder
2. Create installers for Windows, macOS, Linux
3. Auto-update capabilities

---

## 📋 Changelog

### Version 1.3.0 - 19.08.2025

#### 🆕 Major Features & Refactors
- Modular API services: roleService, profileService, activityService, authApi
- New generic HTTP helpers: apiGet, apiPost, apiPut, apiPatch, apiDelete
- Role management: dynamic role list, update/remove role via API
- User activity logs: paginated, context-managed, with new service
- Centralized error handling and JWT utilities
- SOLID & Clean Code: all modules refactored for single responsibility

#### 🎨 UI / UX Improvements
- Uniform card sizes across dashboard and management pages
- InfoBalloon redesigned with glassmorphism effect
- Improved modal and notification components

#### 🛠️ TypeScript & Architecture
- Type fixes for User, Role, Activity models (id → userId, roles array, etc.)
- Context providers updated: AuthProvider, ProfileProvider, ActivityProvider, RestaurantProvider, NotificationProvider
- Enhanced hooks for login state, user management, and table transfer

#### 🐞 Fixes & Optimizations
- All major TypeScript errors resolved (roles, status, joined, etc.)
- Improved error handling and code quality
- Refactored JWT utility for correct userId mapping

#### 📚 Documentation
- README.md updated to reflect new features, API changes, and architecture



### Version 1.2.0 - 11.08.2025

#### 🧩 Architecture & Refactors
- Centralized status style/label logic (tables & orders) in a single status map utility
- Unified Order & Table status badges into dedicated reusable components
- Extracted reusable NoteModal and resolved note input interaction issues
- Refactored Order panel into smaller components (ProductGrid, CartPanel) & introduced table transfer hook
- Added formatting utilities (currency, time, occupancy duration) & table calculation helpers
- Implemented scroll lock hook for modals (replacing manual body style manipulation)
- Introduced reusable UI utility classes for surfaces, chips, focus, elevation

#### 🎨 UI / UX
- Modernized dashboard panels with cleaner spacing & consistent card heights
- Simplified gradients & reduced visual noise; unified badge styling
- Improved accessibility attributes (aria-pressed on toggle elements, descriptive labels)

#### 🛠️ Code Quality
- Reduced duplication in status handling & formatting
- Clear separation of concerns: logic moved to hooks/utilities, presentational components simplified

#### � Build Traceability
- Build artık kısa Git SHA içeriyor (ör: 1.2.0 (a1b2c3d)) ve Splash Screen'de gösteriliyor; hata ayıklama ve sürüm izlenebilirliği kolaylaştı.

#### �🐞 Fixes
- Fixed Note modal not accepting free-form or suggested notes
- Resolved style build issues by replacing unsupported @apply patterns with raw CSS utilities

### Version 1.1.0 - 08.08.2025

### 🔐 Authentication System Overhaul (Updated: Cookie-Only)
- **HttpOnly Cookie-Based Auth**: Access & refresh tokenlar artık sadece HttpOnly cookie'lerde; frontend'te Authorization header veya localStorage token yok.
- **Stateless Access, Rotating Refresh**: Access token kısa ömürlü, refresh token her yenilemede döndürülür (reuse detection backend'de).
- **Simplified Client Logic**: 401 yanıtında interceptor bir kez `/auth/refresh` dener, başarılıysa orijinal isteği tekrarlar.
- **Secure By Default**: XSS yüzeyinde token tutulmuyor; ileride cross-site dağıtım için CSRF header entegrasyonu planlandı.
- **Multi-step Login & Recovery**: OTP / recovery code akışları aynen devam.

#### 🛡️ Advanced Authorization & Route Protection
- **Permission-based Access Control**: Fine-grained permission system with role-based authorization
- **Enhanced Route Guards**: Comprehensive route protection with custom permission checks
- **User Management System**: Advanced user hook with permission calculations and role management
- **Unauthorized Handling**: Beautiful error pages with detailed feedback and navigation options

#### 🔧 Service Architecture Improvements
- **Modular API Services**: Separated authentication APIs into dedicated service files
- **Global Error Handling**: Centralized error handling service with user-friendly Turkish error messages
- **JWT Utilities**: Dedicated JWT utility service for token parsing, validation, and expiration checks
- **HTTP Client Integration**: Seamless integration with Axios interceptors for automatic token management

#### 🎨 UI/UX Enhancements
- **Responsive QR Code Layout**: Optimized QR code step for horizontal screens with side-by-side layout
- **Enhanced Splash Screen**: Professional loading animation with progress tracking and dynamic messages
- **Improved Login Flow**: Smooth multi-step authentication with beautiful animations and transitions
- **Better Error Messaging**: Context-aware error messages with actionable feedback

#### ⚡ Performance & Code Quality
- **Clean Architecture**: Implemented separation of concerns with single responsibility principle
- **Type Safety**: Enhanced TypeScript implementation with comprehensive type definitions
- **Memory Optimization**: Proper cleanup of timers and intervals to prevent memory leaks
- **Memoization**: Strategic use of React.useMemo and useCallback for performance optimization

#### 🔒 Security Enhancements (Revised)
- **Cookie Rotation**: Refresh kullanımı access cookie'yi sessizce yeniler; reuse tespiti backend tarafında.
- **No Client Token Storage**: Access / refresh token JS bellek ya da storage'ta tutulmaz.
- **401 Refresh Guard**: Her istek için maksimum 1 otomatik refresh denemesi ile döngüler engellenir.
- **Planned**: Cross-site modunda CSRF token header otomasyonu (gelecek adım).

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -m 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit a pull request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Team

- **Developer**: [@u9urturk](https://github.com/u9urturk)
- **Repository**: [RSB-PROCESS](https://github.com/u9urturk/RSB-PROCESS)

---

## 📞 Support

For support, please open an issue in the GitHub repository or contact the development team.

---

<div align="center">
  <strong>Built with ❤️ for the restaurant industry</strong>
</div>

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript and enable type-aware lint rules. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
