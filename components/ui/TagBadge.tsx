export default function TagBadge({ name }: { name: string }) {
  return (
    <span className="inline-block font-sans text-xs px-3 py-1 rounded-full bg-white/10 border border-white/15 text-dream-text">
      # {name}
    </span>
  );
}
