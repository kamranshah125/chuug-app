import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var prismaGlobal: PrismaClient;
}

// Use a global Prisma client in development to avoid multiple instances
const prisma =
  global.prismaGlobal ||
  new PrismaClient({
    log: ["query", "info", "warn", "error"], // optional, helpful for debugging
  });

if (process.env.NODE_ENV !== "production") {
  global.prismaGlobal = prisma;
}

export default prisma;
export { prisma };
