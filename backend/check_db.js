require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function check() {
  try {
    console.log('Testing Prisma Connection...');
    await prisma.$connect();
    console.log('✅ Base Connection Successful');

    console.log('Verifying User table accessibility...');
    const userCount = await prisma.user.count();
    console.log(`✅ User table exists (Count: ${userCount})`);

    const clientID = process.env.GOOGLE_CLIENT_ID;
    console.log(`Checking GOOGLE_CLIENT_ID: ${clientID ? 'SET (ends in ' + clientID.slice(-10) + ')' : 'MISSING'}`);

    const jwtSecret = process.env.JWT_SECRET;
    console.log(`Checking JWT_SECRET: ${jwtSecret ? 'SET' : 'MISSING'}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error during database check:');
    console.error(error.message);
    if (error.code === 'P2021') {
      console.error('Table does not exist. Did you run prisma db push?');
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

check();
