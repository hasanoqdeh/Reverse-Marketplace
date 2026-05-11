
# Service Endpoints Documentation

## **Bidding Service** (`/api/bidding`)
- **POST** `/api/bidding/bids` - Create a new bid
- **GET** `/api/bidding/bids/:id` - Get bid by ID
- **PATCH** `/api/bidding/bids/:id/status` - Update bid status
- **GET** `/api/bidding/bids/request/:requestId` - Get bids for a specific request (with pagination and sorting)
- **GET** `/api/bidding/bids/request/:requestId/analytics` - Get bid analytics for a request
- **GET** `/api/bidding/bids/my-bids` - Get merchant's bids (with filtering and pagination)
- **PATCH** `/api/bidding/bids/:id/withdraw` - Withdraw a bid

## **Chat Service**

### Conversations (`/api/chat`)
- **GET** `/api/chat/chat/conversations` - Get user conversations (paginated)
- **GET** `/api/chat/chat/conversations/:id` - Get specific conversation
- **PATCH** `/api/chat/chat/conversations/:id/archive` - Archive conversation
- **PATCH** `/api/chat/chat/conversations/:id/block` - Block conversation
- **PATCH** `/api/chat/chat/conversations/:id/close` - Close conversation
- **GET** `/api/chat/chat/conversations/:id/participants` - Get conversation participants

### Messages (`/api/chat`)
- **POST** `/api/chat/chat/messages` - Send message
- **GET** `/api/chat/chat/messages/conversation/:conversationId` - Get conversation messages (with pagination)
- **PATCH** `/api/chat/chat/messages/read` - Mark message as read
- **PATCH** `/api/chat/chat/messages/conversation/:conversationId/read-all` - Mark all messages as read
- **GET** `/api/chat/chat/messages/unread` - Get unread count
- **GET** `/api/chat/chat/messages/:messageId` - Get specific message
- **PATCH** `/api/chat/chat/messages/:messageId/delete` - Delete message

### Uploads (`/api/chat`)
- **POST** `/api/chat/chat/uploads/url` - Generate upload URL
- **POST** `/api/chat/chat/uploads/:fileId/confirm` - Confirm upload
- **GET** `/api/chat/chat/uploads/:fileId/metadata` - Get file metadata
- **POST** `/api/chat/chat/uploads/:fileId/scan` - Scan file for malware
- **POST** `/api/chat/chat/uploads/:fileId/validate` - Validate content
- **DELETE** `/api/chat/chat/uploads/:fileId` - Delete file
- **GET** `/api/chat/chat/uploads/config/supported-types` - Get supported file types

## **Identity Service**

### Health (`/api/identity`)
- **GET** `/api/identity/health` - Service health check

### Metrics (`/api/identity/metrics`) - Admin Only
- **GET** `/api/identity/metrics` - Get service metrics

### Admin (`/api/admin/users`) - Admin Only
- **GET** `/api/admin/users/banned` - Get banned users
- **GET** `/api/admin/users/stats` - Get user statistics
- **PATCH** `/api/admin/users/:id/ban` - Ban user
- **PATCH** `/api/admin/users/:id/unban` - Unban user

### Admin Analytics - Admin Only
- **GET** `/api/analytics/overview` - Get analytics overview
- **GET** `/api/analytics/category-trends` - Get category trends
- **GET** `/api/analytics/geographic` - Get geographic data
- **GET** `/api/analytics/ratios` - Get analytics ratios
- **GET** `/api/analytics/revenue-per-category` - Get revenue per category

### Authentication (`/api/identity/auth`)
- **POST** `/api/identity/auth/request-otp` - Request OTP for phone verification
- **POST** `/api/identity/auth/verify-otp` - Verify OTP and authenticate user
- **POST** `/api/identity/auth/refresh` - Refresh access token
- **POST** `/api/identity/auth/logout` - Logout from current device
- **POST** `/api/identity/auth/logout-all` - Logout from all devices

