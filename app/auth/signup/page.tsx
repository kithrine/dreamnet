"use client";

import { useActionState, useState } from "react";
import { signUpAction } from "./actions";
import AvatarPicker from "@/components/ui/AvatarPicker";
import Button from "@/components/ui/Button";
import Link from "next/link";

export default function SignUpPage() {
  const [state, action, pending] = useActionState(signUpAction, null);
  const [avatarId, setAvatarId] = useState(1);

  return (
    <div className="min-h-screen bg-dream-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-dream-surface pixel-border p-8 space-y-6">
        <h1 className="font-pixel text-dream-bright text-sm text-center">JOIN DREAMNET</h1>
        {state?.error && (
          <p className="text-red-400 font-pixel text-xs">{state.error}</p>
        )}
        <form action={action} className="space-y-4">
          <div>
            <label className="font-pixel text-dream-muted text-xs block mb-2">USERNAME</label>
            <input name="username" required className="w-full bg-dream-purple border border-dream-border p-2 text-dream-text font-sans focus:outline-none focus:border-dream-violet" />
          </div>
          <div>
            <label className="font-pixel text-dream-muted text-xs block mb-2">EMAIL</label>
            <input name="email" type="email" required className="w-full bg-dream-purple border border-dream-border p-2 text-dream-text font-sans focus:outline-none focus:border-dream-violet" />
          </div>
          <div>
            <label className="font-pixel text-dream-muted text-xs block mb-2">PASSWORD</label>
            <input name="password" type="password" required className="w-full bg-dream-purple border border-dream-border p-2 text-dream-text font-sans focus:outline-none focus:border-dream-violet" />
          </div>
          <div>
            <label className="font-pixel text-dream-muted text-xs block mb-2">CHOOSE YOUR AVATAR</label>
            <AvatarPicker selected={avatarId} onChange={setAvatarId} />
          </div>
          <Button type="submit" disabled={pending} className="w-full">
            {pending ? "CREATING..." : "CREATE ACCOUNT"}
          </Button>
        </form>
        <p className="font-pixel text-dream-muted text-xs text-center">
          Already dreaming?{" "}
          <Link href="/auth/signin" className="text-dream-violet hover:text-dream-bright">SIGN IN</Link>
        </p>
      </div>
    </div>
  );
}
