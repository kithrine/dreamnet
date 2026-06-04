import Link from "next/link";

export default function TagChip({ name }: { name: string }) {
  return (
    <Link
      href={`/explore?tag=${encodeURIComponent(name)}`}
      className="inline-block font-pixel text-xs px-2 py-1 bg-dream-purple text-dream-bright border border-dream-violet hover:bg-dream-violet transition-colors"
    >
      # {name}
    </Link>
  );
}
