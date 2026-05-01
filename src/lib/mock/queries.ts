/**
 * Tiny query helpers over the mock store.
 * These are pure functions taking the seed data slice.
 */

import type {
  Customer, Property, Job, IBG, FundingProject, Submission, AuditEvent,
} from "./types";
import type { SeedData } from "./seed";

export const findCustomer = (d: SeedData, id: string) => d.customers.find((c) => c.id === id);
export const findProperty = (d: SeedData, id: string) => d.properties.find((p) => p.id === id);
export const findJob = (d: SeedData, id: string) => d.jobs.find((j) => j.id === id);
export const findIbg = (d: SeedData, id: string) => d.ibgs.find((i) => i.id === id);
export const findFunding = (d: SeedData, id: string) => d.fundingProjects.find((f) => f.id === id);
export const findSubmission = (d: SeedData, id: string) => d.submissions.find((s) => s.id === id);
export const findUser = (d: SeedData, id: string) => d.users.find((u) => u.id === id);
export const findOnboarding = (d: SeedData, id: string) => d.onboarding.find((o) => o.id === id);

export const propertiesOfCustomer = (d: SeedData, customerId: string): Property[] =>
  d.properties.filter((p) => p.customerId === customerId);

export const jobsOfCustomer = (d: SeedData, customerId: string): Job[] =>
  d.jobs.filter((j) => j.customerId === customerId);

export const jobsOfProperty = (d: SeedData, propertyId: string): Job[] =>
  d.jobs.filter((j) => j.propertyId === propertyId);

export const ibgsOfJob = (d: SeedData, jobId: string): IBG[] =>
  d.ibgs.filter((i) => i.jobId === jobId);

export const fundingOfJob = (d: SeedData, jobId: string): FundingProject[] =>
  d.fundingProjects.filter((f) => f.jobId === jobId);

export const submissionsOfFunding = (d: SeedData, fundingId: string): Submission[] =>
  d.submissions.filter((s) => s.fundingProjectId === fundingId);

export function fmtDate(ts: number) {
  return new Date(ts).toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

export function relTime(ts: number) {
  const diff = Date.now() - ts;
  const day = 86400000;
  const d = Math.round(diff / day);
  if (d <= 0) return "today";
  if (d === 1) return "yesterday";
  if (d < 7) return `${d}d ago`;
  if (d < 30) return `${Math.round(d / 7)}w ago`;
  return fmtDate(ts);
}

export type AnyAuditEntity = AuditEvent["entityType"];

export function pushAudit(
  d: SeedData,
  entityType: AnyAuditEntity,
  entityId: string,
  actor: string,
  action: string,
  detail?: string,
) {
  d.audit.unshift({
    id: "a_" + Math.random().toString(36).slice(2, 8),
    entityType,
    entityId,
    actor,
    action,
    detail,
    at: Date.now(),
  });
}
