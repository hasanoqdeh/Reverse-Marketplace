# Reverse Marketplace Buyer App

A React Native mobile application for buyers to browse products, place orders, and interact with merchants on the Reverse Marketplace platform.

## 🏗️ Technology Stack

- **Framework**: React Native 0.72.4
- **Language**: TypeScript
- **Navigation**: React Navigation 6
- **State Management**: React Context + Hooks
- **UI Components**: React Native Elements + Paper
- **Icons**: React Native Vector Icons
- **HTTP Client**: Axios
- **Storage**: AsyncStorage
- **Maps**: React Native Maps
- **Notifications**: React Native Push Notification
- **Authentication**: React Native Keychain

## 🚀 Quick Start

### Prerequisites

- Node.js >= 16.0.0
- npm >= 8.0.0
- React Native development environment
  - React Native CLI
  - Android Studio (for Android development)
  - Xcode (for iOS development)

### Installation

1. Install dependencies:
```bash
npm install
```

2. iOS setup (if developing for iOS):
```bash
cd ios && pod install && cd ..
```

3. Setup environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Start Metro bundler:
```bash
npm start
```

5. Run on Android:
```bash
npm run android
```

6. Run on iOS:
```bash
npm run ios
```

## 📝 Environment Variables

```bash
# API Configuration
API_BASE_URL=http://localhost:3000/api/v1
WS_URL=ws://localhost:3000

# Authentication
JWT_SECRET=your_jwt_secret

# External Services
GOOGLE_MAPS_API_KEY=your_maps_api_key
FIREBASE_CONFIG=your_firebase_config

# Development
DEV_MODE=true
```

## 🏛️ Project Structure

```
buyer-app/
├── src/
│   ├── components/        # Reusable components
│   │   ├── common/       # Common UI components
│   │   ├── forms/        # Form components
│   │   └── lists/        # List components
│   ├── screens/          # Screen components
│   │   ├── auth/         # Authentication screens
│   │   ├── home/         # Home and browse screens
│   │   ├── products/     # Product screens
│   │   ├── orders/       # Order screens
│   │   ├── profile/      # Profile screens
│   │   └── chat/         # Chat screens
│   ├── navigation/       # Navigation configuration
│   │   ├── AppNavigator.tsx
│   │   ├── AuthNavigator.tsx
│   │   └── TabNavigator.tsx
│   ├── services/         # API services
│   │   ├── api.ts        # API client
│   │   ├── auth.ts       # Authentication service
│   │   ├── products.ts   # Product service
│   │   └── orders.ts     # Order service
│   ├── context/          # React Context providers
│   │   ├── AuthContext.tsx
│   │   ├── CartContext.tsx
│   │   └── NotificationContext.tsx
│   ├── utils/            # Utility functions
│   │   ├── helpers.ts    # Helper functions
│   │   ├── constants.ts  # App constants
│   │   └── storage.ts    # Storage utilities
│   ├── types/            # TypeScript type definitions
│   │   ├── auth.ts       # Auth types
│   │   ├── product.ts    # Product types
│   │   └── order.ts      # Order types
│   └── hooks/            # Custom React hooks
│       ├── useAuth.ts    # Auth hook
│       ├── useApi.ts     # API hook
│       └── useLocation.ts # Location hook
├── android/              # Android-specific files
├── ios/                  # iOS-specific files
└── __tests__/           # Test files
```

## 🎯 Features

### Authentication
- User registration and login
- Social login options
- Password reset functionality
- Secure token storage with Keychain

### Product Browsing
- Search and filter products
- Category browsing
- Product recommendations
- Wish list functionality

### Shopping Experience
- Shopping cart management
- Product details and reviews
- Image gallery and zoom
- Price comparison

### Order Management
- Order placement and tracking
- Order history
- Refund requests
- Delivery tracking

### Communication
- Real-time chat with merchants
- Push notifications
- In-app messaging
- Customer support

### User Profile
- Profile management
- Address book
- Payment methods
- Order preferences

## 🎨 UI Components

### Common Components
- **Button**: Customizable button with loading states
- **Input**: Form input with validation
- **Card**: Product and order cards
- **Modal**: Dialog and modal components
- **Loader**: Loading indicators

### Navigation Components
- **Tab Bar**: Bottom navigation
- **Header**: Custom headers
- **Drawer**: Side navigation drawer

