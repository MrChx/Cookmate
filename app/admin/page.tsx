"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  X,
  Loader2,
  ChefHat,
} from "lucide-react";

const ITEMS_PER_PAGE = 8;

interface Recipe {
  id: string;
  title: string;
  image: string | null;
  category?: { name: string };
  difficulty: string;
  status: string;
  createdAt: string;
}

function ConfirmDialog({
  name,
  onConfirm,
  onCancel,
  loading,
}: {
  name: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full admin-modal-pop">
        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
            <Trash2 className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">Delete Recipe?</h3>
          <p className="text-slate-500 text-sm">
            Are you sure you want to delete <strong>"{name}"</strong>? This action cannot be undone.
          </p>
          <div className="flex gap-3 w-full mt-2">
            <button
              onClick={onCancel}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 transition flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ManageRecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<Recipe | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const showToast = (type: "success" | "error", msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchRecipes = useCallback(async () => {
    try {
      const res = await fetch("/api/recipes");
      const data = await res.json();
      setRecipes(Array.isArray(data) ? data : []);
    } catch {
      showToast("error", "Failed to load recipes");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecipes();
  }, [fetchRecipes]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/recipes/${deleteTarget.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setRecipes((prev) => prev.filter((r) => r.id !== deleteTarget.id));
      showToast("success", `"${deleteTarget.title}" deleted.`);
    } catch {
      showToast("error", "Failed to delete recipe.");
    } finally {
      setDeleteLoading(false);
      setDeleteTarget(null);
    }
  };

  // Filter & paginate
  const filtered = recipes.filter((r) =>
    r.title.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const fallback =
    "https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&w=200&q=80";

  return (
    <div className="max-w-7xl mx-auto admin-page-enter">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Kelola Resep</h2>
          <p className="text-slate-500 text-sm mt-0.5">Tambah, edit, hapus resep disini!</p>
        </div>
        <Link
          href="/admin/recipes/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-bold text-sm shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all"
        >
          <Plus className="w-4 h-4" />
          Tambah Resep Baru
        </Link>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4 stat-card">
          <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <ChefHat className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-800 font-bold uppercase tracking-widest">Total Resep</p>
            <p className="text-2xl font-extrabold text-slate-900">{recipes.length}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4 stat-card" style={{ animationDelay: "80ms" }}>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <ChefHat className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-800 font-bold uppercase tracking-widest">Published</p>
            <p className="text-2xl font-extrabold text-slate-900">
              {recipes.filter((r) => r.status === "PUBLISHED").length}
            </p>
          </div>
        </div>
      </div>

      {/* ── Table Card ── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {/* Table toolbar */}
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Cari Resep..."
              className="pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-slate-900 font-medium placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 bg-white w-64"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <span className="text-xs text-slate-500 font-medium">
            {filtered.length} recipe{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Resep</th>
                <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Kategori</th>
                <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider hidden md:table-cell">Waktu</th>
                <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading
                ? Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-40" /></td>
                    <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-24" /></td>
                    <td className="px-6 py-4 hidden md:table-cell"><div className="h-4 bg-slate-100 rounded w-20" /></td>
                    <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-16" /></td>
                    <td className="px-6 py-4" />
                  </tr>
                ))
                : paginated.map((recipe, idx) => (
                  <tr
                    key={recipe.id}
                    className="hover:bg-slate-50/70 transition-colors recipe-row"
                    style={{ animationDelay: `${idx * 40}ms` }}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={recipe.image || fallback}
                          alt={recipe.title}
                          className="w-10 h-10 rounded-lg object-cover bg-slate-100 shrink-0"
                          onError={(e) => { (e.target as HTMLImageElement).src = fallback; }}
                        />
                        <span className="font-semibold text-slate-900 line-clamp-1">{recipe.title}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{recipe.category?.name || "—"}</td>
                    <td className="px-6 py-4 text-slate-500 hidden md:table-cell">
                      {new Date(recipe.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${recipe.status === "PUBLISHED"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-amber-100 text-amber-700"
                        }`}>
                        {recipe.status === "PUBLISHED" ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/admin/recipes/${recipe.id}/edit`}
                          className="p-2 rounded-lg text-slate-400 hover:text-primary hover:bg-primary/10 transition-all"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => setDeleteTarget(recipe)}
                          className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              {!isLoading && paginated.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center">
                    <ChefHat className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                    <p className="text-slate-500 font-medium">Tidak ada resep yang tersedia</p>
                    <Link href="/admin/recipes/new" className="text-primary font-bold text-sm mt-1 inline-block hover:underline">
                      Add your first recipe →
                    </Link>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between text-sm">
            <span className="text-slate-500">
              Page {page} of {totalPages}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-lg text-slate-400 hover:text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  onClick={() => setPage(n)}
                  className={`w-8 h-8 rounded-lg text-sm font-bold transition-all ${n === page ? "bg-primary text-white shadow-sm" : "text-slate-600 hover:bg-slate-100"
                    }`}
                >
                  {n}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 rounded-lg text-slate-400 hover:text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirm */}
      {deleteTarget && (
        <ConfirmDialog
          name={deleteTarget.title}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleteLoading}
        />
      )}

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-xl font-semibold text-sm admin-toast ${toast.type === "success" ? "bg-emerald-600 text-white" : "bg-red-500 text-white"
          }`}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}
