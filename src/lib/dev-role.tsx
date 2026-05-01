/**
 * Dev role context — backend is disabled, so this drives the entire
 * preview. Persisted to localStorage so refreshes keep the same persona.
 *
 * Use `useDevRole()` in components, and `useAuth()` for the legacy auth
 * surface (which now reads from this context).
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  DEFAULT_PERMISSIONS,
  type Permission,
  type Role,
} from "@/lib/rbac";

export type OnboardingStep =
  | "complete"
  | "signup"
  | "verify-email"
  | "company"
  | "measures"
  | "accreditation"
  | "payment"
  | "review";

export type DevRoleState = {
  role: Role;
  permissions: Permission[]; // effective set used by `can()`
  onboardingStep: OnboardingStep;
  pendingPermissionRequests: Permission[];
};

type Ctx = DevRoleState & {
  setRole: (role: Role) => void;
  setOnboardingStep: (step: OnboardingStep) => void;
  togglePermission: (p: Permission) => void;
  setPermissions: (perms: Permission[]) => void;
  requestPermission: (p: Permission) => void;
  approvePermissionRequest: (p: Permission) => void;
  reset: () => void;
};

const STORAGE_KEY = "renewably:dev-role:v2";

const DEFAULT_STATE: DevRoleState = {
  role: "installer-operate",
  permissions: DEFAULT_PERMISSIONS["installer-operate"],
  onboardingStep: "complete",
  pendingPermissionRequests: [],
};

const DevRoleContext = createContext<Ctx | null>(null);

function loadState(): DevRoleState {
  if (typeof window === "undefined") return DEFAULT_STATE;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw) as Partial<DevRoleState>;
    return {
      role: parsed.role ?? DEFAULT_STATE.role,
      permissions:
        parsed.permissions ??
        DEFAULT_PERMISSIONS[parsed.role ?? DEFAULT_STATE.role],
      onboardingStep: parsed.onboardingStep ?? "complete",
      pendingPermissionRequests: parsed.pendingPermissionRequests ?? [],
    };
  } catch {
    return DEFAULT_STATE;
  }
}

export function DevRoleProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DevRoleState>(DEFAULT_STATE);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setState(loadState());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* ignore */
    }
  }, [state, hydrated]);

  const setRole = useCallback((role: Role) => {
    setState((s) => ({
      ...s,
      role,
      // Reset to default permissions for the role; user can edit afterwards.
      permissions: DEFAULT_PERMISSIONS[role],
      pendingPermissionRequests: [],
    }));
  }, []);

  const setOnboardingStep = useCallback((onboardingStep: OnboardingStep) => {
    setState((s) => ({ ...s, onboardingStep }));
  }, []);

  const togglePermission = useCallback((p: Permission) => {
    setState((s) => ({
      ...s,
      permissions: s.permissions.includes(p)
        ? s.permissions.filter((x) => x !== p)
        : [...s.permissions, p],
      pendingPermissionRequests: s.pendingPermissionRequests.filter(
        (x) => x !== p,
      ),
    }));
  }, []);

  const setPermissions = useCallback((permissions: Permission[]) => {
    setState((s) => ({ ...s, permissions }));
  }, []);

  const requestPermission = useCallback((p: Permission) => {
    setState((s) =>
      s.pendingPermissionRequests.includes(p) || s.permissions.includes(p)
        ? s
        : {
            ...s,
            pendingPermissionRequests: [...s.pendingPermissionRequests, p],
          },
    );
  }, []);

  const approvePermissionRequest = useCallback((p: Permission) => {
    setState((s) => ({
      ...s,
      permissions: s.permissions.includes(p)
        ? s.permissions
        : [...s.permissions, p],
      pendingPermissionRequests: s.pendingPermissionRequests.filter(
        (x) => x !== p,
      ),
    }));
  }, []);

  const reset = useCallback(() => setState(DEFAULT_STATE), []);

  const value = useMemo<Ctx>(
    () => ({
      ...state,
      setRole,
      setOnboardingStep,
      togglePermission,
      setPermissions,
      requestPermission,
      approvePermissionRequest,
      reset,
    }),
    [
      state,
      setRole,
      setOnboardingStep,
      togglePermission,
      setPermissions,
      requestPermission,
      approvePermissionRequest,
      reset,
    ],
  );

  return (
    <DevRoleContext.Provider value={value}>{children}</DevRoleContext.Provider>
  );
}

export function useDevRole() {
  const ctx = useContext(DevRoleContext);
  if (!ctx) throw new Error("useDevRole must be used inside DevRoleProvider");
  return ctx;
}
