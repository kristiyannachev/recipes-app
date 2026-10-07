import { prismaAdapter } from "@better-auth/prisma-adapter";
import { betterAuth } from "better-auth/minimal";
import { prisma } from "./prisma";

if (!process.env.BETTER_AUTH_SECRET)
  throw new Error("Authentication secret missing. Run npm run setup first.");

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "sqlite" }),
  baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
  secret: process.env.BETTER_AUTH_SECRET,
  emailAndPassword: { enabled: true, minPasswordLength: 12 },
  user: {
    additionalFields: {
      role: { type: "string", defaultValue: "user", input: false },
    },
  },
  session: { cookieCache: { enabled: false } },
  advanced: {
    useSecureCookies: (process.env.BETTER_AUTH_URL ?? "").startsWith(
      "https://",
    ),
  },
  rateLimit: { enabled: true },
});
