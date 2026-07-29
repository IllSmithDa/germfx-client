// lib/UserContext.tsx
"use client";

import { createContext, useContext } from "react";

export type User = {
  id ?: string | number| null | undefined;
  email ?: string | null | undefined;
  name?: string | null | undefined;
  username?: string | null | undefined;
};

const UserContext = createContext<User | null>(null);

export function UserProvider({
  user,
  children,
}: {
  user: User | null;
  children: React.ReactNode;
}) {
  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) {
    throw new Error("useUser must be used within UserProvider");
  }
  return ctx;
}
