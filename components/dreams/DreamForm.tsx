"use client";

import { useActionState } from "react";
import Button from "@/components/ui/Button";

type Action = (prev: unknown, formData: FormData) => Promise<{ error: string } | void>;

export default function DreamForm({ action }: { action: Action }) {
  const [state, formAction, pending] = useActionState(action, null);

  return (
    <form action={formAction} className="space-y-6">
      {state?.error && (
        <p className="font-pixel text-red-400 text-xs">{state.error}</p>
      )}
      <div>
        <label className="font-pixel text-dream-muted text-xs block mb-2">DREAM TITLE</label>
        <input
          name="title"
          required
          maxLength={120}
          placeholder="Give your dream a name..."
          className="w-full bg-dream-purple border border-dream-border p-3 text-dream-text font-sans focus:outline-none focus:border-dream-violet"
        />
      </div>
      <div>
        <label className="font-pixel text-dream-muted text-xs block mb-2">YOUR DREAM</label>
        <textarea
          name="content"
          required
          rows={12}
          placeholder="Describe your dream in as much detail as you remember..."
          className="w-full bg-dream-purple border border-dream-border p-3 text-dream-text font-sans focus:outline-none focus:border-dream-violet resize-none"
        />
      </div>
      <div>
        <label className="font-pixel text-dream-muted text-xs block mb-2">TAGS (comma-separated)</label>
        <input
          name="tags"
          placeholder="lucid, flying, ocean..."
          className="w-full bg-dream-purple border border-dream-border p-3 text-dream-text font-sans focus:outline-none focus:border-dream-violet"
        />
        <p className="font-pixel text-dream-muted text-xs mt-1">Up to 10 tags.</p>
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "SAVING..." : "SAVE DREAM +2★"}
      </Button>
    </form>
  );
}
