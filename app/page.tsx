"use client";

import { useState, useEffect } from "react";
import { Search, ArrowRight, X, Filter, ArrowUpDown } from "lucide-react";
import RecipeCard from "@/components/ui/RecipeCard";

export default function Home() {
  const [ingredients, setIngredients] = useState<any[]>([]);
  const [selectedIngredients, setSelectedIngredients] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [recipes, setRecipes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    fetch("/api/ingredients")
      .then((res) => res.json())
      .then((data) => setIngredients(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Failed to fetch ingredients", err));
  }, []);

  const handleSelectIngredient = (ingredient: any) => {
    if (!selectedIngredients.find((i) => i.id === ingredient.id)) {
      setSelectedIngredients([...selectedIngredients, ingredient]);
    }
    setSearchTerm("");
  };

  const handleRemoveIngredient = (id: string) => {
    setSelectedIngredients(selectedIngredients.filter((i) => i.id !== id));
  };

  const filteredIngredients = ingredients.filter(
    (i) =>
      i.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !selectedIngredients.find((si) => si.id === i.id)
  );

  const handleSearchRecipes = async () => {
    if (selectedIngredients.length === 0 && !searchTerm) return;
    setIsLoading(true);
    setHasSearched(true);
    try {
      const ids = selectedIngredients.map((i) => i.id).join(",");
      let url = "/api/recipes";
      if (ids) url += `?ingredients=${ids}`;

      const res = await fetch(url);
      const data = await res.json();
      setRecipes(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to search recipes", error);
      setRecipes([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="px-6 md:px-20 lg:px-40 py-12 md:py-20">
        <div className="w-full max-w-5xl mx-auto">

          {/* Hero Card */}
          <div className="hero-card relative overflow-hidden rounded-3xl bg-slate-900 flex items-center justify-center p-8 md:p-12 text-center shadow-2xl min-h-[400px] md:min-h-0 md:aspect-[21/9]">
            {/* Background Image */}
            <div
              className="absolute inset-0 opacity-40 bg-cover bg-center hero-bg"
              style={{
                backgroundImage:
                  "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDKjTdAjAdjeuRECCy4tfkcT1gFBQ_BwhtPEQZjH4a_IqE13CGq_iEv_v2LJxQHgdxOmIf7bHvZMtbqQpFKfA_6bjuHXOUxaLgNhT-B88SvB9ekNufe9SyBYgJWa1eMtgsN7OvmyytRRkC44ppQQ9PgyR87ofWfmg-wUkJfRa3XxjTX53QUgEC6w3gI7Ps4-aju8uOmJ82Un57bl_5EHVVE8T5xhm6hsToUn0O0QjMMhYsQoOs6vs5DdV5wd5lqkdHpzt-9hjCLeDoC')",
              }}
            ></div>
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/50 to-transparent"></div>

            {/* Content */}
            <div className="relative z-10 flex flex-col gap-5 w-full max-w-2xl items-center">
              <h1 className="text-white text-3xl sm:text-4xl md:text-6xl font-extrabold tracking-tight leading-tight hero-title">
                APA YANG BISA KAMU <span className="text-primary">MASAK?</span>
              </h1>
              <p className="text-slate-200 text-base md:text-xl font-medium max-w-lg hero-subtitle">
                Masukan bahan yang tersedia dan mari kita lihat akan menjadi resep apa!
              </p>

              {/* Search Box */}
              <div className="w-full bg-white p-2 rounded-2xl shadow-xl flex flex-col sm:flex-row gap-2 mt-2 relative hero-search">
                <div className="flex-1 flex items-center px-4 gap-3 relative">
                  <Search className="text-slate-400 w-5 h-5 shrink-0" />
                  <input
                    className="w-full border-none focus:outline-none focus:ring-0 text-slate-800 placeholder:text-slate-400 py-3 text-base bg-transparent"
                    placeholder="tomat, telur, ayam, dll..."
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        if (filteredIngredients.length > 0) {
                          handleSelectIngredient(filteredIngredients[0]);
                        } else {
                          handleSearchRecipes();
                        }
                      }
                    }}
                  />

                  {/* Autocomplete */}
                  {searchTerm && filteredIngredients.length > 0 && (
                    <div className="absolute top-full left-0 mt-1 w-full bg-white rounded-xl shadow-2xl border border-slate-100 max-h-52 overflow-y-auto z-50 text-left">
                      {filteredIngredients.map((i) => (
                        <button
                          key={i.id}
                          onClick={() => handleSelectIngredient(i)}
                          className="w-full text-left px-5 py-3 hover:bg-primary/5 transition text-slate-700 font-medium border-b border-slate-50 last:border-0"
                        >
                          {i.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  onClick={handleSearchRecipes}
                  disabled={isLoading}
                  className="w-full sm:w-auto bg-primary hover:bg-primary/90 disabled:opacity-60 text-white font-bold px-8 py-3 rounded-xl transition-all flex items-center justify-center gap-2 whitespace-nowrap"
                >
                  <span>{isLoading ? "Searching..." : "Temukan Resep"}</span>
                  {!isLoading && <ArrowRight className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Active Ingredient Tags */}
          {selectedIngredients.length > 0 && (
            <div className="flex flex-wrap gap-3 mt-8 justify-center tags-animate">
              {selectedIngredients.map((i) => (
                <div
                  key={i.id}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary border border-primary/20 font-semibold text-sm tag-item"
                >
                  <span>{i.name}</span>
                  <X
                    className="w-4 h-4 cursor-pointer hover:text-primary/70"
                    onClick={() => handleRemoveIngredient(i.id)}
                  />
                </div>
              ))}
              <button
                onClick={() => setSelectedIngredients([])}
                className="text-slate-500 text-sm font-medium hover:text-primary flex items-center gap-1 px-2 focus:outline-none transition-colors"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Results Section — only shown after user clicks Find Recipes */}
      {hasSearched && (
        <section className="px-6 md:px-20 lg:px-40 pb-20 results-section">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-10">
              <h3 className="text-2xl font-bold tracking-tight">
                Menu yang cocok:
              </h3>
              {recipes.length > 0 && (
                <div className="flex gap-2">
                  <button className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:border-primary hover:text-primary transition-all">
                    <Filter className="w-5 h-5" />
                  </button>
                  <button className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:border-primary hover:text-primary transition-all">
                    <ArrowUpDown className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary/20 border-t-primary"></div>
              </div>
            ) : recipes.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {recipes.map((recipe, idx) => (
                  <div
                    key={recipe.id}
                    className="card-appear"
                    style={{ animationDelay: `${idx * 80}ms` }}
                  >
                    <RecipeCard
                      id={recipe.id}
                      title={recipe.title}
                      image={recipe.image}
                      prepTime={recipe.prepTime}
                      cookTime={recipe.cookTime}
                      difficulty={recipe.difficulty}
                      rating={recipe.rating ?? 0}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-slate-100">
                <div className="text-6xl mb-4">🍳</div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Menu tidak tersedia</h3>
                <p className="text-slate-500 max-w-md mx-auto">
                  Maaf dari bahan yang kamu masukan belum ada makanan yang cocok. Coba periksa lagi bahan anda dan cari menunya kembali!
                </p>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
