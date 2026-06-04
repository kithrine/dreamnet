import TagChip from "@/components/ui/TagChip";

type Tag = { id: string; name: string; count: number };

export default function TrendingTags({ tags }: { tags: Tag[] }) {
  return (
    <div className="dream-card p-5">
      <h3 className="font-sans font-semibold text-dream-text text-sm mb-4 flex items-center gap-2">
        ⭐ Trending Tags
      </h3>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <TagChip key={tag.id} name={tag.name} />
        ))}
        {tags.length === 0 && (
          <p className="font-sans text-dream-muted text-xs">No tags yet.</p>
        )}
      </div>
    </div>
  );
}
