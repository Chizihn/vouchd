import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient({
  log:
    process.env.NODE_ENV === "development"
      ? ["query", "error", "warn"]
      : ["error"],
});

// Connection test
prisma
  .$connect()
  .then(() => console.log("✅ Database connected"))
  .catch((error) => console.error("❌ Database connection failed:", error));
