import { DataSource } from 'typeorm';
import { Wallet, WalletStatus, TransactionType, TransactionStatus } from '../common/entities/wallet.entity';
import { WalletTransaction } from '../common/entities/wallet-transaction.entity';
import { SubscriptionPlan } from '../common/entities/subscription-plan.entity';
import { Subscription, SubscriptionStatus } from '../common/entities/subscription.entity';
import { PaymentIntent, PaymentIntentStatus, PaymentType, PaymentGateway } from '../common/entities/payment-intent.entity';
import { Invoice, InvoiceStatus, InvoiceType } from '../common/entities/invoice.entity';
import { Refund } from '../common/entities/refund.entity';

export const seedPaymentData = async (dataSource: DataSource) => {
  console.log('🌱 Starting Payment Service seed data...');

  const walletRepository = dataSource.getRepository(Wallet);
  const transactionRepository = dataSource.getRepository(WalletTransaction);
  const planRepository = dataSource.getRepository(SubscriptionPlan);
  const subscriptionRepository = dataSource.getRepository(Subscription);
  const paymentRepository = dataSource.getRepository(PaymentIntent);
  const invoiceRepository = dataSource.getRepository(Invoice);
  const refundRepository = dataSource.getRepository(Refund);

  // Clean existing data
  await refundRepository.clear();
  await invoiceRepository.clear();
  await paymentRepository.clear();
  await subscriptionRepository.clear();
  await planRepository.clear();
  await transactionRepository.clear();
  await walletRepository.clear();

  // Create Subscription Plans
  const subscriptionPlans = [
    {
      id: 'plan-basic',
      name: 'Basic',
      nameAr: 'أساسي',
      description: 'Perfect for small merchants starting out',
      descriptionAr: 'مثالي للتجار الصغار المبتدئين',
      price: 99.00,
      currency: 'SAR',
      billingCycle: 'monthly',
      features: {
        bidsPerMonth: 50,
        featuredRequests: false,
        analyticsAccess: false,
        prioritySupport: false,
        commissionRate: 0.05, // 5%
      },
      isActive: true,
      sortOrder: 1,
    },
    {
      id: 'plan-pro',
      name: 'Professional',
      nameAr: 'احترافي',
      description: 'Great for growing businesses',
      descriptionAr: 'رائع للشركات النامية',
      price: 299.00,
      currency: 'SAR',
      billingCycle: 'monthly',
      features: {
        bidsPerMonth: 200,
        featuredRequests: true,
        analyticsAccess: true,
        prioritySupport: false,
        commissionRate: 0.03, // 3%
      },
      isActive: true,
      sortOrder: 2,
    },
    {
      id: 'plan-enterprise',
      name: 'Enterprise',
      nameAr: 'مؤسسي',
      description: 'For large established businesses',
      descriptionAr: 'للشركات الكبيرة الراسخة',
      price: 999.00,
      currency: 'SAR',
      billingCycle: 'monthly',
      features: {
        bidsPerMonth: -1, // Unlimited
        featuredRequests: true,
        analyticsAccess: true,
        prioritySupport: true,
        commissionRate: 0.02, // 2%
      },
      isActive: true,
      sortOrder: 3,
    },
  ];

  for (const planData of subscriptionPlans) {
    await planRepository.save(planData);
    console.log(`✅ Created subscription plan: ${planData.name}`);
  }

  // Create Wallets for all users
  const wallets = [
    // Admin wallets
    { user_id: 'admin-001', balance: 0.00, status: WalletStatus.ACTIVE },
    { user_id: 'admin-002', balance: 0.00, status: WalletStatus.ACTIVE },
    
    // Buyer wallets
    { user_id: 'buyer-001', balance: 5000.00, status: WalletStatus.ACTIVE },
    { user_id: 'buyer-002', balance: 3000.00, status: WalletStatus.ACTIVE },
    { user_id: 'buyer-003', balance: 7500.00, status: WalletStatus.ACTIVE },
    { user_id: 'buyer-004', balance: 2000.00, status: WalletStatus.ACTIVE },
    { user_id: 'buyer-005', balance: 10000.00, status: WalletStatus.ACTIVE },
    
    // Merchant wallets
    { user_id: 'merchant-001', balance: 15000.00, status: WalletStatus.ACTIVE },
    { user_id: 'merchant-002', balance: 8000.00, status: WalletStatus.ACTIVE },
    { user_id: 'merchant-003', balance: 25000.00, status: WalletStatus.ACTIVE },
    { user_id: 'merchant-004', balance: 12000.00, status: WalletStatus.ACTIVE },
    { user_id: 'merchant-005', balance: 5000.00, status: WalletStatus.ACTIVE },
  ];

  for (const walletData of wallets) {
    await walletRepository.save(walletData);
    console.log(`✅ Created wallet for user: ${walletData.user_id}`);
  }

  // Create Wallet Transactions
  const transactions = [
    // Deposit transactions for buyers
    {
      id: 'txn-001',
      walletId: 'buyer-001',
      type: TransactionType.DEPOSIT,
      amount: 5000.00,
      status: TransactionStatus.COMPLETED,
      description: 'Initial wallet deposit',
      referenceId: 'stripe_pi_deposit_001',
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      completedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    },
    {
      id: 'txn-002',
      walletId: 'buyer-002',
      type: TransactionType.DEPOSIT,
      amount: 3000.00,
      status: TransactionStatus.COMPLETED,
      description: 'Initial wallet deposit',
      referenceId: 'stripe_pi_deposit_002',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      completedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    },
    {
      id: 'txn-003',
      walletId: 'buyer-003',
      type: TransactionType.DEPOSIT,
      amount: 7500.00,
      status: TransactionStatus.COMPLETED,
      description: 'Initial wallet deposit',
      referenceId: 'stripe_pi_deposit_003',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      completedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    },
    
    // Subscription payments for merchants
    {
      id: 'txn-004',
      walletId: 'merchant-001',
      type: TransactionType.SUBSCRIPTION,
      amount: -299.00,
      status: TransactionStatus.COMPLETED,
      description: 'Professional Plan - Monthly Subscription',
      referenceId: 'sub_merchant_001_pro',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
    {
      id: 'txn-005',
      walletId: 'merchant-003',
      type: TransactionType.SUBSCRIPTION,
      amount: -999.00,
      status: TransactionStatus.COMPLETED,
      description: 'Enterprise Plan - Monthly Subscription',
      referenceId: 'sub_merchant_003_enterprise',
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
    {
      id: 'txn-006',
      walletId: 'merchant-002',
      type: TransactionType.SUBSCRIPTION,
      amount: -99.00,
      status: TransactionStatus.COMPLETED,
      description: 'Basic Plan - Monthly Subscription',
      referenceId: 'sub_merchant_002_basic',
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      completedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    },
    
    // Bid fees
    {
      id: 'txn-007',
      walletId: 'merchant-001',
      type: TransactionType.BID_FEE,
      amount: -10.00,
      status: TransactionStatus.COMPLETED,
      description: 'Bid fee for request req-001',
      referenceId: 'bid_merchant_001_req_001',
      createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
      completedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
    },
    {
      id: 'txn-008',
      walletId: 'merchant-002',
      type: TransactionType.BID_FEE,
      amount: -10.00,
      status: TransactionStatus.COMPLETED,
      description: 'Bid fee for request req-002',
      referenceId: 'bid_merchant_002_req_002',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      completedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    },
    
    // Payouts for completed deals
    {
      id: 'txn-009',
      walletId: 'merchant-003',
      type: TransactionType.PAYOUT,
      amount: 2500.00,
      status: TransactionStatus.COMPLETED,
      description: 'Payout for completed deal',
      referenceId: 'deal_completed_merchant_003',
      createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
      completedAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
    },
  ];

  for (const transactionData of transactions) {
    await transactionRepository.save(transactionData);
    console.log(`✅ Created transaction: ${transactionData.type} - ${transactionData.amount}`);
  }

  // Create Subscriptions for merchants
  const subscriptions = [
    {
      id: 'sub-001',
      user_id: 'merchant-001',
      plan_id: 'plan-pro',
      status: SubscriptionStatus.ACTIVE,
      started_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      expires_at: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000),
      auto_renew: true,
    },
    {
      id: 'sub-002',
      user_id: 'merchant-002',
      plan_id: 'plan-basic',
      status: SubscriptionStatus.ACTIVE,
      started_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      expires_at: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      auto_renew: true,
    },
    {
      id: 'sub-003',
      user_id: 'merchant-003',
      plan_id: 'plan-enterprise',
      status: SubscriptionStatus.ACTIVE,
      started_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      expires_at: new Date(Date.now() + 29 * 24 * 60 * 60 * 1000),
      auto_renew: true,
    },
    {
      id: 'sub-004',
      user_id: 'merchant-004',
      plan_id: 'plan-pro',
      status: SubscriptionStatus.ACTIVE,
      started_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      expires_at: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
      auto_renew: false,
    },
    {
      id: 'sub-005',
      user_id: 'merchant-005',
      plan_id: 'plan-basic',
      status: SubscriptionStatus.TRIAL,
      started_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      expires_at: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
      auto_renew: false,
    },
  ];

  for (const subscriptionData of subscriptions) {
    await subscriptionRepository.save(subscriptionData);
    console.log(`✅ Created subscription for merchant: ${subscriptionData.user_id}`);
  }

  // Create Payment Intents
  const paymentIntents = [
    {
      id: 'pi-001',
      user_id: 'buyer-001',
      amount: 5000.00,
      currency: 'SAR',
      status: PaymentIntentStatus.SUCCEEDED,
      payment_type: PaymentType.WALLET_DEPOSIT,
      gateway: PaymentGateway.STRIPE,
      external_reference: 'pi_stripe_001',
      metadata: { type: 'wallet_deposit' },
      created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    },
    {
      id: 'pi-002',
      user_id: 'buyer-002',
      amount: 3000.00,
      currency: 'SAR',
      status: PaymentIntentStatus.SUCCEEDED,
      payment_type: PaymentType.WALLET_DEPOSIT,
      gateway: PaymentGateway.THAWANI,
      external_reference: 'thawani_002',
      metadata: { type: 'wallet_deposit' },
      created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    },
    {
      id: 'pi-003',
      user_id: 'merchant-001',
      amount: 299.00,
      currency: 'SAR',
      status: PaymentIntentStatus.SUCCEEDED,
      payment_type: PaymentType.SUBSCRIPTION,
      gateway: PaymentGateway.STRIPE,
      external_reference: 'pi_stripe_sub_001',
      metadata: { type: 'subscription', planId: 'plan-pro' },
      created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
  ];

  for (const paymentData of paymentIntents) {
    await paymentRepository.save(paymentData);
    console.log(`✅ Created payment intent: ${paymentData.metadata?.type || 'Unknown'}`);
  }

  // Create Invoices
  const invoices = [
    {
      id: 'inv-001',
      user_id: 'merchant-001',
      subscription_id: 'sub-001',
      subtotal: 299.00,
      total: 299.00,
      currency: 'SAR',
      status: InvoiceStatus.PAID,
      type: InvoiceType.SUBSCRIPTION,
      due_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      paid_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      invoice_number: 'INV-2024-001',
      created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
    {
      id: 'inv-002',
      user_id: 'merchant-002',
      subscription_id: 'sub-002',
      subtotal: 99.00,
      total: 99.00,
      currency: 'SAR',
      status: InvoiceStatus.PAID,
      type: InvoiceType.SUBSCRIPTION,
      due_date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      paid_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      invoice_number: 'INV-2024-002',
      created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    },
    {
      id: 'inv-003',
      user_id: 'merchant-003',
      subscription_id: 'sub-003',
      subtotal: 999.00,
      total: 999.00,
      currency: 'SAR',
      status: InvoiceStatus.PAID,
      type: InvoiceType.SUBSCRIPTION,
      due_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      paid_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      invoice_number: 'INV-2024-003',
      created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
  ];

  for (const invoiceData of invoices) {
    await invoiceRepository.save(invoiceData);
    console.log(`✅ Created invoice: ${invoiceData.invoice_number}`);
  }

  console.log('✅ Payment Service seed data completed successfully!');
};
