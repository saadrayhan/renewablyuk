/**
 * Renewably UK — Role-Based Access Control
 *
 * Five role TYPES (multiple users can hold each role):
 *   - admin              Internal Renewably staff with full configuration access
 *   - operator           Internal Renewably ops staff. NO inherent permissions —
 *                        Admin assigns capabilities from the Permission Library.
 *   - installer-access   Free tier installation company user
 *   - installer-operate  Paid tier installation company user
 *   - readonly           External stakeholders (Funding Partners, Scheme
 *                        Providers, Architects, external Consultants)
 *
 * Operators differ from each other — two operators may have very different
 * permission sets. Admin grants permissions from the library, operator can
 * request additional permissions inline from any locked feature.
 */

export type Role =
  | "admin"
  | "operator"
  | "installer-access"
  | "installer-operate"
  | "readonly";

export const ROLE_META: Record<
  Role,
  { label: string; short: string; tone: string; description: string }
> = {
  admin: {
    label: "Admin",
    short: "Admin",
    tone: "purple",
    description:
      "Internal Renewably staff. Configures the platform, manages users and their permissions.",
  },
  operator: {
    label: "Operator",
    short: "Operator",
    tone: "green",
    description:
      "Internal Renewably ops. Permissions are explicitly granted by an Admin — no defaults.",
  },
  "installer-access": {
    label: "Installer · Access",
    short: "Access",
    tone: "amber",
    description:
      "Free tier installer. Standalone IBG generator + limited history.",
  },
  "installer-operate": {
    label: "Installer · Operate",
    short: "Operate",
    tone: "blue",
    description:
      "Subscribed installer. Full project record-chain, funding workflow, repository.",
  },
  readonly: {
    label: "Read-Only",
    short: "Read-Only",
    tone: "neutral",
    description:
      "External stakeholders — Funding Partners, Scheme Providers, Architects, Consultants. Full visibility, no edits.",
  },
};

/* ─── Permission catalogue ──────────────────────────────────────── */

export type Permission =
  // Projects · Customers
  | "customers.read"
  | "customers.create"
  | "customers.edit"
  | "customers.archive"
  // Projects · Properties
  | "properties.read"
  | "properties.create"
  | "properties.edit"
  // Projects · Jobs
  | "jobs.read"
  | "jobs.create"
  | "jobs.edit"
  | "jobs.assign"
  | "jobs.documents.upload"
  | "jobs.documents.delete"
  // IBG
  | "ibg.read"
  | "ibg.issue"
  | "ibg.history.full"
  | "ibg.repository.read"
  | "ibg.amendment.request"
  | "ibg.amendment.approve"
  | "ibg.cancel"
  // Submissions
  | "submissions.read"
  | "submissions.upload"
  // Funding
  | "funding.match.read"
  | "funding.projects.read"
  | "funding.projects.create"
  | "funding.evidence.upload"
  | "funding.submit"
  // Reports
  | "reports.read"
  | "reports.export"
  // Settings
  | "settings.measures.read"
  | "settings.measures.request"
  | "subscription.manage"
  // Admin · Users
  | "users.read"
  | "users.invite"
  | "users.edit"
  | "users.suspend"
  | "users.permissions.assign"
  // Admin · Compliance
  | "audit.read"
  | "audit.export"
  | "activity.read"
  // Admin · Onboarding & amendments
  | "onboarding.queue.read"
  | "onboarding.review"
  | "onboarding.activate"
  | "amendments.queue.read"
  | "amendments.review"
  // Admin · System
  | "config.read"
  | "config.edit"
  | "permissions.library.manage"
  // Admin · Risk
  | "risk.read"
  | "risk.flag"
  | "risk.override.high"
  | "risk.override.critical"
  | "installation-types.read"
  | "installation-types.manage"
  | "system-types.read"
  | "system-types.manage";

