/**
 * Types for the mock in-memory store. Mirrors the IA record chain:
 * Customer → Property → Job → IBG / Funding project → Submission.
 *
 * Also covers the v2 surfaces: certificates, tickets, evidence queue,
 * products (Operate catalog), payouts, notifications, and the
 * contractor membership / activation state machine.
 */

export type RecordStatus =
  | "draft"
  | "active"
  | "inactive"
  | "archived";

export type JobState =
  | "draft"
  | "created"
  | "in-progress"
  | "awaiting-information"
  | "under-validation"
  | "blocked"
  | "completed"
  | "closed"
  | "cancelled"
  | "archived";

export type IbgState =
  | "draft"
  | "initiated"
  | "awaiting-validation"
  | "incomplete"
  | "validated"
  | "processing"
  | "ready-for-issue"
  | "issued"
  | "amended"
  | "superseded"
  | "cancelled"
  | "archived";

export type FundingState =
  | "incomplete"
  | "in-progress"
  | "evidence-required"
  | "under-review"
  | "returned"
  | "validated"
  | "ready-for-submission"
  | "submitted";

export type SubmissionState =
  | "submitted"
  | "under-review"
  | "awaiting-information"
  | "accepted"
  | "rejected"
  | "withdrawn";

export type AmendmentState = "pending" | "approved" | "rejected";

export type OnboardingApplicationState =
  | "in-progress"
  | "awaiting-verification"
  | "awaiting-review"
  | "ready-for-activation"
  | "blocked"
  | "activated";

export type Customer = {
  id: string;
  ref: string;
  name: string;
  email: string;
  phone: string;
  org?: string;
  status: RecordStatus;
  createdAt: number;
};

export type Property = {
  id: string;
  customerId: string;
  address: string;
  postcode: string;
  uprn?: string;
  epc?: string;
  duplicateFlag?: boolean;
  status: RecordStatus;
  createdAt: number;
};

export type Job = {
  id: string;
  ref: string;
  customerId: string;
  propertyId: string;
  measure: string;
  owner: string;
  state: JobState;
  startDate: string;
  createdAt: number;
};

export type IBG = {
  id: string;
  ref: string;
  customerId?: string;
  propertyId?: string;
  jobId?: string;
  customerName: string;
  propertyAddress: string;
  measure: string;
  policyType: string;
  state: IbgState;
  issuedAt?: number;
  createdAt: number;
  issuedBy: string;
};

export type AmendmentRequest = {
  id: string;
  ibgId: string;
  field: string;
  oldValue: string;
  newValue: string;
  reason: string;
  state: AmendmentState;
  createdAt: number;
  decidedAt?: number;
  decidedBy?: string;
  rejectReason?: string;
};

export type FundingProject = {
  id: string;
  ref: string;
  jobId: string;
  scheme: string;
  measure: string;
  state: FundingState;
  createdAt: number;
  evidence: { id: string; name: string; category: string; uploadedAt: number }[];
};

export type Submission = {
  id: string;
  ref: string;
  fundingProjectId: string;
  jobId: string;
  scheme: string;
  state: SubmissionState;
  submittedAt: number;
};

export type AuditEvent = {
  id: string;
  entityType:
    | "customer"
    | "property"
    | "job"
    | "ibg"
    | "funding"
    | "submission"
    | "user"
    | "amendment"
    | "certificate"
    | "ticket"
    | "evidence";
  entityId: string;
  actor: string;
  action: string;
  detail?: string;
  at: number;
};

export type ActivityEvent = {
  id: string;
  actor: string;
  action: string;
  target: string;
  at: number;
};

export type UserStatus =
  | "invited"
  | "pending"
  | "active"
  | "suspended"
  | "deactivated"
  | "banned";

export type ManagedUser = {
  id: string;
  name: string;
  email: string;
  role:
    | "admin"
    | "operator"
    | "installer-access"
    | "installer-operate"
    | "readonly";
  status: UserStatus;
  permissions: string[];
  invitedAt: number;
  lastActive?: number;
  banReason?: string;
  accountRiskState?: "active" | "flagged" | "paused" | "suspended";
  entityType?: "limited" | "sole-trader";
};

export type PermissionRequest = {
  id: string;
  userId: string;
  permission: string;
  reason: string;
  state: "pending" | "approved" | "rejected";
  requestedAt: number;
  decidedAt?: number;
  decidedBy?: string;
};

export type IntegrationKey =
  | "zapier"
  | "hubspot"
  | "slack"
  | "salesforce"
  | "webhooks"
  | "make";

export type Integration = {
  key: IntegrationKey;
  name: string;
  category: "Automation" | "CRM" | "Comms" | "Developer";
  description: string;
  connected: boolean;
  account?: string;
  connectedAt?: number;
};

export type OnboardingApplication = {
  id: string;
  companyName: string;
  contactName: string;
  contactEmail: string;
  tier: "access" | "operate";
  state: OnboardingApplicationState;
  submittedAt: number;
  companiesHouseNumber?: string;
  measures: string[];
  accreditationFiles: string[];
  blockedReason?: string;
};

export type FundingMatch = {
  scheme: string;
  description: string;
  score: number;
  measures: string[];
  state: "active" | "opportunity" | "no-match";
  region: string;
};

