import { PrismaClient } from "@prisma/client";
import { env } from "@/lib/env";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

export function getPrisma() {
  if (!globalForPrisma.prisma) {
    if (env.DATABASE_URL) {
      process.env.DATABASE_URL = env.DATABASE_URL;
    }
    if (env.DIRECT_URL) {
      process.env.DIRECT_URL = env.DIRECT_URL;
    }
    globalForPrisma.prisma = new PrismaClient({
      log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    });
  }

  return globalForPrisma.prisma;
}
