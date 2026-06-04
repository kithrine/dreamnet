import Link from "next/link";

export default function TagChip({ name }: { name: string }) {
  return (
    <Link
      href={`/explore?tag=${encodeURIComponent(name)}`}
      className="inline-block font-sans text-xs px-3 py-1 rounded-full bg-white/10 border border-white/15 text-dream-text hover:bg-dream-violet/30 transition-colors"
    >
      # {name}
    </Link>
  );
}
