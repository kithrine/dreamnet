"use client";

import { signIn } from "next-auth/react";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function SignInContent() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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
    <div className="w-full max-w-md space-y-6">
      {/* Icon */}
      <div className="text-center">
        <div className="text-5xl mb-4">⭐</div>
        <h1 className="font-sans text-2xl font-bold text-dream-text">
          Welcome back <span className="text-dream-gold">✦</span>
        </h1>
        <p className="font-sans text-dream-muted text-sm mt-1">Log in to continue your journey.</p>
      </div>

      {/* Success message */}
      {params.get("registered") && (
        <p className="text-green-400 font-sans text-sm text-center bg-green-400/10 rounded-xl py-2 px-4">
          Account created! Sign in below.
        </p>
      )}

      {/* Error */}
      {error && (
        <p className="text-red-400 font-sans text-sm text-center bg-red-400/10 rounded-xl py-2 px-4">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email */}
        <div>
          <label className="font-sans text-dream-text text-sm font-medium block mb-1.5">
            Email or Username
          </label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-dream-muted">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <input
              name="email"
              type="email"
              required
              placeholder="Enter your email or username"
              className="w-full bg-white/8 border border-white/15 rounded-xl pl-10 pr-4 py-3 text-dream-text font-sans text-sm placeholder:text-dream-muted/60 focus:outline-none focus:border-dream-violet focus:bg-white/10 transition-colors"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="font-sans text-dream-text text-sm font-medium block mb-1.5">
            Password
          </label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-dream-muted">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              required
              placeholder="Enter your password"
              className="w-full bg-white/8 border border-white/15 rounded-xl pl-10 pr-10 py-3 text-dream-text font-sans text-sm placeholder:text-dream-muted/60 focus:outline-none focus:border-dream-violet focus:bg-white/10 transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-dream-muted hover:text-dream-text transition-colors"
            >
              {showPassword ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
          <div className="text-right mt-1.5">
            <span className="font-sans text-dream-violet text-xs cursor-pointer hover:text-dream-bright transition-colors">
              Forgot password?
            </span>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="dream-btn w-full py-3 text-white disabled:opacity-60"
        >
          {loading ? "Signing in..." : "✦ Log In ✦"}
        </button>
      </form>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-white/10" />
        <span className="font-sans text-dream-muted text-xs">or</span>
        <div className="flex-1 h-px bg-white/10" />
      </div>

      {/* Social buttons — visual only, disabled */}
      <div className="space-y-3">
        <button
          disabled
          className="w-full flex items-center justify-center gap-3 py-3 rounded-xl border border-white/20 bg-white/5 font-sans text-sm text-dream-muted opacity-50 cursor-not-allowed"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>

        <button
          disabled
          className="w-full flex items-center justify-center gap-3 py-3 rounded-xl border border-white/20 bg-white/5 font-sans text-sm text-dream-muted opacity-50 cursor-not-allowed"
        >
          <svg className="w-4 h-4 text-dream-muted" fill="currentColor" viewBox="0 0 24 24">
            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
          </svg>
          Continue with Apple
        </button>
      </div>

      <p className="font-sans text-dream-muted text-sm text-center">
        New to DreamNet?{" "}
        <Link href="/auth/signup" className="text-dream-violet hover:text-dream-bright transition-colors font-medium">
          Create an account
        </Link>
      </p>
    </div>
  );
}

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-dream-bg flex">
      {/* Left: illustrated background — DROP YOUR IMAGE AT /public/login-bg.jpg */}
      <div className="hidden lg:flex lg:flex-1 relative overflow-hidden bg-dream-purple/20">
        <div className="absolute inset-0 bg-gradient-to-br from-dream-purple/80 via-dream-bg/60 to-dream-bg" />
        <img
          src="/login-bg.jpg"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = "none";
          }}
        />
        {/* Overlay text */}
        <div className="relative z-10 flex flex-col justify-end p-12 pb-16">
          <h2 className="font-display text-6xl text-white mb-3">DreamNet</h2>
          <p className="font-sans text-white/70 text-lg">Share dreams. Inspire wonder.</p>
        </div>
      </div>

      {/* Right: form */}
      <div className="flex flex-1 lg:flex-none lg:w-[480px] items-center justify-center p-8">
        <Suspense>
          <SignInContent />
        </Suspense>
      </div>
    </div>
  );
}
