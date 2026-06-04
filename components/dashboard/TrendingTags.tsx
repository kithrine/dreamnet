import TagChip from "@/components/ui/TagChip";

type Tag = { id: string; name: string; count: number };

export default function TrendingTags({ tags }: { tags: Tag[] }) {
  return (
    <div className="bg-dream-surface pixel-border p-4">
      <h3 className="font-pixel text-dream-text text-xs tracking-widest mb-4">TRENDING TAGS</h3>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => <TagChip key={tag.id} name={tag.name} />)}
        {tags.length === 0 && (
          <p className="font-pixel text-dream-muted text-xs">No tags yet.</p>
        )}
      </div>
    </div>
  );
}
