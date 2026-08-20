"use client";

import { useState } from "react";
import { TopBar } from "@/components/TopBar";
import type { Role } from "@/lib/roles";

export function TopBarDemo() {
  const [role, setRole] = useState<Role>("admin");

  return <TopBar title="Dashboard" role={role} onRoleChange={setRole} />;
}
