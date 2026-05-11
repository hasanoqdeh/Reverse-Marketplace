#!/usr/bin/env node

import { runSeeding, SeedConfig } from './seed-data/master-seed';

// Parse command line arguments
const args = process.argv.slice(2);
const config: Partial<SeedConfig> = {};

// Parse arguments
for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  
  switch (arg) {
    case '--cleanup':
      config.cleanup = true;
      break;
    case '--verbose':
      config.verbose = true;
      break;
    case '--identity-only':
      config.services = { identity: true, request: false, matching: false, bidding: false, chat: false, payment: false };
      break;
    case '--request-only':
      config.services = { identity: false, request: true, matching: false, bidding: false, chat: false, payment: false };
      break;
    case '--matching-only':
      config.services = { identity: false, request: false, matching: true, bidding: false, chat: false, payment: false };
      break;
    case '--bidding-only':
      config.services = { identity: false, request: false, matching: false, bidding: true, chat: false, payment: false };
      break;
    case '--chat-only':
      config.services = { identity: false, request: false, matching: false, bidding: false, chat: true, payment: false };
      break;
    case '--payment-only':
      config.services = { identity: false, request: false, matching: false, bidding: false, chat: false, payment: true };
      break;
    case '--help':
    case '-h':
      console.log(`
Reverse Marketplace Database Seeder

Usage: npm run seed [options]

Options:
  --cleanup              Clean existing data before seeding
  --verbose              Enable verbose logging
  --identity-only        Seed only Identity Service
  --request-only         Seed only Request Service
  --matching-only        Seed only Matching Engine
  --bidding-only         Seed only Bidding Service
  --chat-only            Seed only Chat Service
  --payment-only         Seed only Payment Service
  --help, -h             Show this help message

Examples:
  npm run seed                           # Seed all services
  npm run seed --cleanup                 # Clean and seed all services
  npm run seed --identity-only           # Seed only identity data
  npm run seed --request-only --cleanup  # Clean and seed only request data
      `);
      process.exit(0);
      break;
    default:
      console.error(`Unknown option: ${arg}`);
      console.error('Use --help for available options');
      process.exit(1);
  }
}

// Run seeding
runSeeding(config)
  .then(() => {
    console.log('\n🎉 Seeding completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Seeding failed:', error);
    process.exit(1);
  });
