// Path: prisma.config.ts
import "dotenv/config";
import { defineConfig } from "@prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // DATABASE_URL aapki .env file se yahan aayegi
    url: process.env["DATABASE_URL"],
  },
});