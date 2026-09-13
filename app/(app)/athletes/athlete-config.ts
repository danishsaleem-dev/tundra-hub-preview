// Shared column/field configuration for the Athlete module's list, main
// detail/form, and — kept entirely separate on purpose — sensitive-info
// fields. Athlete's RBAC shape differs from Recruiter/Prospect: a
// RECRUITER can only ever READ their assigned athletes (PATCH is
// ADMIN-or-self only, never RECRUITER — see app/api/athletes/[id]/
// route.ts), so this page never renders edit/archive controls for a
// RECRUITER viewer, only for ADMIN. An ATHLETE never reaches this page
// at all — their self-service edit stays at /my-profile (M4,
// untouched); this module is the admin-facing management screen.
import type { UserRole } from "@prisma/client";
import type { ListColumnConfig, ListFilterConfig } from "@/lib/list-config";
import type { DetailFieldConfig } from "@/lib/detail-config";
import type { FormFieldConfig } from "@/lib/form-config";

// Single source of truth for which roles can edit/archive/view sensitive
// info on THIS page — a RECRUITER here is read-only across the board.
export const ATHLETE_ADMIN_ONLY_ACTIONS: UserRole[] = ["ADMIN"];

const POSITION_OPTIONS = [
  { value: "QB", label: "QB" },
  { value: "WR", label: "WR" },
  { value: "RB", label: "RB" },
  { value: "TE", label: "TE" },
  { value: "OL", label: "OL" },
  { value: "DL", label: "DL" },
  { value: "LB", label: "LB" },
  { value: "DB", label: "DB" },
  { value: "K_P", label: "K/P" },
];

const DOMINANT_HAND_OPTIONS = [
  { value: "RIGHT", label: "Right" },
  { value: "LEFT", label: "Left" },
  { value: "AMBIDEXTROUS", label: "Ambidextrous" },
];

const SCHOOL_TYPE_OPTIONS = [
  { value: "HIGH_SCHOOL", label: "High School" },
  { value: "COLLEGE", label: "College" },
  { value: "JUNIOR_COLLEGE", label: "Junior College" },
  { value: "PREP_SCHOOL", label: "Prep School" },
  { value: "PRO", label: "Pro" },
];

const ACADEMIC_YEAR_OPTIONS = [
  { value: "FRESHMAN", label: "Freshman" },
  { value: "SOPHOMORE", label: "Sophomore" },
  { value: "JUNIOR", label: "Junior" },
  { value: "SENIOR", label: "Senior" },
  { value: "GRADUATE", label: "Graduate" },
  { value: "POSTGRADUATE", label: "Postgraduate" },
  { value: "NOT_APPLICABLE", label: "Not Applicable" },
];

const TRANSFER_PORTAL_OPTIONS = [
  { value: "NOT_APPLICABLE", label: "Not Applicable" },
  { value: "NOT_IN_PORTAL", label: "Not in Portal" },
  { value: "CONSIDERING", label: "Considering" },
  { value: "IN_PORTAL", label: "In Portal" },
  { value: "TRANSFERRED", label: "Transferred" },
];

const RECRUITING_STATUS_OPTIONS = [
  { value: "UNCOMMITTED", label: "Uncommitted" },
  { value: "COMMITTED", label: "Committed" },
  { value: "ACTIVELY_RECRUITED", label: "Actively Recruited" },
  { value: "LIGHT_INTEREST", label: "Light Interest" },
  { value: "SIGNED", label: "Signed" },
  { value: "PORTAL", label: "Portal" },
  { value: "PRO", label: "Pro" },
];

const RECRUITING_STATUS_MAP = {
  UNCOMMITTED: { variant: "neutral" as const, label: "Uncommitted" },
  COMMITTED: { variant: "success" as const, label: "Committed" },
  ACTIVELY_RECRUITED: { variant: "warning" as const, label: "Actively Recruited" },
  LIGHT_INTEREST: { variant: "neutral" as const, label: "Light Interest" },
  SIGNED: { variant: "success" as const, label: "Signed" },
  PORTAL: { variant: "critical" as const, label: "Portal" },
  PRO: { variant: "success" as const, label: "Pro" },
};

const TIER_OPTIONS = [
  { value: "TIER_A", label: "Tier A" },
  { value: "TIER_B", label: "Tier B" },
  { value: "TIER_C", label: "Tier C" },
];