export type PermissionCategory =
  | "Projects"
  | "IBG"
  | "Submissions"
  | "Funding"
  | "Reports"
  | "Settings"
  | "Admin · Users"
  | "Admin · Compliance"
  | "Admin · Onboarding"
  | "Admin · Risk"
  | "Admin · System";

export type PermissionDef = {
  id: Permission;
  label: string;
  category: PermissionCategory;
  description: string;
};

export const PERMISSIONS: PermissionDef[] = [
  // Projects
  { id: "customers.read", label: "View customers", category: "Projects", description: "Browse the customer list and details." },
  { id: "customers.create", label: "Create customer", category: "Projects", description: "Add new customer records." },
  { id: "customers.edit", label: "Edit customer", category: "Projects", description: "Modify customer details and status." },
  { id: "customers.archive", label: "Archive customer", category: "Projects", description: "Move customers out of active workspace." },
  { id: "properties.read", label: "View properties", category: "Projects", description: "Browse linked properties." },
  { id: "properties.create", label: "Create property", category: "Projects", description: "Add a property to a customer." },
  { id: "properties.edit", label: "Edit property", category: "Projects", description: "Modify property details." },
  { id: "jobs.read", label: "View jobs", category: "Projects", description: "Browse job pipeline and detail." },
  { id: "jobs.create", label: "Create job", category: "Projects", description: "Open a new job against a property." },
  { id: "jobs.edit", label: "Edit job", category: "Projects", description: "Change job status, fields and notes." },
  { id: "jobs.assign", label: "Assign job owner", category: "Projects", description: "Re-assign a job to a different owner." },
  { id: "jobs.documents.upload", label: "Upload job documents", category: "Projects", description: "Add evidence files to a job." },
  { id: "jobs.documents.delete", label: "Delete job documents", category: "Projects", description: "Permanently remove evidence files." },
  // IBG
  { id: "ibg.read", label: "View IBGs", category: "IBG", description: "Open IBG records." },
  { id: "ibg.issue", label: "Issue IBG", category: "IBG", description: "Generate and issue a new certificate." },
  { id: "ibg.history.full", label: "Full IBG history", category: "IBG", description: "See unrestricted history (Operate equivalent)." },
  { id: "ibg.repository.read", label: "Use IBG repository", category: "IBG", description: "Access the searchable record store." },
  { id: "ibg.amendment.request", label: "Request amendment", category: "IBG", description: "Submit a correction request to admin." },
  { id: "ibg.amendment.approve", label: "Approve amendments", category: "IBG", description: "Review and approve / reject amendment requests." },
  { id: "ibg.cancel", label: "Cancel IBG (same month)", category: "IBG", description: "Cancel a recently issued IBG within its issue month." },
  // Submissions
  { id: "submissions.read", label: "View submissions", category: "Submissions", description: "Open scheme submission records." },
  { id: "submissions.upload", label: "Upload submission info", category: "Submissions", description: "Provide additional info on awaiting submissions." },
  // Funding
  { id: "funding.match.read", label: "Funding match hub", category: "Funding", description: "See matched government schemes." },
  { id: "funding.projects.read", label: "View funding projects", category: "Funding", description: "Browse funding project list and detail." },
  { id: "funding.projects.create", label: "Create funding project", category: "Funding", description: "Start a funding project from a job." },
  { id: "funding.evidence.upload", label: "Upload evidence", category: "Funding", description: "Add evidence files against a funding project." },
  { id: "funding.submit", label: "Submit to scheme", category: "Funding", description: "Submit a funding project to the scheme." },
  // Reports
  { id: "reports.read", label: "View reports", category: "Reports", description: "Access platform reports and dashboards." },
  { id: "reports.export", label: "Export reports", category: "Reports", description: "Download CSV / PDF exports." },
  // Settings
  { id: "settings.measures.read", label: "View approved measures", category: "Settings", description: "See the company's confirmed measure set." },
  { id: "settings.measures.request", label: "Request measure addition", category: "Settings", description: "Submit a new measure request to admin." },
  { id: "subscription.manage", label: "Manage subscription", category: "Settings", description: "View and update billing for the company." },
  // Admin · Users
  { id: "users.read", label: "View users", category: "Admin · Users", description: "Open the user directory." },
  { id: "users.invite", label: "Invite users", category: "Admin · Users", description: "Send invitations to new users." },
  { id: "users.edit", label: "Edit users", category: "Admin · Users", description: "Change user role and profile." },
  { id: "users.suspend", label: "Suspend / reactivate", category: "Admin · Users", description: "Suspend or reactivate accounts." },
  { id: "users.permissions.assign", label: "Assign permissions", category: "Admin · Users", description: "Grant or revoke permissions on a user." },
  // Admin · Compliance
  { id: "audit.read", label: "View audit log", category: "Admin · Compliance", description: "Browse the platform audit log." },
  { id: "audit.export", label: "Export audit log", category: "Admin · Compliance", description: "Download audit log as CSV." },
  { id: "activity.read", label: "Activity feed", category: "Admin · Compliance", description: "See real-time platform activity." },
  // Admin · Onboarding
  { id: "onboarding.queue.read", label: "Onboarding queue", category: "Admin · Onboarding", description: "See accounts in the onboarding pipeline." },
  { id: "onboarding.review", label: "Review onboarding", category: "Admin · Onboarding", description: "Review submitted onboarding info." },
  { id: "onboarding.activate", label: "Activate accounts", category: "Admin · Onboarding", description: "Move an account to active status." },
  { id: "amendments.queue.read", label: "Amendments queue", category: "Admin · Onboarding", description: "See pending IBG amendment requests." },
  { id: "amendments.review", label: "Review amendments", category: "Admin · Onboarding", description: "Approve or reject amendment requests." },
  // Admin · System
  { id: "config.read", label: "View system config", category: "Admin · System", description: "Read platform configuration." },
  { id: "config.edit", label: "Edit system config", category: "Admin · System", description: "Modify platform settings." },
  { id: "permissions.library.manage", label: "Manage permission library", category: "Admin · System", description: "Curate the catalogue of assignable permissions." },
  { id: "installation-types.read", label: "View installation types", category: "Admin · System", description: "See the catalogue of installation types." },
  { id: "installation-types.manage", label: "Manage installation types", category: "Admin · System", description: "Create, edit and archive installation types." },
  { id: "system-types.read", label: "View system types", category: "Admin · System", description: "See system types under each installation type." },
  { id: "system-types.manage", label: "Manage system types", category: "Admin · System", description: "Create, edit and archive system types." },
  // Admin · Risk
  { id: "risk.read", label: "View risk dashboard", category: "Admin · Risk", description: "Open the Risk & Compliance panel and account risk profiles." },
  { id: "risk.flag", label: "Flag accounts", category: "Admin · Risk", description: "Apply manual risk flags to accounts." },
  { id: "risk.override.high", label: "Apply HIGH risk override", category: "Admin · Risk", description: "Override a flagged or paused account to restore IBG access." },
  { id: "risk.override.critical", label: "Apply CRITICAL risk override", category: "Admin · Risk", description: "Override a suspended account — multi-step review required." },
];

