"use client";

import { useState, useTransition } from "react";
import Button from "@/components/ui/Button";

interface CommentInputProps {
  onSubmit: (content: string) => Promise<{ error?: string; success?: boolean }>;
  placeholder?: string;
  onCancel?: () => void;
}

export default function CommentInput({ onSubmit, placeholder = "Write a comment...", onCancel }: CommentInputProps) {
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result = await onSubmit(content);
      if (result.error) {
        setError(result.error);
      } else {
        setContent("");
        setError(null);
        onCancel?.();
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      {error && <p className="font-sans text-red-400 text-sm">{error}</p>}
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
        rows={3}
        className="w-full bg-white/8 border border-white/15 rounded-xl px-4 py-3 text-dream-text font-sans text-sm placeholder:text-dream-muted/60 focus:outline-none focus:border-dream-violet focus:bg-white/10 transition-colors resize-none"
      />
      <div className="flex gap-2">
        <Button type="submit" disabled={isPending || !content.trim()}>
          {isPending ? "Posting..." : "Post +1★"}
        </Button>
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
        )}
      </div>
    </form>
  );
}