### Merchants (`/api/admin/merchants`) - Admin Only
- **GET** `/api/admin/merchants/pending` - Get pending merchants for review
- **GET** `/api/admin/merchants/stats` - Get merchant verification statistics
- **GET** `/api/admin/merchants/:id` - Get merchant by ID
- **PATCH** `/api/admin/merchants/:id/approve` - Approve merchant verification
- **PATCH** `/api/admin/merchants/:id/reject` - Reject merchant verification

### Users (`/api/identity/users`)
- **GET** `/api/identity/users/me` - Get current user profile
- **PATCH** `/api/identity/users/me` - Update current user profile
- **GET** `/api/identity/users/admin/all` - Get all users (Admin only)
- **GET** `/api/identity/users/merchant/dashboard` - Get merchant dashboard (Merchant only)
- **GET** `/api/identity/users/buyer/dashboard` - Get buyer dashboard (Buyer only)

## **Matching Engine**
- **GET** `/api/matching/health` - Service health check with performance metrics

## **Notification Service**

### Notifications (`/api/notification`)
- **POST** `/api/notification/notifications` - Create and send notification
- **GET** `/api/notification/notifications` - Get user notifications (paginated, with filters)
- **GET** `/api/notification/notifications/unread/count` - Get unread notifications count
- **GET** `/api/notification/notifications/stats` - Get notification statistics
- **PATCH** `/api/notification/notifications/:id/read` - Mark notification as read
- **PATCH** `/api/notification/notifications/read-all` - Mark all notifications as read
- **DELETE** `/api/notification/notifications/:id` - Delete notification
- **POST** `/api/notification/notifications/bulk` - Send bulk notifications to multiple users

### Admin Notifications (`/api/notification`)
- **POST** `/api/notification/admin/notifications/broadcast` - Broadcast notification to all users
- **GET** `/api/notification/admin/notifications/stats` - Get system-wide notification statistics

## **Payment Service**

### Wallet (`/api/payment/wallet`)
- **GET** `/api/payment/wallet` - Get user wallet
- **GET** `/api/payment/wallet/balance` - Get wallet balance
- **GET** `/api/payment/wallet/transactions` - Get transaction history (with filters and pagination)
- **POST** `/api/payment/wallet/deposit` - Deposit funds to wallet
- **POST** `/api/payment/wallet/withdraw` - Withdraw funds from wallet
- **GET** `/api/payment/wallet/stats` - Get wallet statistics

### Admin Wallet (`/api/payment/admin/wallets`)
- **GET** `/api/payment/admin/wallets/:userId` - Get user wallet (Admin)
- **GET** `/api/payment/admin/wallets/:userId/balance` - Get user wallet balance (Admin)
- **POST** `/api/payment/admin/wallets/:userId/freeze` - Freeze user wallet (Admin)
- **POST** `/api/payment/admin/wallets/:userId/unfreeze` - Unfreeze user wallet (Admin)
- **GET** `/api/payment/admin/wallets/stats/all` - Get system-wide wallet statistics (Admin)

## **Request Service**

### Requests (`/api/request`)
- **POST** `/api/request/requests/draft` - Create new draft request
- **PATCH** `/api/request/requests/:id/draft` - Update draft request
- **PATCH** `/api/request/requests/:id/publish` - Publish draft request
- **PATCH** `/api/request/requests/:id/status` - Update request status
- **GET** `/api/request/requests/my-requests` - Get current user's requests (with filters)
- **GET** `/api/request/requests/:id` - Get request by ID
- **DELETE** `/api/request/requests/:id` - Delete draft request

### Uploads (`/api/request`)
- **POST** `/api/request/requests/:id/images` - Upload images for a request
- **DELETE** `/api/request/requests/:id/images/:imageId` - Delete image from request
- **POST** `/api/request/requests/:id/images/reorder` - Reorder images in request
