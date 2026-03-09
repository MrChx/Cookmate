"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import RecipeForm from "@/components/admin/RecipeForm";

export default function EditRecipePage() {
  const params = useParams();
  const id = params.id as string;
  const [recipe, setRecipe] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetch(`/api/recipes/${id}`)
        .then((r) => r.json())
        .then((data) => {
          setRecipe(data);
          setIsLoading(false);
        })
        .catch(() => setIsLoading(false));
    }
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary/20 border-t-primary" />
      </div>
    );
  }

  if (!recipe || recipe.error) {
    return (
      <div className="py-32 text-center text-slate-500 font-medium">
        Recipe not found.
      </div>
    );
  }

  return <RecipeForm initialData={recipe} />;
}
