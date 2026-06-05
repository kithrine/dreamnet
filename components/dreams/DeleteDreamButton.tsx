"use client";

import { useState, useTransition } from "react";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { archiveDreamAction } from "@/app/(dashboard)/dreams/[id]/actions";

export default function DeleteDreamButton({ dreamId }: { dreamId: string }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleConfirm() {
    // Wrap in block so arrow fn returns void (startTransition requires void callback)
    startTransition(() => { archiveDreamAction(dreamId); });
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="font-sans text-xs text-red-400/70 hover:text-red-400 transition-colors"
      >
        Delete
      </button>
      <ConfirmModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={handleConfirm}
        isPending={isPending}
        title="Delete this dream?"
        message="This will permanently delete your dream and all its comments. This action cannot be undone."
      />
    </>
  );
}
