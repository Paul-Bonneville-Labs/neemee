#!/usr/bin/env node

// Test environment variable loading
console.log('Testing environment variables...');
console.log('BACKEND_API_URL:', process.env.BACKEND_API_URL);
console.log('BACKEND_API_KEY:', process.env.BACKEND_API_KEY ? 'SET' : 'NOT_SET');

const fs = require('fs');
const path = require('path');

// Check .env.local file
const envPath = path.join(__dirname, '.env.local');
try {
  const envContent = fs.readFileSync(envPath, 'utf8');
  console.log('\n.env.local content:');
  console.log(envContent);
} catch (error) {
  console.log('Error reading .env.local:', error.message);
}

// Try to require dotenv to load the file
try {
  require('dotenv').config({ path: envPath });
  console.log('\nAfter dotenv.config():');
  console.log('BACKEND_API_URL:', process.env.BACKEND_API_URL);
  console.log('BACKEND_API_KEY:', process.env.BACKEND_API_KEY ? 'SET' : 'NOT_SET');
} catch (error) {
  console.log('\nDotenv error:', error.message);
}