/**
 * Simple API Test Script for Thrive Backend
 * 
 * This script tests the authentication endpoints
 * Make sure the server is running before executing this script
 */

const BASE_URL = process.env.API_URL || 'http://localhost:5000';

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

let authToken = null;
let userId = null;

// Helper function to make HTTP requests
async function request(method, endpoint, data = null, token = null) {
  const url = `${BASE_URL}${endpoint}`;
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (token) {
    options.headers['Authorization'] = `Bearer ${token}`;
  }

  if (data) {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(url, options);
    const json = await response.json();
    return { status: response.status, data: json };
  } catch (error) {
    return { error: error.message };
  }
}

// Test functions
async function testHealthCheck() {
  console.log('\n🔍 Testing Health Check...');
  const result = await request('GET', '/health');
  
  if (result.status === 200 && result.data.success) {
    console.log(`${colors.green}✅ Health check passed${colors.reset}`);
    return true;
  } else {
    console.log(`${colors.red}❌ Health check failed${colors.reset}`, result);
    return false;
  }
}

async function testRegister() {
  console.log('\n🔍 Testing User Registration...');
  
  // Generate unique email for testing
  const timestamp = Date.now();
  const testEmail = `test${timestamp}@example.com`;
  
  const result = await request('POST', '/api/auth/register', {
    email: testEmail,
    password: 'testpassword123',
    name: 'Test User',
    alias: 'Tester',
    bio: 'This is a test user',
  });

  if (result.status === 201 && result.data.success) {
    console.log(`${colors.green}✅ Registration successful${colors.reset}`);
    authToken = result.data.data.token;
    userId = result.data.data.user.id;
    console.log(`   Token: ${authToken.substring(0, 20)}...`);
    return true;
  } else {
    console.log(`${colors.red}❌ Registration failed${colors.reset}`, result.data);
    return false;
  }
}

async function testLogin() {
  console.log('\n🔍 Testing User Login...');
  
  const timestamp = Date.now();
  const testEmail = `test${timestamp}@example.com`;
  
  // First register a user
  const registerResult = await request('POST', '/api/auth/register', {
    email: testEmail,
    password: 'testpassword123',
    name: 'Login Test User',
  });

  if (registerResult.status !== 201) {
    console.log(`${colors.red}❌ Could not create user for login test${colors.reset}`);
    return false;
  }

  // Then try to login
  const result = await request('POST', '/api/auth/login', {
    email: testEmail,
    password: 'testpassword123',
  });

  if (result.status === 200 && result.data.success) {
    console.log(`${colors.green}✅ Login successful${colors.reset}`);
    authToken = result.data.data.token;
    return true;
  } else {
    console.log(`${colors.red}❌ Login failed${colors.reset}`, result.data);
    return false;
  }
}

async function testLoginWithWrongPassword() {
  console.log('\n🔍 Testing Login with Wrong Password...');
  
  const timestamp = Date.now();
  const testEmail = `test${timestamp}@example.com`;
  
  // First register a user
  await request('POST', '/api/auth/register', {
    email: testEmail,
    password: 'testpassword123',
    name: 'Login Test User',
  });

  // Try to login with wrong password
  const result = await request('POST', '/api/auth/login', {
    email: testEmail,
    password: 'wrongpassword',
  });

  if (result.status === 401) {
    console.log(`${colors.green}✅ Correctly rejected wrong password${colors.reset}`);
    return true;
  } else {
    console.log(`${colors.red}❌ Should have rejected wrong password${colors.reset}`, result);
    return false;
  }
}

async function testGetMe() {
  console.log('\n🔍 Testing Get Current User (Protected Route)...');
  
  if (!authToken) {
    console.log(`${colors.yellow}⚠️  Skipping - no auth token available${colors.reset}`);
    return false;
  }

  const result = await request('GET', '/api/auth/me', null, authToken);

  if (result.status === 200 && result.data.success) {
    console.log(`${colors.green}✅ Get current user successful${colors.reset}`);
    console.log(`   User: ${result.data.data.user.name} (${result.data.data.user.email})`);
    return true;
  } else {
    console.log(`${colors.red}❌ Get current user failed${colors.reset}`, result.data);
    return false;
  }
}

async function testGetMeWithoutToken() {
  console.log('\n🔍 Testing Get Current User Without Token...');
  
  const result = await request('GET', '/api/auth/me');

  if (result.status === 401) {
    console.log(`${colors.green}✅ Correctly rejected request without token${colors.reset}`);
    return true;
  } else {
    console.log(`${colors.red}❌ Should have rejected request without token${colors.reset}`, result);
    return false;
  }
}

async function testRegisterDuplicateEmail() {
  console.log('\n🔍 Testing Registration with Duplicate Email...');
  
  const timestamp = Date.now();
  const testEmail = `test${timestamp}@example.com`;
  
  // Register first user
  await request('POST', '/api/auth/register', {
    email: testEmail,
    password: 'testpassword123',
    name: 'First User',
  });

  // Try to register again with same email
  const result = await request('POST', '/api/auth/register', {
    email: testEmail,
    password: 'testpassword123',
    name: 'Second User',
  });

  if (result.status === 409) {
    console.log(`${colors.green}✅ Correctly rejected duplicate email${colors.reset}`);
    return true;
  } else {
    console.log(`${colors.red}❌ Should have rejected duplicate email${colors.reset}`, result);
    return false;
  }
}

// Run all tests
async function runTests() {
  console.log(`${colors.blue}═══════════════════════════════════════${colors.reset}`);
  console.log(`${colors.blue}    Thrive API Test Suite${colors.reset}`);
  console.log(`${colors.blue}═══════════════════════════════════════${colors.reset}`);
  console.log(`Base URL: ${BASE_URL}\n`);

  const results = {
    passed: 0,
    failed: 0,
  };

  const tests = [
    { name: 'Health Check', fn: testHealthCheck },
    { name: 'Register', fn: testRegister },
    { name: 'Login', fn: testLogin },
    { name: 'Login with Wrong Password', fn: testLoginWithWrongPassword },
    { name: 'Get Current User', fn: testGetMe },
    { name: 'Get Current User Without Token', fn: testGetMeWithoutToken },
    { name: 'Register Duplicate Email', fn: testRegisterDuplicateEmail },
  ];

  for (const test of tests) {
    try {
      const passed = await test.fn();
      if (passed) {
        results.passed++;
      } else {
        results.failed++;
      }
    } catch (error) {
      console.log(`${colors.red}❌ Test "${test.name}" threw an error:${colors.reset}`, error.message);
      results.failed++;
    }
  }

  // Summary
  console.log('\n' + colors.blue + '═══════════════════════════════════════' + colors.reset);
  console.log(`${colors.blue}    Test Summary${colors.reset}`);
  console.log(colors.blue + '═══════════════════════════════════════' + colors.reset);
  console.log(`${colors.green}✅ Passed: ${results.passed}${colors.reset}`);
  console.log(`${colors.red}❌ Failed: ${results.failed}${colors.reset}`);
  console.log(`Total: ${results.passed + results.failed}\n`);

  if (results.failed === 0) {
    console.log(`${colors.green}🎉 All tests passed!${colors.reset}\n`);
    process.exit(0);
  } else {
    console.log(`${colors.red}⚠️  Some tests failed${colors.reset}\n`);
    process.exit(1);
  }
}

// Check if fetch is available (Node 18+)
if (typeof fetch === 'undefined') {
  console.error('❌ This script requires Node.js 18+ with native fetch support');
  console.error('   Alternatively, install node-fetch: npm install node-fetch');
  process.exit(1);
}

// Run tests
runTests().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});


