"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/Button";
import { Modal } from "@/components/Modal";
import { TextField } from "@/components/TextField";
import { SelectField } from "@/components/SelectField";

export function ModalDemo() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button icon={<Plus className="h-3.5 w-3.5" />} onClick={() => setOpen(true)}>
        Add Athlete
      </Button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Add Athlete"
        description="Add a new athlete to the roster"
        footer={
          <>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setOpen(false)}>Add Athlete</Button>
          </>
        }
      >
        <div className="space-y-4">
          <TextField label="Full Name" placeholder="Caleb Fontaine" />
          <SelectField
            label="Position"
            options={[
              { value: "qb", label: "QB" },
              { value: "wr", label: "WR" },
              { value: "rb", label: "RB" },
            ]}
          />
          <TextField label="School" placeholder="University of Georgia" />
        </div>
      </Modal>
    </>
  );
}