/* ─── Risk & compliance ─────────────────────────────────────────── */

export type AccountRiskState = "active" | "flagged" | "paused" | "suspended";

export type InstallationType = {
  id: string;
  name: string;
  status: "active" | "archived";
};

export type SystemType = {
  id: string;
  installationTypeId: string;
  name: string;
  status: "active" | "archived";
};

export type RiskAssessment = {
  id: string;
  organisationId: string;
  state: AccountRiskState;
  signalType: "companies-house" | "internal";
  signalDetail: string;
  severity: "low" | "medium" | "high" | "critical";
  createdAt: number;
  resolvedAt?: number;
};

export type RiskOverride = {
  id: string;
  organisationId: string;
  riskLevel: "high" | "critical";
  reason: string;
  justification?: string;
  createdBy: string;
  createdAt: number;
  expiresAt?: number;
  active: boolean;
};

/* ─── v2: Membership, certificates, tickets, products, evidence ── */

export type MembershipTier = "access" | "operate";

export type ActivationCondition =
  | "company_verified"
  | "trustmark_linked"
  | "insurance_uploaded"
  | "payment_method"
  | "profile_complete";

export type ActivationState =
  | "empty"
  | "partial"
  | "active"
  | "expiring"
  | "expired"
  | "suspended"
  | "locked";

export type AdminRole =
  | "super_admin"
  | "reviewer"
  | "support"
  | "finance";

export type CertificateState =
  | "draft"
  | "pending_review"
  | "issued"
  | "expiring"
  | "expired"
  | "revoked";

export type CertificateTemplate = {
  id: string;
  name: string;
  category: string;
  description: string;
  brandColor: string;
  fields: { id: string; label: string; type: "text" | "date" | "select" | "number"; options?: string[] }[];
  evidenceRequired: { id: string; label: string; description: string }[];
  active: boolean;
  createdAt: number;
};

export type Certificate = {
  id: string;
  ref: string;
  templateId: string;
  templateName: string;
  contractorId: string;
  contractorName: string;
  customerName: string;
  propertyAddress: string;
  measure: string;
  state: CertificateState;
  issuedAt?: number;
  expiresAt?: number;
  createdAt: number;
  issuedBy?: string;
  fields: Record<string, string>;
};

export type EvidenceState =
  | "pending"
  | "in_review"
  | "approved"
  | "changes_requested"
  | "rejected";

export type EvidenceItem = {
  id: string;
  certificateId: string;
  certificateRef: string;
  contractorId: string;
  contractorName: string;
  templateName: string;
  category: string;
  fileName: string;
  fileType: "pdf" | "image" | "doc";
  uploadedAt: number;
  state: EvidenceState;
  reviewerId?: string;
  reviewerNotes?: string;
  decidedAt?: number;
  priority: "low" | "normal" | "high";
};

export type TicketState = "open" | "pending" | "resolved" | "closed";
export type TicketCategory = "billing" | "technical" | "evidence" | "other";

export type TicketMessage = {
  id: string;
  ticketId: string;
  authorId: string;
  authorName: string;
  authorRole: "contractor" | "support" | "system";
  body: string;
  attachments?: { name: string; size: string }[];
  at: number;
};

export type Ticket = {
  id: string;
  ref: string;
  subject: string;
  contractorId: string;
  contractorName: string;
  category: TicketCategory;
  state: TicketState;
  priority: "low" | "normal" | "high";
  createdAt: number;
  updatedAt: number;
  assigneeId?: string;
  assigneeName?: string;
  unread: boolean;
};

export type Product = {
  id: string;
  name: string;
  category: "energy" | "insulation" | "heating" | "controls";
  manufacturer: string;
  sku: string;
  description: string;
  active: boolean;
  createdAt: number;
};

export type Notification = {
  id: string;
  contractorId?: string;
  scope: "platform" | "personal";
  kind: "release" | "alert" | "billing" | "evidence" | "ticket";
  title: string;
  body: string;
  at: number;
  read: boolean;
  href?: string;
};

export type Payout = {
  id: string;
  ref: string;
  contractorId: string;
  contractorName: string;
  amountGbp: number;
  state: "scheduled" | "processing" | "paid" | "failed";
  scheduledFor: number;
  paidAt?: number;
};

export type ContractorProfile = {
  id: string;
  name: string;
  email: string;
  companyName: string;
  membershipTier: MembershipTier;
  activationState: ActivationState;
  activationConditions: Record<ActivationCondition, boolean>;
  tierExpiresAt?: number;
  suspendedReason?: string;
  createdAt: number;
};

export type Invoice = {
  id: string;
  ref: string;
  contractorId: string;
  amountGbp: number;
  state: "paid" | "open" | "void";
  issuedAt: number;
  paidAt?: number;
  description: string;
};

/* ─── Project (Operate kanban) & Funding pipeline (V1.2) ────── */

export type ProjectState =
  | "lead"
  | "scoping"
  | "in_progress"
  | "review"
  | "complete";

export type Project = {
  id: string;
  ref: string;
  contractorId: string;
  title: string;
  customer: string;
  measure: string;
  state: ProjectState;
  budgetGbp: number;
  dueAt: number;
  createdAt: number;
};
