import { stdin, stdout } from "node:process";
import { createInterface } from "node:readline/promises";
import { Writable } from "node:stream";
import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());

async function main() {
  const { auth } = await import("../src/lib/auth");
  const { prisma } = await import("../src/lib/prisma");
  try {
    if (await prisma.user.findFirst({ where: { role: "admin" } })) {
      console.log("An administrator is already configured.");
      return;
    }
    let name = process.env.RECIPES_ADMIN_NAME;
    let email = process.env.RECIPES_ADMIN_EMAIL;
    let password = process.env.RECIPES_ADMIN_PASSWORD;
    if (!name || !email || !password) {
      if (!stdin.isTTY)
        throw new Error(
          "Run this command in a terminal to enter your administrator details.",
        );
      const input = createInterface({ input: stdin, output: stdout });
      try {
        name = (await input.question("Your name: ")).trim();
        email = (await input.question("Email: ")).trim();
      } finally {
        input.close();
      }
      stdout.write("Password (at least 12 characters; hidden): ");
      const muted = new Writable({
        write(_chunk, _encoding, callback) {
          callback();
        },
      });
      const secretInput = createInterface({
        input: stdin,
        output: muted,
        terminal: true,
      });
      try {
        password = await secretInput.question("");
      } finally {
        secretInput.close();
        stdout.write("\n");
      }
    }
    if (!name || !email || !password || password.length < 12) {
      throw new Error(
        "Name, email and a password of at least 12 characters are required.",
      );
    }
    const account = await auth.api.signUpEmail({
      body: { name, email, password },
    });
    await prisma.user.update({
      where: { id: account.user.id },
      data: { role: "admin" },
    });
    console.log(
      "Administrator created. Sign in using the email and password you entered.",
    );
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  // Do not print request bodies or credentials from library exceptions.
  console.error(
    error instanceof Error ? error.message : "Administrator setup failed.",
  );
  process.exitCode = 1;
});
