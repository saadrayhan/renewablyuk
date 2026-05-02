/**
 * Auth context — backend disabled. Reads from DevRoleProvider so the rest
 * of the app keeps a single `useAuth()` surface.
 */

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { useDevRole } from "@/lib/dev-role";
import { ROLE_META, type Role, type Permission } from "@/lib/rbac";

type MockUser = {
  id: string;
  email: string;
  fullName: string;
  initials: string;
  role: Role;
  roleLabel: string;
};

type AuthContextValue = {
  user: MockUser;
  permissions: Permission[];
  isAdmin: boolean;
  isOperator: boolean;
  loading: false;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function buildUser(role: Role): MockUser {
  const meta = ROLE_META[role];
  const seed: Record<Role, { fullName: string; email: string }> = {
    admin: { fullName: "Alex Reed", email: "alex@renewably.uk" },
    operator: { fullName: "Sam Patel", email: "sam@renewably.uk" },
    "installer-access": { fullName: "Jordan Hayes", email: "jordan@northwarmth.co.uk" },
    "installer-operate": { fullName: "Robin Clarke", email: "robin@evergreen-installs.co.uk" },
    readonly: { fullName: "Morgan Lee", email: "morgan@gbisfunding.org" },
  };
  const { fullName, email } = seed[role];
  const initials = fullName
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("");
  return { id: role, email, fullName, initials, role, roleLabel: meta.label };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const { role, permissions } = useDevRole();
  const value = useMemo<AuthContextValue>(
    () => ({
      user: buildUser(role),
      permissions,
      isAdmin: role === "admin",
      isOperator: role === "operator",
      loading: false,
    }),
    [role, permissions],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
