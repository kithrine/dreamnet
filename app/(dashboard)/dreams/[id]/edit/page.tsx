import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import DreamForm from "@/components/dreams/DreamForm";
import { updateDreamAction } from "./actions";
import BackButton from "@/components/ui/BackButton";

export default async function EditDreamPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/auth/signin");

  const dream = await prisma.dream.findUnique({
    where: { id, archivedAt: null },
    include: { tags: { include: { tag: true } } },
  });

  if (!dream) notFound();
  if (dream.userId !== session.user.id) redirect(`/dreams/${id}`);

  const action = updateDreamAction.bind(null, id);
  const initialTags = dream.tags.map((dt) => dt.tag.name).join(", ");

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <BackButton />
      <h1 className="font-sans text-2xl font-bold text-dream-bright mb-6">Edit Dream</h1>
      <DreamForm
        action={action}
        initialTitle={dream.title}
        initialContent={dream.content}
        initialTags={initialTags}
        submitLabel="Save Changes"
      />
    </div>
  );
}
