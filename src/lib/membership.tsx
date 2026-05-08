/**
 * Two-axis user model layered on top of legacy DevRole:
 *  - Membership tier (contractor): "access" | "operate"
 *  - Activation state machine (contractor): 7 states
 *  - Admin role (internal): super_admin | reviewer | support | finance
 *
 * Persisted to localStorage so the dev-switcher selection survives refresh.
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
import type {
  ActivationCondition,
  ActivationState,
  AdminRole,
  MembershipTier,
} from "@/lib/mock/types";

const STORAGE_KEY = "renewably:membership:v1";

export type MembershipState = {
  tier: MembershipTier;
  activationState: ActivationState;
  conditions: Record<ActivationCondition, boolean>;
  adminRole: AdminRole;
};

const DEFAULT_STATE: MembershipState = {
  tier: "operate",
  activationState: "active",
  conditions: {
    company_verified: true,
    trustmark_linked: true,
    insurance_uploaded: true,
    payment_method: true,
    profile_complete: true,
  },
  adminRole: "super_admin",
};

type Ctx = MembershipState & {
  setTier: (t: MembershipTier) => void;
  setActivationState: (s: ActivationState) => void;
  toggleCondition: (c: ActivationCondition) => void;
  setAdminRole: (r: AdminRole) => void;
  reset: () => void;
};

const MembershipContext = createContext<Ctx | null>(null);

function loadState(): MembershipState {
  if (typeof window === "undefined") return DEFAULT_STATE;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw) as Partial<MembershipState>;
    return { ...DEFAULT_STATE, ...parsed, conditions: { ...DEFAULT_STATE.conditions, ...(parsed.conditions ?? {}) } };
  } catch {
    return DEFAULT_STATE;
  }
}

export function MembershipProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<MembershipState>(DEFAULT_STATE);
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

  const setTier = useCallback((tier: MembershipTier) => setState((s) => ({ ...s, tier })), []);
  const setActivationState = useCallback(
    (activationState: ActivationState) => setState((s) => ({ ...s, activationState })),
    [],
  );
  const toggleCondition = useCallback((c: ActivationCondition) => {
    setState((s) => ({ ...s, conditions: { ...s.conditions, [c]: !s.conditions[c] } }));
  }, []);
  const setAdminRole = useCallback((adminRole: AdminRole) => setState((s) => ({ ...s, adminRole })), []);
  const reset = useCallback(() => setState(DEFAULT_STATE), []);

  const value = useMemo<Ctx>(
    () => ({ ...state, setTier, setActivationState, toggleCondition, setAdminRole, reset }),
    [state, setTier, setActivationState, toggleCondition, setAdminRole, reset],
  );

  return <MembershipContext.Provider value={value}>{children}</MembershipContext.Provider>;
}

export function useMembership() {
  const ctx = useContext(MembershipContext);
  if (!ctx) throw new Error("useMembership inside MembershipProvider");
  return ctx;
}

export function useAdminRole() {
  const { adminRole, setAdminRole } = useMembership();
  return { adminRole, setAdminRole };
}

/**
 * Returns whether contractor can use a feature (is fully activated).
 * Surfaces blocking reason for paywalls and locked-state UI.
 */
export function useActivationGate() {
  const { tier, activationState, conditions } = useMembership();
  const allMet = Object.values(conditions).every(Boolean);
  const isBlocked =
    activationState === "empty" ||
    activationState === "partial" ||
    activationState === "expired" ||
    activationState === "suspended" ||
    activationState === "locked";
  const isReadOnly = activationState === "expired";
  return {
    tier,
    activationState,
    conditions,
    allConditionsMet: allMet,
    isBlocked,
    isReadOnly,
    isExpiring: activationState === "expiring",
  };
}

export const ACTIVATION_CONDITIONS: { id: ActivationCondition; label: string; description: string }[] = [
  { id: "company_verified", label: "Company verified", description: "Companies House link confirmed." },
  { id: "trustmark_linked", label: "TrustMark linked", description: "Active TrustMark accreditation." },
  { id: "insurance_uploaded", label: "Insurance uploaded", description: "Public liability cover on file." },
  { id: "payment_method", label: "Payment method", description: "Card or direct debit added." },
  { id: "profile_complete", label: "Profile complete", description: "Logo, bio and trade details." },
];

export const ADMIN_ROLE_META: Record<AdminRole, { label: string; description: string }> = {
  super_admin: { label: "Super Admin", description: "Full platform access — feature flags, system, integrations." },
  reviewer: { label: "Reviewer", description: "Evidence queue, certificates, templates, audit." },
  support: { label: "Support", description: "Tickets, companies, users, onboarding." },
  finance: { label: "Finance", description: "Stripe events, payouts, membership, funding schemes." },
};