const TIER_MAP = {
  TIER_A: { variant: "success" as const, label: "Tier A" },
  TIER_B: { variant: "warning" as const, label: "Tier B" },
  TIER_C: { variant: "neutral" as const, label: "Tier C" },
};

const FOCUS_OPTIONS = [
  { value: "NIL", label: "NIL" },
  { value: "FOOTBALL", label: "Football" },
  { value: "BOTH", label: "Both" },
];

const CONTACT_METHOD_OPTIONS = [
  { value: "TEXT", label: "Text" },
  { value: "CALL", label: "Call" },
  { value: "EMAIL", label: "Email" },
];

export const ATHLETE_LIST_COLUMNS: ListColumnConfig[] = [
  { key: "athleteName", type: "text", label: "Name" },
  { key: "position", type: "text" },
  { key: "school", type: "text" },
  { key: "tier", type: "status", statusMap: TIER_MAP },
  {
    key: "currentRecruitingStatus",
    type: "status",
    label: "Recruiting Status",
    statusMap: RECRUITING_STATUS_MAP,
  },
  { key: "recruiterName", type: "text", label: "Assigned Recruiter" },
];

export const ATHLETE_LIST_FILTERS: ListFilterConfig[] = [
  { key: "position", type: "select", options: POSITION_OPTIONS },
  {
    key: "currentRecruitingStatus",
    type: "select",
    label: "Recruiting Status",
    options: RECRUITING_STATUS_OPTIONS,
  },
];

// The ordinary Athlete record — reflects exactly what GET /api/athletes/
// [id] returns for the viewing role (full non-sensitive shape for ADMIN
// and RECRUITER alike; NON_ADMIN_ATHLETE_SELECT already excludes
// sensitiveInfo structurally). Government ID, date of birth, and home
// address are never configured here — they render only in the
// completely separate sensitive-info section below.
export const ATHLETE_DETAIL_FIELDS: DetailFieldConfig[] = [
  { key: "athleteName", type: "text", label: "Name" },
  { key: "preferredName", type: "text" },
  { key: "email", type: "text" },
  { key: "phone", type: "text" },
  { key: "recruiterName", type: "text", label: "Assigned Recruiter" },
  { key: "city", type: "text" },
  { key: "state", type: "text" },
  { key: "zip", type: "text" },
  { key: "position", type: "text" },
  { key: "secondaryPositions", type: "text", label: "Secondary Positions" },
  { key: "height", type: "text" },
  { key: "weight", type: "number" },
  { key: "dominantHand", type: "text", label: "Dominant Hand" },
  { key: "jerseyNumber", type: "number", label: "Jersey Number" },
  { key: "teamName", type: "text", label: "Team Name" },
  { key: "schoolType", type: "text", label: "School Type" },
  { key: "school", type: "text" },
  { key: "conference", type: "text" },
  { key: "currentAcademicYear", type: "text", label: "Academic Year" },
  { key: "eligibilityRemaining", type: "text", label: "Eligibility Remaining" },
  { key: "eligibilityVerified", type: "boolean", label: "Eligibility Verified" },
  { key: "major", type: "text" },
  { key: "gpa", type: "number", label: "GPA" },
  { key: "graduationYear", type: "number", label: "Graduation Year" },
  { key: "transferPortalStatus", type: "text", label: "Transfer Portal Status" },
  {
    key: "currentRecruitingStatus",
    type: "status",
    label: "Recruiting Status",
    statusMap: RECRUITING_STATUS_MAP,
  },
  { key: "tier", type: "status", statusMap: TIER_MAP },
  { key: "focus", type: "text" },
  { key: "signedDate", type: "date", label: "Signed Date" },
  { key: "parentGuardianName", type: "text", label: "Parent / Guardian" },
  { key: "parentPhone", type: "text", label: "Parent / Guardian Phone" },
  { key: "parentConsentRequired", type: "boolean", label: "Parent Consent Required" },
  { key: "parentConsentReceivedAt", type: "date", label: "Parent Consent Received" },
  { key: "preferredContactMethod", type: "text", label: "Preferred Contact Method" },
  { key: "communicationNotes", type: "textarea", fullWidth: true },
  { key: "lastCheckIn", type: "date", label: "Last Check-In" },
  { key: "nextCheckIn", type: "date", label: "Next Check-In" },
  { key: "intakeStatus", type: "text", label: "Intake Status" },
  { key: "profileComplete", type: "boolean", label: "Profile Complete" },
];

