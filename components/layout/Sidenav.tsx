"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Session } from "next-auth";
import { signOut } from "next-auth/react";
import UserCard from "./UserCard";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/",          label: "Home",      icon: "🏠" },
  { href: "/explore",   label: "Explore",   icon: "🔍" },
  { href: "/activity",  label: "Activity",  icon: "💬" },
];

export default function Sidenav({ session }: { session: Session }) {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-dream-surface flex flex-col z-40 border-r border-dream-border">
      {/* Logo */}
      <div className="p-6 border-b border-dream-border">
        <h1 className="font-pixel text-dream-bright text-sm leading-relaxed">DREAMNET</h1>
        <p className="font-pixel text-dream-muted text-xs mt-1">Log it. Share it. Live it.</p>
      </div>

      {/* Save a Dream CTA */}
      <div className="px-4 pt-4">
        <Link
          href="/dreams/new"
          className="block w-full text-center font-pixel text-xs bg-dream-violet text-white pixel-border py-3 hover:bg-dream-bright transition-colors"
        >
          + SAVE A DREAM
        </Link>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 px-4 pt-4 space-y-1">
        {NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2 font-pixel text-xs transition-colors",
              pathname === link.href
                ? "bg-dream-purple text-dream-bright"
                : "text-dream-muted hover:text-dream-text hover:bg-dream-purple"
            )}
          >
            <span>{link.icon}</span>
            {link.label}
          </Link>
        ))}
        <Link
          href={`/profile/${session.user.username}`}
          className={cn(
            "flex items-center gap-3 px-3 py-2 font-pixel text-xs transition-colors",
            pathname.startsWith("/profile")
              ? "bg-dream-purple text-dream-bright"
              : "text-dream-muted hover:text-dream-text hover:bg-dream-purple"
          )}
        >
          <span>👤</span> Profile
        </Link>
        <Link
          href="/game"
          className={cn(
            "flex items-center gap-3 px-3 py-2 font-pixel text-xs transition-colors",
            pathname === "/game"
              ? "bg-dream-purple text-dream-bright"
              : "text-dream-muted hover:text-dream-text hover:bg-dream-purple"
          )}
        >
          <span>🎮</span> Dream Game
        </Link>
      </nav>

      {/* User Card */}
      <div className="p-4 border-t border-dream-border">
        <UserCard session={session} />
        <button
          onClick={() => signOut({ callbackUrl: "/auth/signin" })}
          className="mt-2 w-full font-pixel text-xs text-dream-muted hover:text-red-400 text-left px-3 py-1"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}
