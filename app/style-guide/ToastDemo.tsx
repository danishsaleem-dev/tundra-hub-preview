"use client";

import { Button } from "@/components/Button";
import { useToast } from "@/components/ToastProvider";

export function ToastDemo() {
  const { showToast } = useToast();

  return (
    <div className="flex flex-wrap gap-3">
      <Button
        size="sm"
        onClick={() => showToast("success", "Changes saved successfully.")}
      >
        Show Success
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() =>
          showToast("warning", "Payment reminder sent to Velocity Apparel.")
        }
      >
        Show Warning
      </Button>
      <Button
        variant="outline-danger"
        size="sm"
        onClick={() => showToast("critical", "Failed to update password.")}
      >
        Show Error
      </Button>
    </div>
  );
}
