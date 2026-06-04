import DreamForm from "@/components/dreams/DreamForm";
import { createDreamAction } from "./actions";

export default function NewDreamPage() {
  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="font-pixel text-dream-bright text-sm mb-8">SAVE A DREAM</h1>
      <DreamForm action={createDreamAction} />
    </div>
  );
}
