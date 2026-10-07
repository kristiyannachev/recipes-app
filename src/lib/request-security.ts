export function isTrustedMutation(request: Request) {
  const origin = request.headers.get("origin");
  const expected = new URL(
    process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
  ).origin;
  return !origin || origin === expected;
}
