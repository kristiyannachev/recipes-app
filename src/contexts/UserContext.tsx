"use client";
import { createContext, type ReactNode, useContext } from "react";
import type { CurrentUser } from "@/lib/permissions";

const UserContext = createContext<CurrentUser | null>(null);
export function UserProvider({
  value,
  children,
}: {
  value: CurrentUser | null;
  children: ReactNode;
}) {
  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}
export const useUser = () => useContext(UserContext);
