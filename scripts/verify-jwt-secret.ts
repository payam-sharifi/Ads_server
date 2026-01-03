#!/usr/bin/env ts-node
/**
 * JWT Secret Verification Script
 * 
 * این اسکریپت برای بررسی اینکه JWT_SECRET در همه جا یکسان است استفاده می‌شود.
 * 
 * Usage:
 *   npm run verify-jwt-secret
 *   یا
 *   ts-node scripts/verify-jwt-secret.ts
 */

import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables
dotenv.config();

interface JWTSecretLocation {
  file: string;
  line: number;
  value: string;
  source: 'env' | 'default' | 'hardcoded';
}

function findJWTSecretInCode(): JWTSecretLocation[] {
  const locations: JWTSecretLocation[] = [];
  const codebasePath = path.join(__dirname, '..', 'src');
  
  // Files that use JWT_SECRET
  const filesToCheck = [
    'modules/auth/auth.module.ts',
    'strategies/jwt.strategy.ts',
    'guards/jwt-auth.guard.ts',
  ];

  filesToCheck.forEach((relativePath) => {
    const filePath = path.join(codebasePath, relativePath);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      const lines = content.split('\n');
      
      lines.forEach((line, index) => {
        if (line.includes('JWT_SECRET')) {
          const lineNumber = index + 1;
          let source: 'env' | 'default' | 'hardcoded' = 'env';
          let value = 'process.env.JWT_SECRET';
          
          if (line.includes('process.env.JWT_SECRET')) {
            source = 'env';
            // Check if there's a default value
            const defaultMatch = line.match(/process\.env\.JWT_SECRET\s*\|\|\s*['"]([^'"]+)['"]/);
            if (defaultMatch) {
              source = 'default';
              value = defaultMatch[1];
            } else {
              value = 'process.env.JWT_SECRET';
            }
          } else if (line.match(/['"][^'"]+['"]/)) {
            source = 'hardcoded';
            const hardcodedMatch = line.match(/['"]([^'"]+)['"]/);
            if (hardcodedMatch) {
              value = hardcodedMatch[1];
            }
          }
          
          locations.push({
            file: relativePath,
            line: lineNumber,
            value,
            source,
          });
        }
      });
    }
  });

  return locations;
}

function main() {
  console.log('🔍 بررسی JWT_SECRET در کد و environment...\n');

  // Check environment variable
  const envSecret = process.env.JWT_SECRET;
  console.log('📋 Environment Variable:');
  if (envSecret) {
    console.log(`   ✅ JWT_SECRET موجود است`);
    console.log(`   📝 طول: ${envSecret.length} کاراکتر`);
    console.log(`   🔒 مقدار: ${envSecret.substring(0, 10)}... (مخفف شده)`);
  } else {
    console.log(`   ⚠️  JWT_SECRET در environment variables موجود نیست!`);
    console.log(`   💡 از default value استفاده خواهد شد`);
  }

  // Check .env file
  const envFilePath = path.join(__dirname, '..', '.env');
  console.log('\n📄 فایل .env:');
  if (fs.existsSync(envFilePath)) {
    const envContent = fs.readFileSync(envFilePath, 'utf-8');
    const envMatch = envContent.match(/JWT_SECRET=(.+)/);
    if (envMatch) {
      const envFileSecret = envMatch[1].trim();
      console.log(`   ✅ JWT_SECRET در .env موجود است`);
      console.log(`   📝 طول: ${envFileSecret.length} کاراکتر`);
      
      // Compare with environment variable
      if (envSecret && envFileSecret !== envSecret) {
        console.log(`   ⚠️  هشدار: JWT_SECRET در .env با environment variable متفاوت است!`);
      } else if (envSecret) {
        console.log(`   ✅ JWT_SECRET در .env با environment variable یکسان است`);
      }
    } else {
      console.log(`   ⚠️  JWT_SECRET در .env موجود نیست`);
    }
  } else {
    console.log(`   ⚠️  فایل .env موجود نیست`);
  }

  // Check code
  console.log('\n💻 بررسی کد:');
  const locations = findJWTSecretInCode();
  if (locations.length > 0) {
    locations.forEach((loc) => {
      console.log(`   📍 ${loc.file}:${loc.line}`);
      console.log(`      منبع: ${loc.source === 'env' ? 'Environment Variable' : loc.source === 'default' ? 'Default Value' : 'Hardcoded'}`);
      if (loc.source === 'default' || loc.source === 'hardcoded') {
        console.log(`      مقدار: ${loc.value.substring(0, 20)}...`);
      }
    });
    
    // Check if all use env
    const allUseEnv = locations.every(loc => loc.source === 'env');
    if (allUseEnv) {
      console.log(`\n   ✅ همه فایل‌ها از environment variable استفاده می‌کنند`);
    } else {
      console.log(`\n   ⚠️  هشدار: برخی فایل‌ها از default یا hardcoded value استفاده می‌کنند`);
    }
  } else {
    console.log(`   ⚠️  هیچ استفاده‌ای از JWT_SECRET در کد پیدا نشد`);
  }

  // Recommendations
  console.log('\n💡 توصیه‌ها:');
  if (!envSecret) {
    console.log('   1. JWT_SECRET را در environment variables تنظیم کنید');
  }
  if (locations.some(loc => loc.source === 'hardcoded')) {
    console.log('   2. Hardcoded JWT_SECRET را حذف کنید و از environment variable استفاده کنید');
  }
  if (locations.some(loc => loc.source === 'default')) {
    console.log('   3. در production، همیشه JWT_SECRET را در environment variables تنظیم کنید');
  }
  console.log('   4. مطمئن شوید JWT_SECRET در همه محیط‌ها (dev, staging, prod) یکسان است');
  console.log('   5. اگر JWT_SECRET تغییر کرد، کاربران باید دوباره لاگین کنند');

  console.log('\n✅ بررسی کامل شد\n');
}

main();

