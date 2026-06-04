"use client";

import { useActionState, useState } from "react";
import { signUpAction } from "./actions";
import AvatarPicker from "@/components/ui/AvatarPicker";
import Link from "next/link";

export default function SignUpPage() {
  const [state, action, pending] = useActionState(signUpAction, null);
  const [avatarId, setAvatarId] = useState(1);

  return (
    <div className="min-h-screen bg-dream-bg flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="text-5xl mb-4">🌙</div>
          <h1 className="font-sans text-2xl font-bold text-dream-text">
            Join DreamNet <span className="text-dream-gold">✦</span>
          </h1>
          <p className="font-sans text-dream-muted text-sm mt-1">Begin your dream journey.</p>
        </div>

        {/* Error */}
        {state?.error && (
          <p className="text-red-400 font-sans text-sm text-center bg-red-400/10 rounded-xl py-2 px-4">
            {state.error}
          </p>
        )}

        <form action={action} className="space-y-4">
          {/* Username */}
          <div>
            <label className="font-sans text-dream-text text-sm font-medium block mb-1.5">Username</label>
            <input
              name="username"
              required
              placeholder="Choose a username"
              className="w-full bg-white/8 border border-white/15 rounded-xl px-4 py-3 text-dream-text font-sans text-sm placeholder:text-dream-muted/60 focus:outline-none focus:border-dream-violet focus:bg-white/10 transition-colors"
            />
          </div>

          {/* Email */}
          <div>
            <label className="font-sans text-dream-text text-sm font-medium block mb-1.5">Email</label>
            <input
              name="email"
              type="email"
              required
              placeholder="Enter your email"
              className="w-full bg-white/8 border border-white/15 rounded-xl px-4 py-3 text-dream-text font-sans text-sm placeholder:text-dream-muted/60 focus:outline-none focus:border-dream-violet focus:bg-white/10 transition-colors"
            />
          </div>

          {/* Password */}
          <div>
            <label className="font-sans text-dream-text text-sm font-medium block mb-1.5">Password</label>
            <input
              name="password"
              type="password"
              required
              placeholder="Create a password (min. 6 characters)"
              className="w-full bg-white/8 border border-white/15 rounded-xl px-4 py-3 text-dream-text font-sans text-sm placeholder:text-dream-muted/60 focus:outline-none focus:border-dream-violet focus:bg-white/10 transition-colors"
            />
          </div>

          {/* Avatar */}
          <div>
            <label className="font-sans text-dream-text text-sm font-medium block mb-3">Choose your avatar</label>
            <AvatarPicker selected={avatarId} onChange={setAvatarId} />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={pending}
            className="dream-btn w-full py-3 text-white disabled:opacity-60"
          >
            {pending ? "Creating account..." : "✦ Create Account ✦"}
          </button>
        </form>

        <p className="font-sans text-dream-muted text-sm text-center">
          Already dreaming?{" "}
          <Link href="/auth/signin" className="text-dream-violet hover:text-dream-bright transition-colors font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
