"use client";

import { useActionState } from "react";
import Button from "@/components/ui/Button";

type Action = (prev: unknown, formData: FormData) => Promise<{ error: string } | void>;

export default function DreamForm({ action }: { action: Action }) {
  const [state, formAction, pending] = useActionState(action, null);

  return (
    <form action={formAction} className="space-y-6">
      {state?.error && (
        <p className="font-sans text-red-400 text-sm">{state.error}</p>
      )}
      <div>
        <label className="font-sans font-medium text-dream-muted text-sm block mb-2">Dream Title</label>
        <input
          name="title"
          required
          maxLength={120}
          placeholder="Give your dream a name..."
          className="w-full bg-white/8 border border-white/15 rounded-xl px-4 py-3 text-dream-text font-sans text-sm focus:outline-none focus:border-dream-violet focus:bg-white/10 transition-colors"
        />
      </div>
      <div>
        <label className="font-sans font-medium text-dream-muted text-sm block mb-2">Your Dream</label>
        <textarea
          name="content"
          required
          rows={12}
          placeholder="Describe your dream in as much detail as you remember..."
          className="w-full bg-white/8 border border-white/15 rounded-xl px-4 py-3 text-dream-text font-sans text-sm focus:outline-none focus:border-dream-violet focus:bg-white/10 transition-colors resize-none"
        />
      </div>
      <div>
        <label className="font-sans font-medium text-dream-muted text-sm block mb-2">Tags (comma-separated)</label>
        <input
          name="tags"
          placeholder="lucid, flying, ocean..."
          className="w-full bg-white/8 border border-white/15 rounded-xl px-4 py-3 text-dream-text font-sans text-sm focus:outline-none focus:border-dream-violet focus:bg-white/10 transition-colors"
        />
        <p className="font-sans text-dream-muted text-sm mt-1">Up to 10 tags.</p>
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Saving..." : "Save Dream +2★"}
      </Button>
    </form>
  );
}