export const PERMISSION_CATEGORIES: PermissionCategory[] = [
  "Projects",
  "IBG",
  "Submissions",
  "Funding",
  "Reports",
  "Settings",
  "Admin · Users",
  "Admin · Compliance",
  "Admin · Onboarding",
  "Admin · Risk",
  "Admin · System",
];

/* ─── Operator presets (capability bundles) ─────────────────────── */

export type OperatorPreset = {
  id: string;
  label: string;
  description: string;
  permissions: Permission[];
};

export const OPERATOR_PRESETS: OperatorPreset[] = [
  {
    id: "junior-operator",
    label: "Junior Operator",
    description: "Read across the platform, create + edit project records, no submissions or approvals.",
    permissions: [
      "customers.read", "customers.create", "customers.edit",
      "properties.read", "properties.create", "properties.edit",
      "jobs.read", "jobs.create", "jobs.edit", "jobs.documents.upload",
      "ibg.read", "ibg.repository.read", "ibg.history.full",
      "submissions.read",
      "funding.projects.read", "funding.match.read",
      "reports.read",
    ],
  },
  {
    id: "senior-operator",
    label: "Senior Operator",
    description: "Junior + funding submission and IBG issuance. Cannot approve amendments or manage users.",
    permissions: [
      "customers.read", "customers.create", "customers.edit", "customers.archive",
      "properties.read", "properties.create", "properties.edit",
      "jobs.read", "jobs.create", "jobs.edit", "jobs.assign",
      "jobs.documents.upload", "jobs.documents.delete",
      "ibg.read", "ibg.issue", "ibg.repository.read", "ibg.history.full",
      "ibg.amendment.request", "ibg.cancel",
      "submissions.read", "submissions.upload",
      "funding.match.read", "funding.projects.read", "funding.projects.create",
      "funding.evidence.upload", "funding.submit",
      "reports.read", "reports.export",
      "risk.read",
    ],
  },
  {
    id: "compliance-reviewer",
    label: "Compliance Reviewer",
    description: "Audit, activity feed, amendment review. Read-only across operational data.",
    permissions: [
      "customers.read", "properties.read", "jobs.read",
      "ibg.read", "ibg.repository.read", "ibg.history.full",
      "submissions.read",
      "funding.projects.read",
      "reports.read", "reports.export",
      "audit.read", "audit.export", "activity.read",
      "amendments.queue.read", "amendments.review",
      "ibg.amendment.approve",
      "risk.read", "risk.flag",
    ],
  },
];

