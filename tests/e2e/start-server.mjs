import { execFileSync, spawn } from "node:child_process";
import { randomBytes } from "node:crypto";
import {
  cpSync,
  existsSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { adminCredentials } from "./auth-credentials.mjs";

const projectDir = resolve(".");
const tempDir = mkdtempSync(join(tmpdir(), "recipes-e2e-"));
const nextEnvPath = join(projectDir, "next-env.d.ts");
const originalNextEnv = existsSync(nextEnvPath)
  ? readFileSync(nextEnvPath)
  : null;
const nextCli = join(projectDir, "node_modules/next/dist/bin/next");
const prismaCli = join(projectDir, "node_modules/prisma/build/index.js");
const env = {
  ...process.env,
  BETTER_AUTH_SECRET: randomBytes(32).toString("hex"),
  BETTER_AUTH_URL: `http://127.0.0.1:${process.env.RECIPES_TEST_PORT ?? "3100"}`,
  RECIPES_ADMIN_NAME: adminCredentials.name,
  RECIPES_ADMIN_EMAIL: adminCredentials.email,
  RECIPES_ADMIN_PASSWORD: adminCredentials.password,
  RECIPES_DATABASE_URL: `file:${join(tempDir, "local.db")}`,
  RECIPES_NEXT_DIST_DIR: ".next-e2e",
  RECIPES_TSCONFIG_PATH: "tsconfig.e2e.json",
};
let server;
let stopping = false;

process.on("exit", () => {
  if (originalNextEnv) writeFileSync(nextEnvPath, originalNextEnv);
  else rmSync(nextEnvPath, { force: true });
  rmSync(tempDir, { recursive: true, force: true });
});
for (const signal of ["SIGTERM", "SIGINT"]) {
  process.on(signal, () => {
    stopping = true;
    if (server) server.kill(signal);
    else process.exit(0);
  });
}

try {
  cpSync(
    join(projectDir, "prisma/schema.prisma"),
    join(tempDir, "schema.prisma"),
  );
  cpSync(join(projectDir, "prisma/migrations"), join(tempDir, "migrations"), {
    recursive: true,
  });
  writeFileSync(join(tempDir, "local.db"), "");
  execFileSync(
    process.execPath,
    [
      prismaCli,
      "migrate",
      "deploy",
      "--schema",
      join(tempDir, "schema.prisma"),
    ],
    { stdio: "inherit" },
  );
  execFileSync(
    process.execPath,
    [
      join(projectDir, "node_modules/tsx/dist/cli.mjs"),
      "scripts/create-admin.ts",
    ],
    { env, stdio: "inherit" },
  );
  execFileSync(process.execPath, [nextCli, "build"], { env, stdio: "inherit" });
  server = spawn(
    process.execPath,
    [
      nextCli,
      "start",
      "--hostname",
      "127.0.0.1",
      "--port",
      process.env.RECIPES_TEST_PORT ?? "3100",
    ],
    { env, stdio: "inherit" },
  );
  server.on("error", (error) => {
    console.error(error);
    process.exit(1);
  });
  server.on("exit", (code) => process.exit(stopping ? 0 : (code ?? 1)));
} catch (error) {
  console.error(error);
  process.exit(1);
}