// ADMIN-only form (see ATHLETE_ADMIN_ONLY_ACTIONS) — RECRUITER never
// reaches edit mode on this page at all, so no `roles` filtering is
// needed on individual fields the way Recruiter's module needed it.
// recruiterId reassignment is deliberately not exposed here — same call
// as Prospect's module: no recruiter-picker UI exists, and the detail
// view's recruiterName already covers "who owns this" as read-only info.
export const ATHLETE_FORM_FIELDS: FormFieldConfig[] = [
  { name: "athleteName", type: "text", required: true, placeholder: "e.g. Jordan Blake" },
  { name: "preferredName", type: "text" },
  { name: "email", type: "text", placeholder: "name@example.com" },
  { name: "phone", type: "text", placeholder: "(555) 123-4567" },
  { name: "city", type: "text" },
  { name: "state", type: "text" },
  { name: "zip", type: "text" },
  { name: "position", type: "select", options: POSITION_OPTIONS },
  {
    name: "secondaryPositions",
    type: "multiselect",
    label: "Secondary Positions",
    options: POSITION_OPTIONS,
  },
  { name: "height", type: "text", placeholder: "e.g. 6'2\"" },
  { name: "weight", type: "number" },
  { name: "dominantHand", type: "select", options: DOMINANT_HAND_OPTIONS },
  { name: "jerseyNumber", type: "number" },
  { name: "teamName", type: "text" },
  { name: "schoolType", type: "select", options: SCHOOL_TYPE_OPTIONS },
  { name: "school", type: "text" },
  { name: "conference", type: "text" },
  { name: "currentAcademicYear", type: "select", options: ACADEMIC_YEAR_OPTIONS },
  { name: "eligibilityRemaining", type: "text", placeholder: "e.g. 2 years" },
  { name: "major", type: "text" },
  { name: "gpa", type: "number" },
  { name: "graduationYear", type: "number" },
  { name: "transferPortalStatus", type: "select", options: TRANSFER_PORTAL_OPTIONS },
  { name: "currentRecruitingStatus", type: "select", options: RECRUITING_STATUS_OPTIONS },
  { name: "tier", type: "select", options: TIER_OPTIONS },
  { name: "focus", type: "select", options: FOCUS_OPTIONS },
  { name: "signedDate", type: "date" },
  { name: "parentGuardianName", type: "text" },
  { name: "parentPhone", type: "text" },
  { name: "parentConsentRequired", type: "boolean" },
  { name: "parentConsentReceivedAt", type: "date" },
  { name: "preferredContactMethod", type: "select", options: CONTACT_METHOD_OPTIONS },
  { name: "communicationNotes", type: "textarea" },
  { name: "lastCheckIn", type: "date" },
  { name: "nextCheckIn", type: "date" },
  { name: "intakeStatus", type: "text" },
  { name: "profileComplete", type: "boolean" },
];

// --- Sensitive info: entirely separate config, entirely separate form ---
// Never imported by anything that renders for a non-admin viewer. The
// structural absence that actually protects this data is the caller
// checking hasOwnProperty(record, "sensitiveInfo") before ever reaching
// this config at all — see AthleteDetailClient.tsx.
export const ATHLETE_SENSITIVE_DETAIL_FIELDS: DetailFieldConfig[] = [
  { key: "dateOfBirth", type: "date", label: "Date of Birth" },
  { key: "homeAddress", type: "text", label: "Home Address" },
  { key: "governmentIdUrl", type: "text", label: "Government ID Reference" },
];

export const ATHLETE_SENSITIVE_FORM_FIELDS: FormFieldConfig[] = [
  { name: "dateOfBirth", type: "date", label: "Date of Birth" },
  { name: "homeAddress", type: "text", label: "Home Address" },
  {
    name: "governmentIdUrl",
    type: "text",
    label: "Government ID Reference",
    helpText: "A reference to the stored document, not a file upload — that pipeline isn't built yet.",
  },
];

// Same "omit empty values rather than send them" reasoning as the
// Recruiter/Prospect modules' payload builders.
export function buildAthletePayload(
  values: Record<string, unknown>,
): Record<string, unknown> {
  const payload: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(values)) {
    if (value === "") continue;
    payload[key] = value;
  }
  return payload;
}
