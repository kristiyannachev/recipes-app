export type CurrentUser = { id: string; name: string; role: string };

export function canEditRecipe(
  user: CurrentUser | null,
  ownerId: string | null,
) {
  return !!user && (user.role === "admin" || user.id === ownerId);
}

export function canDeleteRecipe(user: CurrentUser | null) {
  return user?.role === "admin";
}

export function safeReturnPath(value: string | null | undefined) {
  // Prevent external and protocol-relative redirects after authentication.
  return value?.startsWith("/") &&
    !value.startsWith("//") &&
    !value.includes("\\")
    ? value
    : "/";
}
