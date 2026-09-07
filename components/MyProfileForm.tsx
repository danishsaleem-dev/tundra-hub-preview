"use client";

import { useEffect, useState } from "react";
import { Panel } from "@/components/Panel";
import { TextField } from "@/components/TextField";
import { SelectField } from "@/components/SelectField";
import { StatusChip } from "@/components/StatusChip";
import { Button } from "@/components/Button";
import { useToast } from "@/components/ToastProvider";
import { ENTITY_LABELS } from "@/lib/labels";

// Exactly the ATHLETE_SELF_EDITABLE_FIELDS list from
// lib/validation/athlete.ts — this UI must never be able to construct a
// PATCH body containing any other key, so the field list lives here as
// the single source of what renders, not just what the server happens to
// accept.
const POSITION_OPTIONS = [
  { value: "", label: "Not set" },
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

interface SocialHandles {
  instagram: string;
  twitter: string;
  tiktok: string;
  youtube: string;
  snapchat: string;
}

const EMPTY_SOCIALS: SocialHandles = {
  instagram: "",
  twitter: "",
  tiktok: "",
  youtube: "",
  snapchat: "",
};

interface FormState {
  preferredName: string;
  phone: string;
  position: string;
  school: string;
  conference: string;
  socials: SocialHandles;
  parentGuardianName: string;
  parentPhone: string;
  eligibilityRemaining: string;
}

const EMPTY_FORM: FormState = {
  preferredName: "",
  phone: "",
  position: "",
  school: "",
  conference: "",
  socials: EMPTY_SOCIALS,
  parentGuardianName: "",
  parentPhone: "",
  eligibilityRemaining: "",
};

function readSocials(raw: unknown): SocialHandles {
  if (!raw || typeof raw !== "object") return EMPTY_SOCIALS;
  const value = raw as Record<string, unknown>;
  return {
    instagram: typeof value.instagram === "string" ? value.instagram : "",
    twitter: typeof value.twitter === "string" ? value.twitter : "",
    tiktok: typeof value.tiktok === "string" ? value.tiktok : "",
    youtube: typeof value.youtube === "string" ? value.youtube : "",
    snapchat: typeof value.snapchat === "string" ? value.snapchat : "",
  };
}

export interface MyProfileFormProps {
  athleteId: string;
}

export function MyProfileForm({ athleteId }: MyProfileFormProps) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [athleteName, setAthleteName] = useState("");
  const [eligibilityVerified, setEligibilityVerified] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch(`/api/athletes/${athleteId}`);
        const body = await res.json().catch(() => null);

        if (!res.ok || !body) {
          if (!cancelled) {
            showToast("critical", "Couldn't load your profile. Try refreshing.");
          }
          return;
        }

        const { athlete } = body;
        if (cancelled) return;

        setAthleteName(athlete.athleteName ?? "");
        setEligibilityVerified(Boolean(athlete.eligibilityVerified));
        setForm({
          preferredName: athlete.preferredName ?? "",
          phone: athlete.phone ?? "",
          position: athlete.position ?? "",
          school: athlete.school ?? "",
          conference: athlete.conference ?? "",
          socials: readSocials(athlete.socialProfiles),
          parentGuardianName: athlete.parentGuardianName ?? "",
          parentPhone: athlete.parentPhone ?? "",
          eligibilityRemaining: athlete.eligibilityRemaining ?? "",
        });
      } catch {
        if (!cancelled) {
          showToast("critical", "Couldn't reach the server. Try refreshing.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [athleteId, showToast]);

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function updateSocial(key: keyof SocialHandles, value: string) {
    setForm((prev) => ({ ...prev, socials: { ...prev.socials, [key]: value } }));
  }

  async function handleSave() {
    setSaving(true);

    const socialEntries = Object.entries(form.socials).filter(
      ([, value]) => value.trim() !== "",
    );

    // The whole request/parse sequence is wrapped — a rejected fetch()
    // (a real network failure, not just a non-2xx status) is just as
    // capable of leaving the button stuck in its loading state with no
    // feedback as a bad response body is, and both were observed for
    // real against a flaky connection while testing this screen.
    try {
      const res = await fetch(`/api/athletes/${athleteId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          preferredName: form.preferredName || null,
          phone: form.phone || null,
          position: form.position || null,
          school: form.school || null,
          conference: form.conference || null,
          socialProfiles: socialEntries.length > 0 ? Object.fromEntries(socialEntries) : null,
          parentGuardianName: form.parentGuardianName || null,
          parentPhone: form.parentPhone || null,
          eligibilityRemaining: form.eligibilityRemaining || null,
        }),
      });

      const body = await res.json().catch(() => null);

      if (!res.ok || !body) {
        showToast(
          "critical",
          body?.error ?? "Couldn't save your profile. Try again.",
        );
        return;
      }

      // Trust the server's returned value rather than predicting the
      // eligibility-reset rule client-side — toAthletePrismaData()
      // already owns that logic, this just reflects whatever it decided.
      setEligibilityVerified(Boolean(body.athlete.eligibilityVerified));
      showToast("success", "Profile saved.");
    } catch {
      showToast("critical", "Couldn't reach the server. Try again.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <Panel title={`${ENTITY_LABELS.athlete.singular} Profile`}>
        <p className="text-sm text-neutral-text">Loading your profile…</p>
      </Panel>
    );
  }

  return (
    <Panel
      title={`${ENTITY_LABELS.athlete.singular} Profile`}
      description={athleteName}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TextField
          label="Preferred Name"
          value={form.preferredName}
          onChange={(e) => updateField("preferredName", e.target.value)}
        />
        <TextField
          label="Phone"
          type="tel"
          value={form.phone}
          onChange={(e) => updateField("phone", e.target.value)}
        />
        <SelectField
          label="Position"
          options={POSITION_OPTIONS}
          value={form.position}
          onChange={(value) => updateField("position", value)}
        />
        <TextField
          label="School"
          value={form.school}
          onChange={(e) => updateField("school", e.target.value)}
        />
        <TextField
          label="Conference"
          value={form.conference}
          onChange={(e) => updateField("conference", e.target.value)}
        />

        <div className="sm:col-span-2">
          <p className="text-sm font-semibold text-surface-navy">
            Social Handles
          </p>
          <div className="mt-1.5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <TextField
              label="Instagram"
              placeholder="@handle"
              value={form.socials.instagram}
              onChange={(e) => updateSocial("instagram", e.target.value)}
            />
            <TextField
              label="Twitter / X"
              placeholder="@handle"
              value={form.socials.twitter}
              onChange={(e) => updateSocial("twitter", e.target.value)}
            />
            <TextField
              label="TikTok"
              placeholder="@handle"
              value={form.socials.tiktok}
              onChange={(e) => updateSocial("tiktok", e.target.value)}
            />
            <TextField
              label="YouTube"
              placeholder="@handle"
              value={form.socials.youtube}
              onChange={(e) => updateSocial("youtube", e.target.value)}
            />
            <TextField
              label="Snapchat"
              placeholder="@handle"
              value={form.socials.snapchat}
              onChange={(e) => updateSocial("snapchat", e.target.value)}
            />
          </div>
        </div>

        <TextField
          label="Parent / Guardian Name"
          value={form.parentGuardianName}
          onChange={(e) => updateField("parentGuardianName", e.target.value)}
        />
        <TextField
          label="Parent / Guardian Phone"
          type="tel"
          value={form.parentPhone}
          onChange={(e) => updateField("parentPhone", e.target.value)}
        />

        <div>
          <TextField
            label="Eligibility Remaining"
            placeholder="e.g. 2 years"
            value={form.eligibilityRemaining}
            onChange={(e) => updateField("eligibilityRemaining", e.target.value)}
          />
          <div className="mt-1.5 flex items-center gap-1.5">
            <span className="text-xs text-neutral-text">
              Eligibility Verified:
            </span>
            <StatusChip
              variant={eligibilityVerified ? "success" : "neutral"}
              label={eligibilityVerified ? "Verified" : "Not Verified"}
            />
          </div>
          <p className="mt-1 text-xs text-neutral-text">
            Only an admin can verify eligibility. Changing the value above
            resets this to unverified.
          </p>
        </div>

        <div className="flex items-end sm:col-span-2">
          <Button onClick={handleSave} loading={saving}>
            Save Profile
          </Button>
        </div>
      </div>
    </Panel>
  );
}
