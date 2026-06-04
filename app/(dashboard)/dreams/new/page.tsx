import DreamForm from "@/components/dreams/DreamForm";
import { createDreamAction } from "./actions";

export default function NewDreamPage() {
  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="font-sans font-semibold text-dream-bright text-sm mb-8">Save a Dream</h1>
      <DreamForm action={createDreamAction} />
    </div>
  );
}
