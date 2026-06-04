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
    <div className="flex gap-6 p-6 max-w-6xl mx-auto">
      <div className="flex-1 space-y-8 min-w-0">
        {featured && (
          <section>
            <h2 className="font-pixel text-dream-gold text-xs tracking-widest mb-3">FEATURED DREAM ✦</h2>
            <FeaturedDreamCard dream={featured} />
          </section>
        )}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-pixel text-dream-text text-xs tracking-widest">TOP DREAMS</h2>
            <Link href="/explore?sort=top" className="font-pixel text-dream-violet text-xs hover:text-dream-bright">
              VIEW ALL
            </Link>
          </div>
          <div className="space-y-3">
            {topDreams.map((dream, i) => (
              <DreamCard key={dream.id} dream={dream} rank={i + 1} />
            ))}
            {topDreams.length === 0 && (
              <p className="font-pixel text-dream-muted text-xs">No dreams yet. Be the first!</p>
            )}
          </div>
        </section>
      </div>
      <aside className="w-72 flex-shrink-0 space-y-6">
        <TrendingTags tags={trendingTags} />
        <TopDreamers dreamers={topDreamers} />
      </aside>
    </div>
  );
}
