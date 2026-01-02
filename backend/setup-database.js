#!/usr/bin/env node

/**
 * Database Setup Helper
 * Helps configure database connection for Thrive backend
 */

const readline = require('readline');
const fs = require('fs');
const path = require('path');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function setupDatabase() {
  console.log('\n🗄️  Thrive Database Setup');
  console.log('=========================\n');
  
  const envPath = path.join(__dirname, '.env');
  let envContent = '';
  
  // Read existing .env if it exists
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
  }
  
  console.log('Choose your database option:\n');
  console.log('1. Use free cloud database (Neon/Supabase) - RECOMMENDED');
  console.log('2. Use local PostgreSQL (requires setup)');
  console.log('3. Just update .env file manually\n');
  
  const choice = await question('Enter your choice (1-3): ');
  
  let databaseUrl = '';
  
  if (choice === '1') {
    console.log('\n📦 Cloud Database Setup (Recommended)');
    console.log('=====================================\n');
    console.log('Option A: Neon (neon.tech)');
    console.log('  - Go to: https://neon.tech');
    console.log('  - Sign up for free');
    console.log('  - Create a new project');
    console.log('  - Copy the connection string\n');
    
    console.log('Option B: Supabase (supabase.com)');
    console.log('  - Go to: https://supabase.com');
    console.log('  - Sign up for free');
    console.log('  - Create a new project');
    console.log('  - Go to Settings > Database');
    console.log('  - Copy the connection string (use connection pooling)\n');
    
    const connectionString = await question('Paste your database connection string: ');
    databaseUrl = connectionString.trim();
    
  } else if (choice === '2') {
    console.log('\n💻 Local PostgreSQL Setup');
    console.log('========================\n');
    
    console.log('First, let\'s try to set up local PostgreSQL...\n');
    
    const username = await question('PostgreSQL username (usually your macOS username or "postgres"): ') || process.env.USER || 'eniolafarinde';
    const password = await question('PostgreSQL password (press enter if no password): ');
    const dbName = await question('Database name [thrive]: ') || 'thrive';
    
    if (password) {
      databaseUrl = `postgresql://${username}:${password}@localhost:5432/${dbName}?schema=public`;
    } else {
      databaseUrl = `postgresql://${username}@localhost:5432/${dbName}?schema=public`;
    }
    
    console.log('\n⚠️  Note: If this doesn\'t work, you may need to:');
    console.log('   1. Start PostgreSQL: brew services start postgresql@15');
    console.log('   2. Create database: createdb thrive');
    console.log('   3. Configure trust auth (see fix-postgres-auth.sh)\n');
    
  } else {
    console.log('\n📝 Manual .env Update');
    console.log('====================\n');
    const url = await question('Enter your DATABASE_URL: ');
    databaseUrl = url.trim();
  }
  
  // Update or create .env file
  const envVars = {
    DATABASE_URL: databaseUrl,
    JWT_SECRET: 'your-super-secret-jwt-key-change-in-production-min-32-chars-please-make-this-very-long-and-secure',
    JWT_EXPIRES_IN: '7d',
    PORT: '5000',
    NODE_ENV: 'development',
    FRONTEND_URL: 'http://localhost:3000'
  };
  
  // Parse existing .env if it exists
  const existingVars = {};
  if (envContent) {
    envContent.split('\n').forEach(line => {
      const match = line.match(/^([^#=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        let value = match[2].trim();
        // Remove quotes if present
        if ((value.startsWith('"') && value.endsWith('"')) || 
            (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }
        existingVars[key] = value;
      }
    });
  }
  
  // Merge with new values
  const finalVars = { ...existingVars, ...envVars };
  
  // Write .env file
  let newEnvContent = '# Thrive Backend Configuration\n';
  newEnvContent += '# Database\n';
  newEnvContent += `DATABASE_URL="${finalVars.DATABASE_URL}"\n\n`;
  newEnvContent += '# JWT\n';
  newEnvContent += `JWT_SECRET="${finalVars.JWT_SECRET}"\n`;
  newEnvContent += `JWT_EXPIRES_IN="${finalVars.JWT_EXPIRES_IN}"\n\n`;
  newEnvContent += '# Server\n';
  newEnvContent += `PORT=${finalVars.PORT}\n`;
  newEnvContent += `NODE_ENV=${finalVars.NODE_ENV}\n\n`;
  newEnvContent += '# Frontend URL (for CORS)\n';
  newEnvContent += `FRONTEND_URL=${finalVars.FRONTEND_URL}\n`;
  
  fs.writeFileSync(envPath, newEnvContent);
  
  console.log('\n✅ .env file updated successfully!\n');
  console.log('Next steps:');
  console.log('1. Run migrations: npm run prisma:migrate');
  console.log('2. Start server: npm run dev\n');
  
  rl.close();
}

setupDatabase().catch(err => {
  console.error('Error:', err);
  rl.close();
  process.exit(1);
});

