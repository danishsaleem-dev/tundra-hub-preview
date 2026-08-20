"use client";

import { useState } from "react";
import { Button } from "@/components/Button";
import { Badge } from "@/components/Badge";

interface Record_ {
  id: string;
  email: string | null;
  inviteStatus: "NOT_INVITED" | "PENDING" | "ACTIVE";
}
interface AthleteRow extends Record_ {
  athleteName: string;
}
interface RecruiterRow extends Record_ {
  name: string;
}

export interface InviteTestPanelProps {
  athletes: AthleteRow[];
  recruiters: RecruiterRow[];
}

type Action = "invite" | "resend" | "revoke";

const ENDPOINT: Record<Action, string> = {
  invite: "/api/admin/invites",
  resend: "/api/admin/invites/resend",
  revoke: "/api/admin/invites/revoke",
};

export function InviteTestPanel({ athletes, recruiters }: InviteTestPanelProps) {
  const [log, setLog] = useState<string>("Responses will appear here.");
  const [pending, setPending] = useState<string | null>(null);

  async function run(
    action: Action,
    recordType: "ATHLETE" | "RECRUITER",
    recordId: string,
  ) {
    const key = `${action}:${recordId}`;
    setPending(key);
    try {
      const res = await fetch(ENDPOINT[action], {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recordType, recordId }),
      });
      const raw = await res.text();
      let body: unknown;
      try {
        body = raw ? JSON.parse(raw) : "(empty response body)";
      } catch {
        body = raw;
      }
      setLog(`${action.toUpperCase()} ${res.status}\n${JSON.stringify(body, null, 2)}`);
    } catch (err) {
      setLog(`${action.toUpperCase()} failed: ${String(err)}`);
    } finally {
      setPending(null);
      window.location.reload();
    }
  }

  function Row({
    recordType,
    id,
    label,
    email,
    inviteStatus,
  }: {
    recordType: "ATHLETE" | "RECRUITER";
    id: string;
    label: string;
    email: string | null;
    inviteStatus: Record_["inviteStatus"];
  }) {
    return (
      <div className="flex items-center justify-between gap-4 border-b border-card-tint py-3 last:border-0">
        <div>
          <p className="text-sm font-semibold text-surface-navy">{label}</p>
          <p className="text-xs text-neutral-text">{email ?? "no email"}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge label={inviteStatus} tone="light" />
          <Button
            size="sm"
            variant="outline"
            loading={pending === `invite:${id}`}
            disabled={inviteStatus !== "NOT_INVITED"}
            onClick={() => run("invite", recordType, id)}
          >
            Invite
          </Button>
          <Button
            size="sm"
            variant="outline"
            loading={pending === `resend:${id}`}
            disabled={inviteStatus === "ACTIVE"}
            onClick={() => run("resend", recordType, id)}
          >
            Resend
          </Button>
          <Button
            size="sm"
            variant="outline-danger"
            loading={pending === `revoke:${id}`}
            disabled={inviteStatus !== "PENDING"}
            onClick={() => run("revoke", recordType, id)}
          >
            Revoke
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="rounded-xl border border-card-tint bg-white p-5">
        <h2 className="mb-2 text-sm font-bold text-surface-navy">Recruiters</h2>
        {recruiters.map((r) => (
          <Row
            key={r.id}
            recordType="RECRUITER"
            id={r.id}
            label={r.name}
            email={r.email}
            inviteStatus={r.inviteStatus}
          />
        ))}
      </div>
      <div className="rounded-xl border border-card-tint bg-white p-5">
        <h2 className="mb-2 text-sm font-bold text-surface-navy">Athletes</h2>
        {athletes.map((a) => (
          <Row
            key={a.id}
            recordType="ATHLETE"
            id={a.id}
            label={a.athleteName}
            email={a.email}
            inviteStatus={a.inviteStatus}
          />
        ))}
      </div>
      <pre className="whitespace-pre-wrap rounded-xl border border-card-tint bg-surface-navy p-4 text-xs text-white">
        {log}
      </pre>
    </div>
  );
}
