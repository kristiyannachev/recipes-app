import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { PrismaClient } from "@prisma/client";

const legacy = resolve("prisma/dev.db");
const local = resolve("prisma/local.db");
if (existsSync(legacy) && !existsSync(local)) {
  const source = new PrismaClient({ datasourceUrl: `file:${legacy}` });
  try {
    // SQLite's backup includes committed WAL data and leaves the original intact.
    await source.$executeRawUnsafe("VACUUM INTO ?", local);
    console.log("Copied existing recipes into the private local database.");
  } finally {
    await source.$disconnect();
  }
}
