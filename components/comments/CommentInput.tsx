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
      {error && <p className="font-pixel text-red-400 text-xs">{error}</p>}
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
        rows={3}
        className="w-full bg-dream-purple border border-dream-border p-3 text-dream-text font-sans text-sm focus:outline-none focus:border-dream-violet resize-none"
      />
      <div className="flex gap-2">
        <Button type="submit" disabled={isPending || !content.trim()}>
          {isPending ? "POSTING..." : "POST +1★"}
        </Button>
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>CANCEL</Button>
        )}
      </div>
    </form>
  );
}
