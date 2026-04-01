require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ 
      adapter, 
      log: ['query', 'info', 'warn', 'error'] 
  });

  try {
    const session = await prisma.session.findFirst({
        include: {
            questions: {
                include: { answer: true }
            }
        }
    });
    console.log("Success:", session ? session.id : "null");
  } catch (e) {
    console.error("Error Message:", e.message);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}
main();
