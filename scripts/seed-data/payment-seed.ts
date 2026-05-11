// Entity interfaces for Payment Service seed data
export enum WalletStatus {
  ACTIVE = 'ACTIVE',
  FROZEN = 'FROZEN',
  SUSPENDED = 'SUSPENDED',
  CLOSED = 'CLOSED',
}

export enum TransactionType {
  DEPOSIT = 'DEPOSIT',
  WITHDRAWAL = 'WITHDRAWAL',
  BID_FEE = 'BID_FEE',
  SUBSCRIPTION = 'SUBSCRIPTION',
  REFUND = 'REFUND',
  BONUS = 'BONUS',
  PAYOUT = 'PAYOUT',
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REVERSED = 'REVERSED',
}

export enum SubscriptionPlanType {
  BASIC = 'BASIC',
  PRO = 'PRO',
  ENTERPRISE = 'ENTERPRISE',
}

export enum SubscriptionStatus {
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED',
  SUSPENDED = 'SUSPENDED',
}

export interface Wallet {
  id: string;
  user_id: string;
  balance: number;
  currency: string;
  status: WalletStatus;
  frozen_balance: number;
  last_transaction_at?: Date;
  created_at?: Date;
}

export interface WalletTransaction {
  id: string;
  wallet_id: string;
  type: TransactionType;
  amount: number;
  currency: string;
  description?: string;
  reference_id?: string;
  status: TransactionStatus;
  metadata?: Record<string, any>;
  created_at?: Date;
  completed_at?: Date;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  type: SubscriptionPlanType;
  price: number;
  currency: string;
  billing_cycle: 'MONTHLY' | 'YEARLY';
  features: string[];
  bid_fee_discount: number; // percentage
  max_bids_per_month: number;
  priority_matching: boolean;
  analytics_access: boolean;
  is_active: boolean;
  created_at?: Date;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan_id: string;
  status: SubscriptionStatus;
  current_period_start: Date;
  current_period_end: Date;
  cancelled_at?: Date;
  auto_renew: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export interface PaymentIntent {
  id: string;
  user_id: string;
  amount: number;
  currency: string;
  type: 'DEPOSIT' | 'SUBSCRIPTION' | 'BID_FEE';
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  payment_method: string;
  gateway_reference?: string;
  metadata?: Record<string, any>;
  created_at?: Date;
  completed_at?: Date;
}

export interface Refund {
  id: string;
  payment_intent_id: string;
  amount: number;
  currency: string;
  reason: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  gateway_reference?: string;
  processed_at?: Date;
  created_at?: Date;
}

export interface Invoice {
  id: string;
  user_id: string;
  type: 'SUBSCRIPTION' | 'BID_FEE' | 'REFUND';
  amount: number;
  currency: string;
  description: string;
  status: 'PAID' | 'PENDING' | 'OVERDUE';
  due_date: Date;
  paid_at?: Date;
  created_at?: Date;
}

// Seed data for Payment Service
export const paymentSeedData = {
  wallets: [
    // Admin wallets
    {
      id: 'wallet-admin-001',
      user_id: 'admin-001',
      balance: 10000.00,
      currency: 'SAR',
      status: WalletStatus.ACTIVE,
      frozen_balance: 0.00,
      last_transaction_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
    {
      id: 'wallet-admin-002',
      user_id: 'admin-002',
      balance: 5000.00,
      currency: 'SAR',
      status: WalletStatus.ACTIVE,
      frozen_balance: 0.00,
      last_transaction_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    },

    // Buyer wallets
    {
      id: 'wallet-buyer-001',
      user_id: 'buyer-001',
      balance: 2500.00,
      currency: 'SAR',
      status: WalletStatus.ACTIVE,
      frozen_balance: 0.00,
      last_transaction_at: new Date(Date.now() - 1 * 60 * 60 * 1000),
    },
    {
      id: 'wallet-buyer-002',
      user_id: 'buyer-002',
      balance: 8000.00,
      currency: 'SAR',
      status: WalletStatus.ACTIVE,
      frozen_balance: 4200.00, // Frozen for accepted bid
      last_transaction_at: new Date(Date.now() - 30 * 60 * 1000),
    },
    {
      id: 'wallet-buyer-003',
      user_id: 'buyer-003',
      balance: 1500.00,
      currency: 'SAR',
      status: WalletStatus.ACTIVE,
      frozen_balance: 0.00,
      last_transaction_at: new Date(Date.now() - 3 * 60 * 60 * 1000),
    },
    {
      id: 'wallet-buyer-004',
      user_id: 'buyer-004',
      balance: 3200.00,
      currency: 'SAR',
      status: WalletStatus.ACTIVE,
      frozen_balance: 0.00,
      last_transaction_at: new Date(Date.now() - 6 * 60 * 60 * 1000),
    },
    {
      id: 'wallet-buyer-005',
      user_id: 'buyer-005',
      balance: 6000.00,
      currency: 'SAR',
      status: WalletStatus.ACTIVE,
      frozen_balance: 0.00,
      last_transaction_at: new Date(Date.now() - 4 * 60 * 60 * 1000),
    },

    // Merchant wallets
    {
      id: 'wallet-merchant-001',
      user_id: 'merchant-001',
      balance: 15000.00,
      currency: 'SAR',
      status: WalletStatus.ACTIVE,
      frozen_balance: 0.00,
      last_transaction_at: new Date(Date.now() - 45 * 60 * 1000),
    },
    {
      id: 'wallet-merchant-002',
      user_id: 'merchant-002',
      balance: 8500.00,
      currency: 'SAR',
      status: WalletStatus.ACTIVE,
      frozen_balance: 0.00,
      last_transaction_at: new Date(Date.now() - 2 * 60 * 60 * 1000),
    },
    {
      id: 'wallet-merchant-003',
      user_id: 'merchant-003',
      balance: 12000.00,
      currency: 'SAR',
      status: WalletStatus.ACTIVE,
      frozen_balance: 0.00,
      last_transaction_at: new Date(Date.now() - 8 * 60 * 60 * 1000),
    },
    {
      id: 'wallet-merchant-004',
      user_id: 'merchant-004',
      balance: 3000.00,
      currency: 'SAR',
      status: WalletStatus.SUSPENDED, // Suspended due to verification issues
      frozen_balance: 500.00,
      last_transaction_at: new Date(Date.now() - 12 * 60 * 60 * 1000),
    },
    {
      id: 'wallet-merchant-005',
      user_id: 'merchant-005',
      balance: 9500.00,
      currency: 'SAR',
      status: WalletStatus.ACTIVE,
      frozen_balance: 0.00,
      last_transaction_at: new Date(Date.now() - 90 * 60 * 1000),
    },
  ] as Wallet[],

  walletTransactions: [
    // Buyer transactions
    {
      id: 'txn-001',
      wallet_id: 'wallet-buyer-001',
      type: TransactionType.DEPOSIT,
      amount: 3000.00,
      currency: 'SAR',
      description: 'Initial wallet funding',
      reference_id: 'pay-intent-001',
      status: TransactionStatus.COMPLETED,
      metadata: { payment_method: 'credit_card' },
      created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      completed_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    },
    {
      id: 'txn-002',
      wallet_id: 'wallet-buyer-002',
      type: TransactionType.DEPOSIT,
      amount: 10000.00,
      currency: 'SAR',
      description: 'Wallet funding for purchases',
      reference_id: 'pay-intent-002',
      status: TransactionStatus.COMPLETED,
      metadata: { payment_method: 'bank_transfer' },
      created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      completed_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    },
    {
      id: 'txn-003',
      wallet_id: 'wallet-buyer-002',
      type: TransactionType.SUBSCRIPTION,
      amount: 99.00,
      currency: 'SAR',
      description: 'Pro subscription monthly fee',
      reference_id: 'sub-001',
      status: TransactionStatus.COMPLETED,
      metadata: { subscription_type: 'PRO' },
      created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      completed_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    },

    // Merchant transactions
    {
      id: 'txn-004',
      wallet_id: 'wallet-merchant-001',
      type: TransactionType.BID_FEE,
      amount: 25.00,
      currency: 'SAR',
      description: 'Bid fee for iPhone request',
      reference_id: 'bid-001',
      status: TransactionStatus.COMPLETED,
      metadata: { request_id: 'req-001', bid_id: 'bid-001' },
      created_at: new Date(Date.now() - 60 * 60 * 1000),
      completed_at: new Date(Date.now() - 60 * 60 * 1000),
    },
    {
      id: 'txn-005',
      wallet_id: 'wallet-merchant-002',
      type: TransactionType.BID_FEE,
      amount: 15.00,
      currency: 'SAR',
      description: 'Bid fee for brake pads request',
      reference_id: 'bid-004',
      status: TransactionStatus.COMPLETED,
      metadata: { request_id: 'req-003', bid_id: 'bid-004' },
      created_at: new Date(Date.now() - 45 * 60 * 1000),
      completed_at: new Date(Date.now() - 45 * 60 * 1000),
    },
    {
      id: 'txn-006',
      wallet_id: 'wallet-merchant-001',
      type: TransactionType.SUBSCRIPTION,
      amount: 299.00,
      currency: 'SAR',
      description: 'Enterprise subscription yearly fee',
      reference_id: 'sub-002',
      status: TransactionStatus.COMPLETED,
      metadata: { subscription_type: 'ENTERPRISE', billing_cycle: 'YEARLY' },
      created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      completed_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    },
    {
      id: 'txn-007',
      wallet_id: 'wallet-merchant-003',
      type: TransactionType.BONUS,
      amount: 500.00,
      currency: 'SAR',
      description: 'Welcome bonus for new merchant',
      reference_id: 'bonus-001',
      status: TransactionStatus.COMPLETED,
      metadata: { bonus_type: 'welcome' },
      created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
      completed_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
    },
    {
      id: 'txn-008',
      wallet_id: 'wallet-merchant-005',
      type: TransactionType.SUBSCRIPTION,
      amount: 49.00,
      currency: 'SAR',
      description: 'Basic subscription monthly fee',
      reference_id: 'sub-003',
      status: TransactionStatus.COMPLETED,
      metadata: { subscription_type: 'BASIC' },
      created_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
      completed_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
    },
  ] as WalletTransaction[],

  subscriptionPlans: [
    {
      id: 'plan-basic',
      name: 'Basic Plan',
      type: SubscriptionPlanType.BASIC,
      price: 49.00,
      currency: 'SAR',
      billing_cycle: 'MONTHLY',
      features: ['Up to 50 bids per month', 'Standard matching', 'Basic analytics'],
      bid_fee_discount: 0,
      max_bids_per_month: 50,
      priority_matching: false,
      analytics_access: false,
      is_active: true,
    },
    {
      id: 'plan-pro',
      name: 'Pro Plan',
      type: SubscriptionPlanType.PRO,
      price: 99.00,
      currency: 'SAR',
      billing_cycle: 'MONTHLY',
      features: ['Up to 200 bids per month', 'Priority matching', 'Advanced analytics', 'Featured listings'],
      bid_fee_discount: 10,
      max_bids_per_month: 200,
      priority_matching: true,
      analytics_access: true,
      is_active: true,
    },
    {
      id: 'plan-enterprise',
      name: 'Enterprise Plan',
      type: SubscriptionPlanType.ENTERPRISE,
      price: 299.00,
      currency: 'SAR',
      billing_cycle: 'YEARLY',
      features: ['Unlimited bids', 'Premium matching', 'Full analytics suite', 'Dedicated support', 'Custom branding'],
      bid_fee_discount: 25,
      max_bids_per_month: -1, // Unlimited
      priority_matching: true,
      analytics_access: true,
      is_active: true,
    },
  ] as SubscriptionPlan[],

  subscriptions: [
    {
      id: 'sub-001',
      user_id: 'buyer-002',
      plan_id: 'plan-pro',
      status: SubscriptionStatus.ACTIVE,
      current_period_start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      auto_renew: true,
    },
    {
      id: 'sub-002',
      user_id: 'merchant-001',
      plan_id: 'plan-enterprise',
      status: SubscriptionStatus.ACTIVE,
      current_period_start: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      current_period_end: new Date(Date.now() + 350 * 24 * 60 * 60 * 1000),
      auto_renew: true,
    },
    {
      id: 'sub-003',
      user_id: 'merchant-005',
      plan_id: 'plan-basic',
      status: SubscriptionStatus.ACTIVE,
      current_period_start: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
      current_period_end: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      auto_renew: false,
    },
    {
      id: 'sub-004',
      user_id: 'merchant-002',
      plan_id: 'plan-pro',
      status: SubscriptionStatus.EXPIRED,
      current_period_start: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      current_period_end: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      cancelled_at: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000),
      auto_renew: false,
    },
  ] as Subscription[],

  paymentIntents: [
    {
      id: 'pay-intent-001',
      user_id: 'buyer-001',
      amount: 3000.00,
      currency: 'SAR',
      type: 'DEPOSIT',
      status: 'COMPLETED',
      payment_method: 'credit_card',
      gateway_reference: 'stripe_pi_123456',
      metadata: { card_last4: '4242' },
      created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      completed_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    },
    {
      id: 'pay-intent-002',
      user_id: 'buyer-002',
      amount: 10000.00,
      currency: 'SAR',
      type: 'DEPOSIT',
      status: 'COMPLETED',
      payment_method: 'bank_transfer',
      gateway_reference: 'bt_789012',
      metadata: { bank_name: 'Bank Muscat' },
      created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      completed_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    },
    {
      id: 'pay-intent-003',
      user_id: 'merchant-001',
      amount: 299.00,
      currency: 'SAR',
      type: 'SUBSCRIPTION',
      status: 'COMPLETED',
      payment_method: 'credit_card',
      gateway_reference: 'stripe_pi_345678',
      metadata: { plan_type: 'ENTERPRISE' },
      created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      completed_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    },
  ] as PaymentIntent[],

  refunds: [
    {
      id: 'refund-001',
      payment_intent_id: 'pay-intent-004',
      amount: 25.00,
      currency: 'SAR',
      reason: 'Bid fee refund for expired request',
      status: 'COMPLETED',
      gateway_reference: 'stripe_ref_123',
      processed_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
  ] as Refund[],

  invoices: [
    {
      id: 'inv-001',
      user_id: 'buyer-002',
      type: 'SUBSCRIPTION',
      amount: 99.00,
      currency: 'SAR',
      description: 'Pro Plan - Monthly Subscription',
      status: 'PAID',
      due_date: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
      paid_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      created_at: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000),
    },
    {
      id: 'inv-002',
      user_id: 'merchant-001',
      type: 'SUBSCRIPTION',
      amount: 299.00,
      currency: 'SAR',
      description: 'Enterprise Plan - Yearly Subscription',
      status: 'PAID',
      due_date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      paid_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
    },
    {
      id: 'inv-003',
      user_id: 'merchant-005',
      type: 'SUBSCRIPTION',
      amount: 49.00,
      currency: 'SAR',
      description: 'Basic Plan - Monthly Subscription',
      status: 'PAID',
      due_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      paid_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
      created_at: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000),
    },
  ] as Invoice[],
};

// Helper functions
export const getActiveWallets = () => paymentSeedData.wallets.filter(w => w.status === WalletStatus.ACTIVE);
export const getWalletByUser = (userId: string) => paymentSeedData.wallets.find(w => w.user_id === userId);
export const getTransactionsByWallet = (walletId: string) => paymentSeedData.walletTransactions.filter(t => t.wallet_id === walletId);
export const getActiveSubscriptions = () => paymentSeedData.subscriptions.filter(s => s.status === SubscriptionStatus.ACTIVE);
export const getSubscriptionByUser = (userId: string) => paymentSeedData.subscriptions.find(s => s.user_id === userId);
export const getCompletedTransactions = () => paymentSeedData.walletTransactions.filter(t => t.status === TransactionStatus.COMPLETED);
