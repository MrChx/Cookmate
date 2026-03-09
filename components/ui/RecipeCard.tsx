import Link from "next/link";
import { Clock, Star, Utensils } from "lucide-react";

interface RecipeCardProps {
  id: string;
  title: string;
  image: string | null;
  prepTime: number;
  cookTime: number;
  difficulty: "Easy" | "Medium" | "Hard";
  rating: number;
}

export default function RecipeCard({
  id,
  title,
  image,
  prepTime,
  cookTime,
  difficulty,
  rating,
}: RecipeCardProps) {
  const totalTime = prepTime + cookTime;
  const fallback =
    "https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&w=800&q=80";

  return (
    <div className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 flex flex-col animate-fadeIn">
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
        {/* Use <img> so browser handles broken URLs properly via onError */}
        <img
          src={image && image.trim() !== "" ? image : fallback}
          alt={title}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          onError={(e) => {
            (e.target as HTMLImageElement).src = fallback;
          }}
        />
      </div>

      <div className="p-5 flex flex-col flex-grow gap-3">
        <h4 className="font-bold text-slate-900 text-lg leading-snug group-hover:text-primary transition-colors flex-grow">
          {title}
        </h4>
        <div className="flex items-center gap-4 text-slate-700 text-sm">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{totalTime} mins</span>
          </div>
          <div className="flex items-center gap-1">
            <Utensils className="w-4 h-4" />
            <span>{difficulty}</span>
          </div>
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-500 fill-current" stroke="none" />
            <span className="font-bold text-slate-700">
              {rating > 0 ? rating.toFixed(1) : "4.5"}
            </span>
          </div>
          <Link
            href={`/recipes/${id}`}
            className="text-primary font-bold text-sm hover:underline"
          >
            View Recipe
          </Link>
        </div>
      </div>
    </div>
  );
}
