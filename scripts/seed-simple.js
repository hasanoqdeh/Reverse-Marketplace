#!/usr/bin/env node

// Simple JavaScript seed runner for testing
const path = require('path');
const fs = require('fs');

console.log('🌱 Reverse Marketplace Database Seeder (Simple Version)');
console.log('==========================================================');

// Check if Docker is available
const { execSync } = require('child_process');

function checkDocker() {
  try {
    execSync('docker --version', { stdio: 'ignore' });
    return true;
  } catch (error) {
    return false;
  }
}

function runDockerSeed(args = []) {
  const composeFile = 'scripts/docker-compose.seed.yml';
  let command = `docker compose -f ${composeFile} up --build seed-runner`;
  
  // Pass arguments as environment variables for Docker
  const envVars = {};
  if (args.includes('--cleanup')) envVars.CLEANUP = 'true';
  if (args.includes('--identity-only')) envVars.SERVICE = 'identity';
  if (args.includes('--request-only')) envVars.SERVICE = 'request';
  if (args.includes('--matching-only')) envVars.SERVICE = 'matching';
  if (args.includes('--bidding-only')) envVars.SERVICE = 'bidding';
  if (args.includes('--chat-only')) envVars.SERVICE = 'chat';
  if (args.includes('--payment-only')) envVars.SERVICE = 'payment';
  
  // Build environment string
  const envString = Object.entries(envVars)
    .map(([key, value]) => `${key}=${value}`)
    .join(' ');
  
  if (envString) {
    command = `${envString} ${command}`;
  }
  
  console.log('🐳 Running seed in Docker...');
  console.log(`Command: ${command}`);
  
  try {
    execSync(command, { stdio: 'inherit', cwd: process.cwd() });
    console.log('✅ Docker seeding completed successfully!');
  } catch (error) {
    console.error('❌ Docker seeding failed:', error.message);
    console.log('\n💡 Troubleshooting:');
    console.log('1. Make sure Docker is running');
    console.log('2. Check if ports 5432, 6379, 27018, 9042, 5672 are available');
    console.log('3. Try: npm run seed:docker:databases first, then npm run seed:docker');
    process.exit(1);
  }
}

function showHelp() {
  console.log(`
Reverse Marketplace Docker Database Seeder

Usage: node scripts/seed-simple.js [options]

Options:
  --cleanup              Clean existing data before seeding
  --identity-only        Seed only Identity Service
  --request-only         Seed only Request Service
  --matching-only        Seed only Matching Engine
  --bidding-only         Seed only Bidding Service
  --chat-only            Seed only Chat Service
  --payment-only         Seed only Payment Service
  --databases-only       Start only databases (no seeding)
  --stop                 Stop and remove all containers
  --help, -h             Show this help message

NPM Scripts (recommended):
  npm run seed:docker              # Seed all services
  npm run seed:docker:cleanup      # Clean and seed all services
  npm run seed:docker:databases    # Start databases only
  npm run seed:docker:stop         # Stop all containers

Examples:
  node scripts/seed-simple.js                    # Seed all services
  node scripts/seed-simple.js --cleanup          # Clean and seed
  node scripts/seed-simple.js --identity-only     # Seed identity only
  node scripts/seed-simple.js --databases-only    # Start databases only
  node scripts/seed-simple.js --stop              # Stop containers
  `);
}

// Parse command line arguments
const args = process.argv.slice(2);

if (!checkDocker()) {
  console.error('❌ Docker is not installed or not running');
  console.log('Please install Docker and ensure it is running before proceeding.');
  process.exit(1);
}

// Handle commands
if (args.includes('--help') || args.includes('-h')) {
  showHelp();
  process.exit(0);
}

if (args.includes('--stop')) {
  console.log('🛑 Stopping Docker containers...');
  try {
    execSync('docker compose -f scripts/docker-compose.seed.yml down -v', { stdio: 'inherit' });
    console.log('✅ All containers stopped and removed');
  } catch (error) {
    console.error('❌ Failed to stop containers:', error.message);
  }
  process.exit(0);
}

if (args.includes('--databases-only')) {
  console.log('🗄️ Starting databases only...');
  try {
    execSync('docker compose -f scripts/docker-compose.seed.yml up -d postgres redis mongo cassandra rabbitmq', { stdio: 'inherit' });
    console.log('✅ Databases started successfully');
    console.log('📊 Database URLs:');
    console.log('   PostgreSQL: localhost:5432');
    console.log('   Redis: localhost:6379');
    console.log('   MongoDB: localhost:27018');
    console.log('   Cassandra: localhost:9042');
    console.log('   RabbitMQ: localhost:5672 (Management: localhost:15672)');
  } catch (error) {
    console.error('❌ Failed to start databases:', error.message);
  }
  process.exit(0);
}

// Convert arguments to Docker command format
const dockerArgs = [];
if (args.includes('--cleanup')) {
  dockerArgs.push('--cleanup');
}
if (args.includes('--identity-only')) {
  dockerArgs.push('--identity-only');
}
if (args.includes('--request-only')) {
  dockerArgs.push('--request-only');
}
if (args.includes('--matching-only')) {
  dockerArgs.push('--matching-only');
}
if (args.includes('--bidding-only')) {
  dockerArgs.push('--bidding-only');
}
if (args.includes('--chat-only')) {
  dockerArgs.push('--chat-only');
}
if (args.includes('--payment-only')) {
  dockerArgs.push('--payment-only');
}

// Run Docker seeding
runDockerSeed(dockerArgs);
