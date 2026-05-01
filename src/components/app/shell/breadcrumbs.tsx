/**
 * Breadcrumbs derived from the current pathname plus a known mapping
 * of route → human label. For dynamic segments (e.g. /customers/cus_001)
 * the trail just shows the parent + a generic "Detail" — record names
 * are filled in by the page itself if it wants more context.
 */

import { Link, useRouterState } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { Fragment } from "react";

const LABELS: Record<string, string> = {
  dashboard: "Home",
  projects: "Projects",
  customers: "Customers",
  properties: "Properties",
  jobs: "Jobs",
  ibg: "IBG",
  new: "New",
  history: "History",
  repository: "Repository",
  amendment: "Amendment",
  submissions: "Submissions",
  funding: "Funding",
  match: "Match Hub",
  evidence: "Evidence",
  submit: "Submit",
  tracking: "Tracking",
  settings: "Settings",
  profile: "Profile",
  notifications: "Notifications",
  subscription: "Subscription",
  measures: "Measures",
  admin: "Admin",
  users: "Users",
  audit: "Audit log",
  activity: "Activity",
  onboarding: "Onboarding",
  amendments: "Amendments",
  permissions: "Permissions",
  config: "System config",
  invite: "Invite",
};

const BASE_TO: Record<string, string> = {
  dashboard: "/dashboard",
  projects: "/projects",
  customers: "/customers",
  properties: "/properties",
  jobs: "/jobs",
  ibg: "/ibg/repository",
  submissions: "/submissions",
  funding: "/funding",
  settings: "/settings/profile",
  admin: "/admin/users",
};

export function Breadcrumbs() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const segments = path.split("/").filter(Boolean);

  if (segments.length === 0) return null;

  const crumbs: { label: string; to?: string }[] = [];
  segments.forEach((seg, i) => {
    // skip dynamic ids
    if (seg.startsWith("cus_") || seg.startsWith("pro_") || seg.startsWith("job_") || seg.startsWith("ibg_") || seg.startsWith("fnd_") || seg.startsWith("sub_") || seg.startsWith("usr_") || seg.startsWith("onb_") || seg.startsWith("amd_")) {
      crumbs.push({ label: "Detail" });
      return;
    }
    const label = LABELS[seg] ?? cap(seg);
    const to = i === 0 ? BASE_TO[seg] ?? "/" + seg : undefined;
    crumbs.push({ label, to });
  });

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm">
      {crumbs.map((c, i) => (
        <Fragment key={i}>
          {i > 0 && <ChevronRight className="size-3.5 text-ink-muted" />}
          {c.to && i < crumbs.length - 1 ? (
            <Link to={c.to} className="text-ink-muted hover:text-foreground">
              {c.label}
            </Link>
          ) : (
            <span className={i === crumbs.length - 1 ? "font-medium text-foreground" : "text-ink-muted"}>
              {c.label}
            </span>
          )}
        </Fragment>
      ))}
    </nav>
  );
}

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
