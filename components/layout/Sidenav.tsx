"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Session } from "next-auth";
import { signOut } from "next-auth/react";
import UserCard from "./UserCard";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/",         label: "Home",       icon: "🏠" },
  { href: "/explore",  label: "Explore",    icon: "🔍" },
  { href: "/activity", label: "Activity",   icon: "💬" },
];

export default function Sidenav({ session }: { session: Session }) {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-dream-surface flex flex-col z-40 border-r border-white/8">
      {/* Logo */}
      <div className="px-6 pt-7 pb-5 border-b border-white/8">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🌙</span>
          <h1 className="font-display text-3xl text-dream-text leading-none">DreamNet</h1>
        </div>
        <p className="font-sans text-dream-muted text-xs mt-2 ml-1">Share dreams. Inspire wonder.</p>
      </div>

      {/* Share a Dream CTA */}
      <div className="px-4 pt-5">
        <Link
          href="/dreams/new"
          className="dream-btn flex items-center justify-center gap-2 w-full py-3 text-sm text-white no-underline"
        >
          <span>✦</span> Share a Dream
        </Link>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 px-3 pt-4 space-y-1 overflow-y-auto">
        {NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl font-sans text-sm transition-colors",
              pathname === link.href
                ? "bg-dream-purple/60 text-dream-text font-medium"
                : "text-dream-muted hover:text-dream-text hover:bg-white/6"
            )}
          >
            <span className="text-base">{link.icon}</span>
            {link.label}
          </Link>
        ))}
        <Link
          href={`/profile/${session.user.username}`}
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-xl font-sans text-sm transition-colors",
            pathname.startsWith("/profile")
              ? "bg-dream-purple/60 text-dream-text font-medium"
              : "text-dream-muted hover:text-dream-text hover:bg-white/6"
          )}
        >
          <span className="text-base">👤</span> Profile
        </Link>
        <Link
          href="/game"
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-xl font-sans text-sm transition-colors",
            pathname === "/game"
              ? "bg-dream-purple/60 text-dream-text font-medium"
              : "text-dream-muted hover:text-dream-text hover:bg-white/6"
          )}
        >
          <span className="text-base">🎮</span> Dream Game
        </Link>
      </nav>

      {/* Sidebar illustration slot */}
      {/* DROP YOUR IMAGE AT /public/sidebar-bg.jpg — gradient shows until then */}
      <div className="relative h-48 overflow-hidden mx-0 flex-shrink-0">
        <div className="absolute inset-0 bg-gradient-to-b from-dream-purple/20 via-dream-purple/60 to-dream-bg" />
        <img
          src="/sidebar-bg.jpg"
          alt=""
          className="w-full h-full object-cover object-top absolute inset-0"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = "none";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dream-surface via-dream-surface/60 to-transparent" />
      </div>

      {/* User Card + Sign out */}
      <div className="px-4 pb-5 pt-3 border-t border-white/8 flex-shrink-0">
        <UserCard session={session} />
        <button
          onClick={() => signOut({ callbackUrl: "/auth/signin" })}
          className="mt-2 w-full font-sans text-xs text-dream-muted hover:text-red-400 text-left px-3 py-1 transition-colors"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}
