import { randomBytes } from "node:crypto";
import { appendFileSync, existsSync, readFileSync } from "node:fs";

const file = ".env.local";
const existing = existsSync(file) ? readFileSync(file, "utf8") : "";
if (
  !process.env.BETTER_AUTH_SECRET &&
  !/^BETTER_AUTH_SECRET[ \t]*=[ \t]*["']?[^"'\s#]+/m.test(existing)
) {
  appendFileSync(
    file,
    `\nBETTER_AUTH_SECRET=${randomBytes(32).toString("hex")}\n`,
    { mode: 0o600 },
  );
  console.log("Created a private authentication secret in .env.local.");
}
if (
  !process.env.BETTER_AUTH_URL &&
  !/^BETTER_AUTH_URL[ \t]*=[ \t]*["']?[^"'\s#]+/m.test(existing)
) {
  appendFileSync(file, "BETTER_AUTH_URL=http://localhost:3000\n", {
    mode: 0o600,
  });
}
