# Reverse Marketplace — Mobile App

React Native 0.72 app for both Buyer and Merchant roles on the Reverse Marketplace platform.

## Tech Stack

| | |
|---|---|
| Framework | React Native 0.72 (no Expo) |
| Language | TypeScript |
| Navigation | React Navigation 6 (Stack + Bottom Tabs) |
| State | React Context + Hooks |
| HTTP | Axios |
| Storage | AsyncStorage |
| Realtime | Socket.IO client |
| Audio | react-native-audio-recorder-player |
| Images | react-native-image-picker |

## Quick Start

```bash
# Install dependencies
npm install

# iOS setup
cd ios && pod install && cd ..

# Start Metro bundler
npx react-native start

# Run on Android emulator
npx react-native run-android

# Run on specific device
npx react-native run-android --deviceId emulator-5554
```

## Emulators

Available AVDs: `bayer`, `pixel_4_api_34`, `test_device`

```bash
emulator -list-avds
emulator -avd pixel_4_api_34 -no-snapshot-load &
adb devices
```

Metro runs on port 8081 and is shared across all connected devices.

## Project Structure

```
src/
├── theme.ts                    # Design tokens (Colors, Shadows) — import instead of raw hex
├── api/                        # Axios API clients (requests, bids, chat, notifications, reviews)
├── components/                 # AppHeader, ImageViewerModal
├── context/                    # AuthContext (user, login, logout, updateProfile)
├── modules/
│   ├── buyer/
│   │   ├── BuyerNavigator.tsx
│   │   └── screens/
│   │       ├── HomeScreen.tsx
│   │       ├── CreateRequestScreen.tsx
│   │       ├── RequestsScreen.tsx
│   │       ├── RequestDetailScreen.tsx
│   │       └── RequestBidsScreen.tsx
│   └── merchant/
│       ├── MerchantNavigator.tsx
│       └── screens/
│           ├── MerchantDiscoverScreen.tsx  # Browse + bid on buyer requests
│           └── MerchantActivityScreen.tsx  # Bid history + fulfillment tracking
└── screens/
    ├── auth/                   # PhoneInputScreen, OtpScreen, ProfileSetupScreen
    ├── chat/                   # ChatListScreen, ChatRoomScreen
    ├── notifications/          # NotificationsScreen
    ├── profile/                # ProfileScreen
    └── rating/                 # RateTransactionScreen
```

## Theme System

All colors live in `src/theme.ts`. Import `Colors` instead of raw hex strings.

```typescript
import {Colors} from '../../theme';  // adjust relative path

// Key tokens
Colors.primary        // #1877F2 — all interactive buttons, links
Colors.primaryLight   // #E7F3FF — chip/unread backgrounds
Colors.feedBackground // #F0F2F5 — screen/list backgrounds
Colors.surface        // #FFFFFF — cards, headers, sheets
Colors.divider        // #E4E6EA — borders, separators
Colors.textPrimary    // #050505
Colors.textSecondary  // #65676B
Colors.textOnPrimary  // #FFFFFF — text on blue
Colors.success        // #42B72A — fulfilled/confirmed states (intentionally green)
Colors.error          // #E41E3F
Colors.warning        // #F59E0B — star ratings, fulfillment progress
```

## Environment

The app points to `http://10.0.2.2:3000` (localhost from Android emulator).
Change `API_BASE` constants in api/ files to switch environments.

## Role-Based Navigation

On login, the app checks `user.role` (`BUYER` or `MERCHANT`) and renders the corresponding navigator:
- **BUYER** → `BuyerNavigator` (Home, Requests, Chat, Notifications, Profile)
- **MERCHANT** → `MerchantNavigator` (Discover, Activity, Chat, Notifications, Profile)
