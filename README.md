# 🍽️ Restaurant Management System (RMS)

A comprehensive restaurant management system built with modern web technologies, featuring real-time table management, order processing, inventory tracking, and staff coordination.

![React](https://img.shields.io/badge/React-19.0.0-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue.svg)
![Electron](https://img.shields.io/badge/Electron-34.3.0-brightgreen.svg)
![Vite](https://img.shields.io/badge/Vite-6.2.0-orange.svg)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4.0.9-38bdf8.svg)

## 🚀 Features

### 🏪 Restaurant Status Management
- **Real-time Table Management**: Monitor table occupancy, capacity, and status
- **Waiter Assignment**: Assign waiters to tables and track their performance
- **Order Tracking**: Real-time order status updates (pending, preparing, ready, delivered)
- **Table Transfer**: Seamlessly transfer orders between tables
- **Payment Processing**: Handle cash and card payments with detailed receipts

### � Menu Management
- **Dynamic Menu System**: Add, edit, and remove menu items
- **Category Management**: Organize menu items by categories
- **Pricing Control**: Flexible pricing system with special offers
- **Availability Tracking**: Track item availability in real-time

### 📦 Inventory Management
- **Stock Tracking**: Monitor inventory levels with low-stock alerts
- **Barcode Scanner**: Integrated barcode scanning for quick item identification
- **Supplier Management**: Track suppliers and purchase orders
- **Automatic Reordering**: Set minimum stock levels for automatic reorder alerts

### 📊 Analytics & Reporting
- **Sales Analytics**: Comprehensive sales reports and charts
- **Performance Metrics**: Track waiter performance and table turnover
- **Revenue Tracking**: Real-time revenue monitoring
- **Customer Insights**: Analyze customer behavior and preferences

## 🛠️ Tech Stack

### Frontend
- **React 19.0.0**: Latest React with concurrent features
- **TypeScript 5.8.3**: Type-safe development
- **Vite 6.2.0**: Lightning-fast build tool
- **Tailwind CSS 4.0.9**: Utility-first CSS framework
- **Framer Motion 12.5.0**: Smooth animations and transitions

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
- **Custom Hooks**: Reusable state logic

### Development Tools
- **ESLint**: Code linting and formatting
- **TypeScript ESLint**: TypeScript-specific linting
- **Autoprefixer**: CSS vendor prefixing
- **PostCSS**: CSS processing

## 📁 Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── Card.tsx         # Generic card component
│   ├── Navbar.tsx       # Navigation bar
│   ├── Menu.tsx         # Menu component
│   └── ...
├── context/             # React Context providers
│   └── provider/
│       ├── AuthProvider.tsx
│       ├── RestaurantProvider.tsx
│       └── NotificationProvider.tsx
├── pages/               # Page components
│   ├── DashBoard.tsx    # Main dashboard
│   ├── Login.tsx        # Authentication
│   ├── restaurantstatus/ # Restaurant management
│   ├── menubusiness/    # Menu management
│   └── stockbusiness/   # Inventory management
├── types/               # TypeScript type definitions
├── utils/               # Utility functions
├── assets/              # Static assets
└── api/                 # API client configuration
```

## 🚀 Getting Started

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

4. **Run as Electron app**
   ```bash
   npm run start
   ```

### Build for Production

1. **Build web application**
   ```bash
   npm run build
   ```

2. **Preview production build**
   ```bash
   npm run preview
   ```

## 🔧 Development Mode - Auth Bypass

**During development, the auth system is temporarily disabled.**

### How it works:
- `src/config/dev.ts` file with `AUTH_BYPASS: true` setting bypasses auth control
- Application redirects directly to dashboard
- Mock user information is automatically set

### Production transition:
Make the following changes in `src/config/dev.ts`:
```typescript
export const DEV_CONFIG = {
    AUTH_BYPASS: false, // Change from true to false
    SPLASH_DELAY: 2000, // Normal splash delay
};
```

### Affected files:
- `src/context/provider/AuthProvider.tsx` - Mock user and token
- `src/utils/routeUtils.tsx` - PrivateRoute bypass
- `src/pages/Login.tsx` - Login page bypass
- `src/pages/SplashScreen.tsx` - Direct dashboard redirect

## 🏗️ Architecture

### Component Architecture
- **Atomic Design**: Components organized by complexity (atoms, molecules, organisms)
- **Custom Hooks**: Reusable business logic
- **Context Providers**: Global state management
- **Type Safety**: Comprehensive TypeScript integration

### State Management
- **React Context**: Global application state
- **Local State**: Component-specific state with hooks
- **Persistent Storage**: Local storage for user preferences

### Routing
- **React Router**: Client-side routing
- **Protected Routes**: Authentication-based route protection
- **Nested Routes**: Hierarchical routing structure

## 🎨 Design System

### Color Palette
- **Primary**: Blue gradient themes
- **Secondary**: Green, purple, orange accents
- **Status Colors**: Red (occupied), Blue (reserved), Green (available)
- **Neutral**: Gray scale for backgrounds and text

### Typography
- **Font Family**: System fonts for optimal performance
- **Font Weights**: 400 (normal), 600 (semibold), 700 (bold)
- **Responsive Sizing**: Adaptive font sizes across devices

### Animations
- **Framer Motion**: Smooth page transitions
- **Hover Effects**: Interactive feedback
- **Loading States**: Skeleton screens and spinners
- **Micro-interactions**: Button states and form feedback

## 📱 Responsive Design

- **Mobile First**: Optimized for mobile devices
- **Tablet Support**: Adapted layouts for tablets
- **Desktop**: Full-featured desktop experience
- **Cross-browser**: Compatible with modern browsers

## 🔒 Security Features

- **Authentication**: JWT-based authentication
- **Route Protection**: Private route guards
- **Input Validation**: Form validation and sanitization
- **XSS Protection**: Secure coding practices

## 🧪 Testing

- **Type Safety**: TypeScript compile-time checks
- **ESLint**: Code quality and consistency
- **Manual Testing**: Comprehensive feature testing

## 📈 Performance Optimization

- **Vite Build**: Optimized production builds
- **Code Splitting**: Lazy loading of components
- **Image Optimization**: Optimized asset delivery
- **Caching**: Efficient caching strategies

## 🚀 Deployment

### Web Deployment (Netlify)
1. Build the project: `npm run build`
2. Deploy `dist/` folder to Netlify
3. Configure `_redirects` for SPA routing

### Desktop Application
1. Package with Electron Builder
2. Create installers for Windows, macOS, Linux
3. Auto-update capabilities

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -m 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Developer**: [@u9urturk](https://github.com/u9urturk)
- **Repository**: [RSB-PROCESS](https://github.com/u9urturk/RSB-PROCESS)

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