/* ─── Default permissions per role ──────────────────────────────── */

const ALL: Permission[] = PERMISSIONS.map((p) => p.id);

/**
 * External stakeholders — read access to operational records only.
 * No audit log, no admin functions. They get a limited activity scope only.
 */
const READONLY_PERMS: Permission[] = [
  "customers.read", "properties.read", "jobs.read",
  "ibg.read", "ibg.repository.read", "ibg.history.full",
  "submissions.read",
  "funding.projects.read",
  "reports.read",
];

const ACCESS_PERMS: Permission[] = [
  "ibg.read", "ibg.issue",
  "settings.measures.read",
];

const OPERATE_PERMS: Permission[] = [
  "customers.read", "customers.create", "customers.edit", "customers.archive",
  "properties.read", "properties.create", "properties.edit",
  "jobs.read", "jobs.create", "jobs.edit", "jobs.assign",
  "jobs.documents.upload", "jobs.documents.delete",
  "ibg.read", "ibg.issue", "ibg.repository.read", "ibg.history.full",
  "ibg.amendment.request", "ibg.cancel",
  "submissions.read", "submissions.upload",
  "funding.match.read", "funding.projects.read", "funding.projects.create",
  "funding.evidence.upload", "funding.submit",
  "reports.read", "reports.export",
  "settings.measures.read", "settings.measures.request",
  "subscription.manage",
];

export const DEFAULT_PERMISSIONS: Record<Role, Permission[]> = {
  admin: ALL,
  // Operators start empty — Admin assigns from the library.
  operator: [],
  "installer-access": ACCESS_PERMS,
  "installer-operate": OPERATE_PERMS,
  readonly: READONLY_PERMS,
};

/* ─── Helper ────────────────────────────────────────────────────── */

export function can(perms: Permission[], required: Permission | Permission[]): boolean {
  const list = Array.isArray(required) ? required : [required];
  return list.every((p) => perms.includes(p));
}

export function canAny(perms: Permission[], required: Permission[]): boolean {
  return required.some((p) => perms.includes(p));
}
