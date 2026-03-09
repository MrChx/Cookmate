"use client";

import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { Clock, Flame, BarChart2, Star, Utensils, ArrowLeft, CheckCircle2, Circle } from "lucide-react";
import Link from "next/link";

export default function RecipeDetail() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params.id as string;
  const [recipe, setRecipe] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [checkedIngredients, setCheckedIngredients] = useState<Set<string>>(new Set());

  // Read user's ingredient IDs from URL query param
  const myIngredientIds = searchParams.get("myIngredients")?.split(",").filter(Boolean) || [];

  useEffect(() => {
    if (id) {
      fetch(`/api/recipes/${id}`)
        .then((res) => res.json())
        .then((data) => {
          setRecipe(data);
          // Auto-check ingredients that the user has (from myIngredients param)
          if (myIngredientIds.length > 0 && data.ingredients) {
            const matched = new Set<string>();
            data.ingredients.forEach((item: any) => {
              if (myIngredientIds.includes(item.ingredientId)) {
                matched.add(item.id);
              }
            });
            setCheckedIngredients(matched);
          }
          setIsLoading(false);
        })
        .catch((err) => {
          console.error("Failed to fetch recipe detail", err);
          setIsLoading(false);
        });
    }
  }, [id]);

  const toggleIngredient = (ingredientId: string) => {
    setCheckedIngredients((prev) => {
      const next = new Set(prev);
      next.has(ingredientId) ? next.delete(ingredientId) : next.add(ingredientId);
      return next;
    });
  };

  const fallback =
    "https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&w=1200&q=80";

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-40">
        <div className="animate-spin rounded-full h-14 w-14 border-4 border-primary/20 border-t-primary"></div>
      </div>
    );
  }

  if (!recipe || recipe.error) {
    return (
      <div className="py-40 text-center">
        <div className="text-6xl mb-4">🍽️</div>
        <h2 className="text-2xl font-bold mb-2">Recipe Not Found</h2>
        <p className="text-slate-500 mb-6">We couldn't find the recipe you're looking for.</p>
        <Link href="/" className="text-primary font-bold hover:underline flex items-center gap-1 justify-center">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* ── Hero Banner ─────────────────────────────── */}
      <div className="relative w-full aspect-[21/9] md:aspect-[21/7] overflow-hidden shadow-xl recipe-hero">
        <img
          src={recipe.image && recipe.image.trim() ? recipe.image : fallback}
          alt={recipe.title}
          className="w-full h-full object-cover transition-transform duration-700 recipe-hero-img"
          onError={(e) => { (e.target as HTMLImageElement).src = fallback; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent flex flex-col justify-end p-6 md:p-10">
          <div className="flex gap-2 mb-3 recipe-hero-badges">
            <span className="bg-primary px-3 py-1 rounded-full text-xs font-bold text-white uppercase tracking-wider">
              {recipe.category?.name || "Recipe"}
            </span>
            {recipe.rating > 0 && (
              <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1">
                <Star className="w-3 h-3 fill-current text-yellow-400" />
                {recipe.rating.toFixed(1)}
              </span>
            )}
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-2 leading-tight recipe-hero-title">
            {recipe.title}
          </h1>
          <p className="text-white/80 text-base md:text-lg max-w-2xl hidden md:block recipe-hero-desc">
            {recipe.description}
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 md:px-6 py-8">

        {/* ── Back link ─────────────────────────────── */}
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-primary transition-colors mb-8 recipe-fade-in">
          <ArrowLeft className="w-4 h-4" />
          Back to recipes
        </Link>

        {/* ── Meta Grid ─────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10 recipe-meta-grid">
          {[
            { icon: <Clock className="w-8 h-8 text-primary" />, label: "Prep Time", value: `${recipe.prepTime} min` },
            { icon: <Utensils className="w-8 h-8 text-primary" />, label: "Cook Time", value: `${recipe.cookTime} min` },
            { icon: <BarChart2 className="w-8 h-8 text-primary" />, label: "Difficulty", value: recipe.difficulty },
            { icon: <Flame className="w-8 h-8 text-primary" />, label: "Calories", value: recipe.calories ? `${recipe.calories} kcal` : "—" },
          ].map((item, i) => (
            <div
              key={i}
              className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center text-center meta-card"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              {item.icon}
              <p className="text-xs text-slate-900 uppercase font-bold tracking-widest mt-2 mb-1">
                {item.label}
              </p>
              <p className="text-xl font-bold text-slate-900">{item.value}</p>
            </div>
          ))}
        </div>

        {/* ── Main Grid ─────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

          {/* ── Ingredients Sidebar ─────────────────── */}
          <aside className="lg:col-span-1">
            <div className="sticky top-24 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 ingredients-panel">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900">Ingredients</h2>
                <span className="text-sm text-slate-700 font-semibold bg-slate-100 px-3 py-1 rounded-full">
                  {recipe.servings} Servings
                </span>
              </div>

              <ul className="space-y-1">
                {recipe.ingredients.map((item: any) => {
                  const checked = checkedIngredients.has(item.id);
                  return (
                    <li key={item.id}>
                      <label className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 cursor-pointer group transition-colors">
                        <button
                          type="button"
                          onClick={() => toggleIngredient(item.id)}
                          className="shrink-0"
                        >
                          {checked ? (
                            <CheckCircle2 className="w-5 h-5 text-green-500 fill-green-500 stroke-white" />
                          ) : (
                            <Circle className="w-5 h-5 text-slate-300" />
                          )}
                        </button>
                        <span
                          className={`flex-1 font-semibold transition-colors ${
                            checked
                              ? "text-green-600"
                              : "text-slate-900 group-hover:text-slate-700"
                          }`}
                        >
                          {item.ingredient.name}
                        </span>
                        <span className="text-slate-700 text-sm shrink-0 font-semibold">{item.quantity}</span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            </div>
          </aside>

          {/* ── Instructions ────────────────────────── */}
          <main className="lg:col-span-2">
            <div className="bg-slate-900 rounded-2xl p-8">
              <h2 className="text-2xl font-bold mb-8 text-white">Cooking Instructions</h2>
              <div className="space-y-12">
                {recipe.instructions
                  .sort((a: any, b: any) => a.stepNumber - b.stepNumber)
                  .map((step: any, idx: number) => (
                    <div
                      key={step.id}
                      className="flex gap-5 step-block"
                      style={{ animationDelay: `${idx * 100}ms` }}
                    >
                      {/* Step number bubble */}
                      <div className="flex-shrink-0 w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-bold text-lg shadow-lg shadow-primary/30">
                        {step.stepNumber}
                      </div>

                      <div className="flex-1 space-y-4 pt-1">
                        <h3 className="text-xl font-bold text-white">{step.title}</h3>
                        <p className="text-white/80 leading-relaxed">{step.description}</p>
                        {step.image && step.image.trim() && (
                          <div className="rounded-2xl overflow-hidden aspect-video border border-white/10 shadow-sm">
                            <img
                              src={step.image}
                              alt={step.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.currentTarget.parentElement as HTMLElement).style.display = "none";
                              }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
