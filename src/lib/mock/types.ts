/**
 * Types for the mock in-memory store. Mirrors the IA record chain:
 * Customer → Property → Job → IBG / Funding project → Submission.
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
  customerName: string; // denormalised for Access tier standalone
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
    | "amendment";
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
  permissions: string[]; // permission ids
  invitedAt: number;
  lastActive?: number;
  banReason?: string;
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
  score: number; // 0-100
  measures: string[];
  state: "active" | "opportunity" | "no-match";
  region: string;
};
