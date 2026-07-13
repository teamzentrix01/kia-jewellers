import "dotenv/config";
import bcrypt from "bcryptjs";
import pkg from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const { PrismaClient } = pkg;

// PostgreSQL pool create karo
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

// Prisma client with adapter
const prisma = new PrismaClient({
  adapter: new PrismaPg(pool),
});

async function createAdmin() {
  try {
    const hashed = await bcrypt.hash("admin123", 10);

    const user = await prisma.user.create({
      data: {
        email: "admin@gmail.com",
        password: hashed,
        role: "admin",
      },
    });

    console.log("✅ Admin Created:", user);
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
