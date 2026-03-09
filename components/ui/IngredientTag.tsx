import { X } from "lucide-react";

interface IngredientTagProps {
  id: string;
  name: string;
  onRemove: (id: string) => void;
}

export default function IngredientTag({ id, name, onRemove }: IngredientTagProps) {
  return (
    <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-orange-50 text-orange-700 border border-orange-200">
      {name}
      <button
        type="button"
        onClick={() => onRemove(id)}
        className="flex-shrink-0 ml-1.5 h-4 w-4 rounded-full inline-flex items-center justify-center text-orange-400 hover:bg-orange-200 hover:text-orange-500 focus:outline-none focus:bg-orange-500 focus:text-white transition"
      >
        <span className="sr-only">Remove {name}</span>
        <X size={14} />
      </button>
    </span>
  );
}
