# Reverse Marketplace Admin Panel

A comprehensive admin dashboard for managing the Reverse Marketplace platform.

## 🏗️ Technology Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI + shadcn/ui
- **Icons**: Lucide React
- **Charts**: Recharts
- **Forms**: React Hook Form + Zod
- **State Management**: React Query
- **HTTP Client**: Axios

## 🚀 Quick Start

### Prerequisites

- Node.js >= 16.0.0
- npm >= 8.0.0

### Installation

1. Install dependencies:
```bash
npm install
```

2. Setup environment variables:
```bash
```

3. Start development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📝 Environment Variables

```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
NEXT_PUBLIC_WS_URL=ws://localhost:3000

# Authentication
NEXT_PUBLIC_JWT_SECRET=your_jwt_secret

# External Services
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_key
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_maps_key
```

## 🏛️ Project Structure

```
admin-panel/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── (auth)/         # Authentication routes
│   │   ├── dashboard/      # Dashboard pages
│   │   ├── users/          # User management
│   │   ├── products/       # Product management
│   │   ├── orders/         # Order management
│   │   └── layout.tsx      # Root layout
│   ├── components/         # Reusable components
│   │   ├── ui/            # Base UI components
│   │   ├── forms/         # Form components
│   │   ├── charts/        # Chart components
│   │   └── tables/        # Table components
│   ├── lib/               # Utility libraries
│   │   ├── utils.ts       # General utilities
│   │   ├── api.ts         # API client
│   │   └── auth.ts        # Authentication utilities
│   ├── hooks/             # Custom React hooks
│   ├── types/             # TypeScript type definitions
│   └── utils/             # Helper functions
├── public/                # Static assets
├── tailwind.config.js     # Tailwind configuration
├── tsconfig.json          # TypeScript configuration
└── next.config.js         # Next.js configuration
```

## 🎯 Features

### Dashboard
- Real-time statistics and metrics
- Revenue analytics
- User activity monitoring
- System health indicators

### User Management
- View and manage all users
- Role-based access control
- User profile management
- Activity logs

### Product Management
- Product catalog management
- Inventory tracking
- Category management
- Product analytics

### Order Management
- Order tracking and status updates
- Payment processing
- Refund management
- Order analytics

### System Configuration
- Platform settings
- Notification preferences
- API key management
- System maintenance

## 🎨 UI Components

### Base Components
- **Button**: Customizable button with variants
- **Card**: Flexible card component
- **Input**: Form input with validation
- **Modal**: Dialog and modal components
- **Table**: Data table with sorting/filtering

### Advanced Components
- **Charts**: Recharts-based data visualization
- **Forms**: React Hook Form integration
- **Navigation**: Sidebar and top navigation
- **Layout**: Responsive layout system

## 🔐 Authentication

The admin panel uses JWT-based authentication:

1. Login with admin credentials
2. Receive JWT token
3. Store token in localStorage
4. Include token in API requests
5. Automatic token refresh

### Protected Routes

All admin routes are protected by authentication middleware. Unauthenticated users are redirected to the login page.

## 📊 Data Visualization

### Chart Types
- **Line Charts**: Revenue trends
- **Bar Charts**: User statistics
- **Pie Charts**: Category distribution
- **Area Charts**: Growth metrics

### Real-time Updates

Data updates in real-time using:
- WebSocket connections
- React Query for data fetching
- Optimistic updates for better UX

## 🔄 API Integration

### API Client Configuration

```typescript
// lib/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 10000,
});

// Add authentication header
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### Error Handling

Global error handling with:
- API error interceptors
- User-friendly error messages
- Automatic retry for failed requests
- Error boundary for React errors

## 🧪 Testing

```bash
# Run unit tests
npm test

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e
```

### Testing Framework
- **Unit Tests**: Jest + React Testing Library
- **E2E Tests**: Playwright
- **Component Testing**: Storybook

## 📱 Responsive Design

The admin panel is fully responsive:

- **Desktop**: Full-featured dashboard
- **Tablet**: Optimized layout for tablets
- **Mobile**: Simplified mobile interface

### Breakpoints
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

## 🚀 Performance Optimization

### Code Splitting
- Automatic route-based code splitting
- Dynamic imports for heavy components
- Lazy loading for charts and data

### Caching Strategy
- API response caching with React Query
- Static asset optimization
- Image optimization with Next.js

### Bundle Optimization
- Tree shaking for unused code
- Minification and compression
- CDN deployment for static assets

## 🔧 Development Tools

### Code Quality
- **ESLint**: Code linting and formatting
- **Prettier**: Code formatting
- **TypeScript**: Type checking
- **Husky**: Git hooks for code quality

### Development Experience
- **Hot Reload**: Fast refresh during development
- **Storybook**: Component development and testing
- **DevTools**: React and Redux dev tools

## 📦 Build & Deployment

### Build Process

```bash
# Build for production
npm run build

# Start production server
npm start

# Export static files (if needed)
npm run export
```

### Deployment Options

- **Vercel**: Recommended for Next.js apps
- **Netlify**: Static site deployment
- **AWS**: Custom deployment with S3/CloudFront
- **Docker**: Containerized deployment

### Environment Configuration

- **Development**: Local development with hot reload
- **Staging**: Pre-production testing
- **Production**: Optimized production build

## 🐛 Troubleshooting

### Common Issues

1. **Build Errors**
   - Check TypeScript configuration
   - Verify all dependencies are installed
   - Check for circular dependencies

2. **API Connection Issues**
   - Verify API URL in environment variables
   - Check CORS configuration
   - Ensure backend is running

3. **Authentication Issues**
   - Check JWT token validity
   - Verify token storage
   - Check authentication middleware

### Debug Tools

- **React DevTools**: Component debugging
- **Network Tab**: API request debugging
- **Console**: Error logging and debugging

## 📚 Documentation

### Component Documentation
- Storybook stories for all components
- JSDoc comments for functions
- TypeScript interfaces for props

### API Documentation
- API endpoint documentation
- Request/response examples
- Error code reference

## 🤝 Contributing

1. Follow the existing code style
2. Add tests for new features
3. Update documentation
4. Submit pull requests

## 📞 Support

For technical support, please create an issue in the repository or contact the development team.
