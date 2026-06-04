"use client";

import { signIn } from "next-auth/react";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Button from "@/components/ui/Button";
import Link from "next/link";

function SignInContent() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const params = useSearchParams();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    const result = await signIn("credentials", {
      email: form.get("email"),
      password: form.get("password"),
      redirect: false,
    });
    setLoading(false);
    if (result?.error) {
      setError("Invalid email or password.");
    } else {
      router.push("/");
      router.refresh();
    }
  }

  return (
    <div className="w-full max-w-md bg-dream-surface pixel-border p-8 space-y-6">
      <h1 className="font-pixel text-dream-bright text-sm text-center">DREAMNET</h1>
      <p className="font-pixel text-dream-muted text-xs text-center">Log it. Share it. Live it.</p>
      {params.get("registered") && (
        <p className="text-green-400 font-pixel text-xs">Account created! Sign in below.</p>
      )}
      {error && <p className="text-red-400 font-pixel text-xs">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="font-pixel text-dream-muted text-xs block mb-2">EMAIL</label>
          <input name="email" type="email" required className="w-full bg-dream-purple border border-dream-border p-2 text-dream-text font-sans focus:outline-none focus:border-dream-violet" />
        </div>
        <div>
          <label className="font-pixel text-dream-muted text-xs block mb-2">PASSWORD</label>
          <input name="password" type="password" required className="w-full bg-dream-purple border border-dream-border p-2 text-dream-text font-sans focus:outline-none focus:border-dream-violet" />
        </div>
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "SIGNING IN..." : "SIGN IN"}
        </Button>
      </form>
      <p className="font-pixel text-dream-muted text-xs text-center">
        New dreamer?{" "}
        <Link href="/auth/signup" className="text-dream-violet hover:text-dream-bright">CREATE ACCOUNT</Link>
      </p>
    </div>
  );
}

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-dream-bg flex items-center justify-center p-4">
      <Suspense fallback={<div className="font-pixel text-dream-muted text-xs">Loading...</div>}>
        <SignInContent />
      </Suspense>
    </div>
  );
}
