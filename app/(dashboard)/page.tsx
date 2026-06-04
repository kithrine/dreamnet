import { getFeaturedDream } from "@/lib/featured";
import { getTopDreams } from "@/lib/ranking";
import { getTrendingTags } from "@/lib/tags";
import { getTopDreamers } from "@/lib/dreamers";
import FeaturedDreamCard from "@/components/dreams/FeaturedDreamCard";
import DreamCard from "@/components/dreams/DreamCard";
import TrendingTags from "@/components/dashboard/TrendingTags";
import TopDreamers from "@/components/dashboard/TopDreamers";
import Link from "next/link";

export default async function DashboardPage() {
  const [featured, topDreams, trendingTags, topDreamers] = await Promise.all([
    getFeaturedDream(),
    getTopDreams(5),
    getTrendingTags(8),
    getTopDreamers(5),
  ]);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Sticky search bar */}
      <div className="sticky top-0 z-30 glass-surface border-b border-white/8 px-6 py-3 flex items-center gap-4">
        <div className="flex-1 flex items-center gap-2 rounded-full bg-white/8 border border-white/15 px-4 py-2">
          <svg className="w-4 h-4 text-dream-muted flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <Link href="/explore" className="flex-1 font-sans text-sm text-dream-muted/70 hover:text-dream-muted transition-colors">
            Search dreams, users, or tags...
          </Link>
          <span className="text-dream-gold text-sm">✦</span>
        </div>
        <Link href="/activity" aria-label="Notifications">
          <svg className="w-5 h-5 text-dream-muted hover:text-dream-text transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </Link>
      </div>

      {/* Main content */}
      <div className="flex gap-6 p-6 max-w-6xl mx-auto w-full">
        <div className="flex-1 space-y-8 min-w-0">
          {featured && (
            <section>
              <h2 className="font-sans font-semibold text-dream-gold text-sm mb-3 flex items-center gap-2">
                ⭐ Featured Dream
              </h2>
              <FeaturedDreamCard dream={featured} />
            </section>
          )}

          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-sans font-semibold text-dream-text text-sm flex items-center gap-2">
                🌙 Top Dreams
              </h2>
              <Link href="/explore?sort=top" className="font-sans text-dream-violet text-xs hover:text-dream-bright transition-colors">
                View all →
              </Link>
            </div>
            <div className="space-y-3">
              {topDreams.map((dream, i) => (
                <DreamCard key={dream.id} dream={dream} rank={i + 1} />
              ))}
              {topDreams.length === 0 && (
                <p className="font-sans text-dream-muted text-sm">No dreams yet. Be the first!</p>
              )}
            </div>
          </section>
        </div>

        <aside className="w-72 flex-shrink-0 space-y-5">
          <TrendingTags tags={trendingTags} />
          <TopDreamers dreamers={topDreamers} />

          {/* Promo card */}
          <div className="dream-card p-5 text-center space-y-3">
            <div className="text-4xl">⭐</div>
            <div className="font-sans text-dream-text text-sm space-y-1">
              <p>Share your dreams.</p>
              <p>Connect with dreamers.</p>
              <p>Explore endless worlds.</p>
            </div>
            <Link
              href="/dreams/new"
              className="dream-btn inline-flex items-center gap-2 px-5 py-2.5 text-sm text-white no-underline"
            >
              ✦ Share a Dream
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
