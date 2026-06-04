import { getFeaturedDream } from "@/lib/featured";
import { getTopDreams } from "@/lib/ranking";
import { getTrendingTags } from "@/lib/tags";
import { getTopDreamers } from "@/lib/dreamers";
import { getRecentActivity } from "@/lib/activity";
import FeaturedDreamCard from "@/components/dreams/FeaturedDreamCard";
import DreamCard from "@/components/dreams/DreamCard";
import TrendingTags from "@/components/dashboard/TrendingTags";
import TopDreamers from "@/components/dashboard/TopDreamers";
import RecentActivity from "@/components/dashboard/RecentActivity";
import TopBar from "@/components/layout/TopBar";
import Link from "next/link";

export default async function DashboardPage() {
  const [featured, topDreams, trendingTags, topDreamers, recentActivity] = await Promise.all([
    getFeaturedDream(),
    getTopDreams(5),
    getTrendingTags(8),
    getTopDreamers(5),
    getRecentActivity(5),
  ]);

  return (
    <div className="flex flex-col min-h-screen">
      <TopBar />

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
              <Link
                href="/explore?sort=top"
                className="font-sans text-dream-violet text-xs hover:text-dream-bright transition-colors"
              >
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

          <RecentActivity items={recentActivity} />
        </div>

        <aside className="w-72 flex-shrink-0 space-y-5">
          <TrendingTags tags={trendingTags} />
          <TopDreamers dreamers={topDreamers} />

          {/* Promo CTA card with dashboard-bg image */}
          <div className="dream-card overflow-hidden">
            {/* Decorative image strip — uses CSS background to avoid onError in server component */}
            <div
              className="relative h-32 overflow-hidden"
              style={{
                backgroundImage: "url('/images/dreamnet-dashboard-bg.png')",
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-dream-surface" />
            </div>
            {/* Text + button */}
            <div className="px-5 pb-5 text-center space-y-3 -mt-2">
              <div className="font-sans text-dream-text text-sm space-y-0.5">
                <p>Share your dreams.</p>
                <p>Connect with dreamers.</p>
                <p>Explore endless worlds.</p>
              </div>
              <Link
                href="/dreams/new"
                className="dream-btn inline-flex items-center gap-2 px-5 py-2.5 text-sm text-white no-underline"
              >
                + Share a Dream
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