### List Components
- **ProductList**: Horizontal/vertical product lists
- **OrderList**: Order history list
- **ChatList**: Conversation list

## 🔐 Authentication

### Login Flow
1. User enters credentials
2. API validates credentials
3. JWT token received
4. Token stored securely in Keychain
5. User redirected to home screen

### Token Management
- Automatic token refresh
- Secure storage with React Native Keychain
- Token expiration handling
- Logout functionality

### Biometric Authentication
- Fingerprint/Face ID support
- Quick login options
- Security settings

## 📱 Navigation Structure

### Auth Stack
- Login Screen
- Register Screen
- Forgot Password Screen

### Main App Stack
- Home Tab
- Browse Tab
- Orders Tab
- Chat Tab
- Profile Tab

### Modal Navigation
- Product Details
- Chat Screen
- Order Details
- Settings Screen

## 🔄 API Integration

### API Client Configuration

```typescript
// services/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.API_BASE_URL,
  timeout: 10000,
});

// Authentication interceptor
api.interceptors.request.use(async (config) => {
  const token = await Keychain.getGenericPassword();
  if (token) {
    config.headers.Authorization = `Bearer ${token.password}`;
  }
  return config;
});
```

### Error Handling
- Global error handling
- User-friendly error messages
- Network error detection
- Retry mechanism for failed requests

## 🗺️ Maps & Location

### Location Services
- GPS location tracking
- Address autocomplete
- Delivery radius calculation
- Store location finder

### Map Integration
- Interactive maps with markers
- Route visualization
- Distance calculation
- Location-based search

## 🔔 Notifications

### Push Notifications
- Order status updates
- Chat messages
- Promotional notifications
- Delivery alerts

### In-App Notifications
- Real-time updates
- Notification center
- Badge counts
- Notification preferences

## 🧪 Testing

```bash
# Run unit tests
npm test

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e

# Run linting
npm run lint
```

### Testing Framework
- **Unit Tests**: Jest + React Native Testing Library
- **E2E Tests**: Detox
- **Component Testing**: Storybook

## 📦 Build & Deployment

### Build Process

```bash
# Build for Android
npm run build:android

# Build for iOS
npm run build:ios

# Generate APK
npm run apk

# Generate iOS build
npm run build:ios
```

### App Store Deployment

#### Google Play Store
1. Generate signed APK/AAB
2. Create Play Console listing
3. Upload build
4. Submit for review

#### Apple App Store
1. Generate iOS build
2. Create App Store Connect listing
3. Upload with Xcode
4. Submit for review

### Code Signing
- Automated code signing
- Keystore management
- Provisioning profiles
- Certificate management

## 🔧 Development Tools

### Code Quality
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **TypeScript**: Type checking
- **Husky**: Git hooks

### Development Experience
- **Hot Reload**: Fast refresh
- **Flipper**: Debugging tool
- **Reactotron**: State debugging
- **React Native Debugger**

## 📊 Performance Optimization

### Bundle Optimization
- Code splitting
- Lazy loading
- Bundle size analysis
- Asset optimization

### Runtime Performance
- Image optimization
- List virtualization
- Memory management
- Animation optimization

### Network Optimization
- Request caching
- Image caching
- API response optimization
- Offline support

## 🐛 Troubleshooting

### Common Issues

1. **Metro Bundler Issues**
   - Clear Metro cache: `npm run start -- --reset-cache`
   - Clear node_modules and reinstall
   - Check for port conflicts

2. **Android Build Issues**
   - Check Android SDK installation
   - Update Gradle dependencies
   - Clear Android build cache

3. **iOS Build Issues**
   - Update CocoaPods
   - Clear iOS build cache
   - Check Xcode configuration

4. **Navigation Issues**
   - Check React Navigation version
   - Verify screen component exports
   - Check navigation structure

### Debug Tools
- **React Native Debugger**: State and network debugging
- **Flipper**: Comprehensive debugging tool
- **Chrome DevTools**: Network and console debugging
- **Device Logs**: Native error logs

## 📚 Documentation

### Component Documentation
- JSDoc comments for functions
- TypeScript interfaces for props
- Storybook stories for components

### API Documentation
- API endpoint documentation
- Request/response examples
- Error handling guide

## 🤝 Contributing

1. Follow React Native best practices
2. Add tests for new features
3. Update documentation
4. Test on both platforms
5. Submit pull requests

## 📞 Support

For technical support, please create an issue in the repository or contact the development team.
