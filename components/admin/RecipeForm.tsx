"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Loader2, ArrowLeft } from "lucide-react";
import DragDropImage from "@/components/admin/DragDropImage";

interface IngredientOption { id: string; name: string; }
interface Category { id: string; name: string; }
interface RecipeIngredientRow { ingredientId: string; quantity: string; }
interface InstructionRow { stepNumber: number; title: string; description: string; image: string; }
interface RecipeFormProps { initialData?: any; }

const inp = "w-full px-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 placeholder:text-slate-400 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/40 bg-white";

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-sm font-bold text-slate-900 mb-1.5">{children}</label>
  );
}

export default function RecipeForm({ initialData }: RecipeFormProps) {
  const router = useRouter();
  const isEdit = !!initialData;

  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [image, setImage] = useState(initialData?.image || "");
  const [prepTime, setPrepTime] = useState(String(initialData?.prepTime || ""));
  const [cookTime, setCookTime] = useState(String(initialData?.cookTime || ""));
  const [difficulty, setDifficulty] = useState(initialData?.difficulty || "Easy");
  const [calories, setCalories] = useState(String(initialData?.calories || ""));
  const [servings, setServings] = useState(String(initialData?.servings || "4"));
  const [status, setStatus] = useState(initialData?.status || "PUBLISHED");
  const [categoryId, setCategoryId] = useState(initialData?.categoryId || "");

  const [recipeIngredients, setRecipeIngredients] = useState<RecipeIngredientRow[]>(
    initialData?.ingredients?.map((i: any) => ({ ingredientId: i.ingredientId, quantity: i.quantity })) ||
    [{ ingredientId: "", quantity: "" }]
  );
  const [instructions, setInstructions] = useState<InstructionRow[]>(
    initialData?.instructions?.map((s: any) => ({
      stepNumber: s.stepNumber, title: s.title, description: s.description, image: s.image || "",
    })) || [{ stepNumber: 1, title: "", description: "", image: "" }]
  );

  const [categories, setCategories] = useState<Category[]>([]);
  const [ingredientOptions, setIngredientOptions] = useState<IngredientOption[]>([]);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [addingCategory, setAddingCategory] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/categories").then((r) => r.json()),
      fetch("/api/ingredients").then((r) => r.json()),
    ]).then(([cats, ings]) => {
      setCategories(Array.isArray(cats) ? cats : []);
      setIngredientOptions(Array.isArray(ings) ? ings : []);
    });
  }, []);

  const updateIngredient = (idx: number, field: keyof RecipeIngredientRow, value: string) =>
    setRecipeIngredients((p) => p.map((r, i) => (i === idx ? { ...r, [field]: value } : r)));
  const addIngredientRow = () => setRecipeIngredients((p) => [...p, { ingredientId: "", quantity: "" }]);
  const removeIngredientRow = (idx: number) => setRecipeIngredients((p) => p.filter((_, i) => i !== idx));

  const updateInstruction = (idx: number, field: keyof InstructionRow, value: string | number) =>
    setInstructions((p) => p.map((r, i) => (i === idx ? { ...r, [field]: value } : r)));
  const addInstructionRow = () =>
    setInstructions((p) => [...p, { stepNumber: p.length + 1, title: "", description: "", image: "" }]);
  const removeInstructionRow = (idx: number) =>
    setInstructions((p) => p.filter((_, i) => i !== idx).map((r, i) => ({ ...r, stepNumber: i + 1 })));

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;
    setAddingCategory(true);
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCategoryName.trim() }),
      });
      const cat = await res.json();
      setCategories((p) => [...p, cat]);
      setCategoryId(cat.id);
      setNewCategoryName("");
    } finally {
      setAddingCategory(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!title || !categoryId || !prepTime || !cookTime || !servings) {
      setError("Please fill in all required fields (Title, Category, Times, Servings).");
      return;
    }
    const validIngredients = recipeIngredients.filter((r) => r.ingredientId && r.quantity);
    const validInstructions = instructions.filter((s) => s.title && s.description);
    if (validIngredients.length === 0) { setError("Add at least one ingredient with a quantity."); return; }
    if (validInstructions.length === 0) { setError("Add at least one instruction step."); return; }

    setIsSaving(true);
    try {
      const payload = {
        title, description, image,
        prepTime: Number(prepTime), cookTime: Number(cookTime),
        difficulty,
        calories: calories ? Number(calories) : null,
        servings: Number(servings),
        status, categoryId,
        ingredients: validIngredients,
        instructions: validInstructions,
      };
      const url = isEdit ? `/api/recipes/${initialData.id}` : "/api/recipes";
      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to save");
      }
      router.push("/admin");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto admin-page-enter pb-16">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button type="button" onClick={() => router.back()}
          className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-primary transition">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {isEdit ? "Edit Recipe" : "Tambah Menu Baru"}
          </h2>
          <p className="text-slate-600 text-sm">Fill in all fields below</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 px-5 py-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-semibold">
          {error}
        </div>
      )}

      <div className="space-y-6">
        {/* ── Basic Info ── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
          <h3 className="font-extrabold text-slate-900 text-lg">Basic Information</h3>

          <DragDropImage value={image} onChange={setImage} label="Foto Menu" />

          <div>
            <Label>Nama Menu <span className="text-red-500">*</span></Label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className={inp} placeholder="e.g. Spicy Tomato Pasta" />
          </div>

          <div>
            <Label>Deskripsi Menu</Label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)}
              className={inp + " resize-none h-24"} placeholder="Short description of the recipe..." />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Kategori Menu <span className="text-red-500">*</span></Label>
              <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className={inp}>
                <option value="">Pilih Kategori...</option>
                {categories.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
              </select>
              <div className="flex gap-2 mt-2">
                <input value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Jika ingin memasukan kategori baru..." className={inp + " flex-1 text-xs"}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddCategory())} />
                <button type="button" onClick={handleAddCategory}
                  disabled={!newCategoryName.trim() || addingCategory}
                  className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 transition disabled:opacity-50">
                  {addingCategory ? <Loader2 className="w-4 h-4 animate-spin" /> : "Add"}
                </button>
              </div>
            </div>
            <div>
              <Label>Status</Label>
              <select value={status} onChange={(e) => setStatus(e.target.value)} className={inp}>
                <option value="PUBLISHED">Published</option>
                <option value="DRAFT">Draft</option>
              </select>
            </div>
          </div>
        </div>

        {/* ── Recipe Details ── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
          <h3 className="font-extrabold text-slate-900 text-lg">Detail Menu</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Prep Time (min)", value: prepTime, setter: setPrepTime, ph: "15", req: true },
              { label: "Cook Time (min)", value: cookTime, setter: setCookTime, ph: "30", req: true },
              { label: "Porsi", value: servings, setter: setServings, ph: "4", req: true },
              { label: "Calories (kcal)", value: calories, setter: setCalories, ph: "450", req: false },
            ].map(({ label, value, setter, ph, req }) => (
              <div key={label}>
                <Label>{label}{req && <span className="text-red-500"> *</span>}</Label>
                <input type="number" min="0" value={value}
                  onChange={(e) => setter(e.target.value)} className={inp} placeholder={ph} />
              </div>
            ))}
          </div>
          <div>
            <Label>Tingkat Kesulitan Pembuatan Menu</Label>
            <div className="flex gap-3">
              {["Easy", "Medium", "Hard"].map((d) => (
                <button key={d} type="button" onClick={() => setDifficulty(d)}
                  className={`px-6 py-2 rounded-xl text-sm font-bold border transition-all ${difficulty === d
                    ? "bg-primary text-white border-primary shadow-md shadow-primary/20"
                    : "bg-white text-slate-700 border-slate-300 hover:border-primary hover:text-primary"
                    }`}>
                  {d}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Ingredients ── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h3 className="font-extrabold text-slate-900 text-lg mb-4">Bahan Dan Jumlah Yang Diperlukan</h3>
          <div className="space-y-3">
            {recipeIngredients.map((row, idx) => (
              <div key={idx} className="flex gap-3 items-center">
                <select value={row.ingredientId} onChange={(e) => updateIngredient(idx, "ingredientId", e.target.value)}
                  className={inp + " flex-1"}>
                  <option value="">Pilih Bahannya...</option>
                  {ingredientOptions.map((i) => (<option key={i.id} value={i.id}>{i.name}</option>))}
                </select>
                <input value={row.quantity} onChange={(e) => updateIngredient(idx, "quantity", e.target.value)}
                  className={inp + " w-36"} placeholder="2 butir" />
                <button type="button" onClick={() => removeIngredientRow(idx)}
                  disabled={recipeIngredients.length === 1}
                  className="p-2 text-slate-400 hover:text-red-500 transition disabled:opacity-30">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
          <button type="button" onClick={addIngredientRow}
            className="mt-4 flex items-center gap-2 text-primary font-bold text-sm hover:underline">
            <Plus className="w-4 h-4" /> Tambah Bahan
          </button>
        </div>

        {/* ── Instructions ── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h3 className="font-extrabold text-slate-900 text-lg mb-4">Panduan Membuat</h3>
          <div className="space-y-8">
            {instructions.map((step, idx) => (
              <div key={idx} className="flex gap-4">
                <div className="flex-shrink-0 w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center font-extrabold text-sm shadow shadow-primary/30">
                  {step.stepNumber}
                </div>
                <div className="flex-1 space-y-3 min-w-0">
                  <input value={step.title} onChange={(e) => updateInstruction(idx, "title", e.target.value)}
                    className={inp} placeholder="Judul Langkah..." />
                  <textarea value={step.description} onChange={(e) => updateInstruction(idx, "description", e.target.value)}
                    className={inp + " h-20 resize-none"} placeholder="Deskripsi Langkah..." />
                  <DragDropImage
                    value={step.image}
                    onChange={(url) => updateInstruction(idx, "image", url)}
                    label={`Step ${step.stepNumber} Image (optional)`}
                  />
                </div>
                <button type="button" onClick={() => removeInstructionRow(idx)}
                  disabled={instructions.length === 1}
                  className="mt-1 p-2 text-slate-400 hover:text-red-500 transition disabled:opacity-30 self-start">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
          <button type="button" onClick={addInstructionRow}
            className="mt-6 flex items-center gap-2 text-primary font-bold text-sm hover:underline">
            <Plus className="w-4 h-4" /> Tambah Langkah
          </button>
        </div>

        {/* ── Submit ── */}
        <div className="flex gap-3">
          <button type="button" onClick={() => router.back()}
            className="px-8 py-3 rounded-xl border border-slate-300 text-slate-800 font-bold hover:bg-slate-50 transition">
            Batal
          </button>
          <button type="submit" disabled={isSaving}
            className="flex-1 sm:flex-none px-8 py-3 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/25 hover:bg-primary/90 transition flex items-center justify-center gap-2 disabled:opacity-60">
            {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
            {isEdit ? "Save Changes" : "Buat Resep"}
          </button>
        </div>
      </div>
    </form>
  );
}
