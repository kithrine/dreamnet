"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Session } from "next-auth";
import { signOut } from "next-auth/react";
import UserCard from "./UserCard";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  {
    href: "/",
    label: "Home",
    svgPath:
      "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
  },
  {
    href: "/explore",
    label: "Explore",
    svgPath: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
  },
  {
    href: "/explore?sort=top",
    label: "Top Dreams",
    svgPath:
      "M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z",
  },
  {
    href: "/activity",
    label: "Activity",
    svgPath:
      "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z",
  },
  {
    href: "/game",
    label: "Game",
    svgPath:
      "M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  },
];

const PROFILE_SVG =
  "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z";

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
          <span className="text-base font-light">+</span> Share a Dream
        </Link>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 px-3 pt-4 space-y-0.5 overflow-y-auto">
        {NAV_LINKS.map((link) => {
          const basePath = link.href.split("?")[0];
          const isActive =
            basePath === "/" ? pathname === "/" : pathname.startsWith(basePath);

          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl font-sans text-sm transition-colors",
                isActive
                  ? "bg-dream-purple/70 text-dream-bright font-semibold"
                  : "text-dream-muted hover:text-dream-text hover:bg-white/6"
              )}
            >
              <svg
                className="w-5 h-5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={1.75}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d={link.svgPath} />
              </svg>
              {link.label}
            </Link>
          );
        })}

        {/* Profile link */}
        <Link
          href={`/profile/${session.user.username}`}
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-xl font-sans text-sm transition-colors",
            pathname.startsWith("/profile")
              ? "bg-dream-purple/70 text-dream-bright font-semibold"
              : "text-dream-muted hover:text-dream-text hover:bg-white/6"
          )}
        >
          <svg
            className="w-5 h-5 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={1.75}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d={PROFILE_SVG} />
          </svg>
          Profile
        </Link>
      </nav>

      {/* Sidebar illustration slot — gradient placeholder */}
      {/* Drop a file at /public/images/sidebar-bg.png and swap the src below */}
      <div className="relative h-56 overflow-hidden mx-0 flex-shrink-0">
        <div className="absolute inset-0 bg-gradient-to-b from-dream-purple/10 via-dream-violet/25 to-dream-bg" />
        <div className="absolute top-6  left-8  text-dream-gold/50 text-base select-none">✦</div>
        <div className="absolute top-12 right-10 text-dream-gold/30 text-xs  select-none">✦</div>
        <div className="absolute top-20 left-20 text-dream-gold/20 text-xs  select-none">✦</div>
        <div className="absolute top-8  right-6  text-dream-rose/30 text-xs  select-none">✦</div>
        <div className="absolute inset-0 flex items-center justify-center opacity-10">
          <span className="text-8xl">🌙</span>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-dream-surface via-dream-surface/70 to-transparent" />
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
