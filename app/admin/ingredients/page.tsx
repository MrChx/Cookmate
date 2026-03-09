"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  X,
  Loader2,
  Carrot,
} from "lucide-react";
import DragDropImage from "@/components/admin/DragDropImage";

const ITEMS_PER_PAGE = 10;

interface Ingredient {
  id: string;
  name: string;
  image: string | null;
  createdAt: string;
}

function IngredientModal({
  initial,
  onSave,
  onClose,
  loading,
}: {
  initial: Partial<Ingredient> | null;
  onSave: (data: { name: string; image: string }) => void;
  onClose: () => void;
  loading: boolean;
}) {
  const [name, setName] = useState(initial?.name || "");
  const [image, setImage] = useState(initial?.image || "");

  const isEdit = !!initial?.id;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md admin-modal-pop">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h3 className="text-lg font-extrabold text-slate-900">
            {isEdit ? "Edit Ingredient" : "Tambah Bahan Baru"}
          </h3>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-800 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-900 mb-1.5">
              Nama Bahan <span className="text-red-500">*</span>
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Tomat, Bawang Putih, Ayam..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 placeholder:text-slate-400 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/40 bg-white"
              autoFocus
            />
          </div>
          <DragDropImage value={image} onChange={setImage} label="Gambar Bahan (opsional)" />
        </div>

        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition"
          >
            Batal
          </button>
          <button
            onClick={() => name.trim() && onSave({ name: name.trim(), image: image.trim() })}
            disabled={!name.trim() || loading}
            className="flex-1 py-2.5 rounded-xl bg-primary text-white font-bold text-sm shadow-lg shadow-primary/25 hover:bg-primary/90 transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {isEdit ? "Save Changes" : "Tambahkan"}
          </button>
        </div>
      </div>
    </div>
  );
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
          <h3 className="text-xl font-bold">Delete Ingredient?</h3>
          <p className="text-slate-500 text-sm">
            Are you sure you want to delete <strong>"{name}"</strong>? This cannot be undone.
          </p>
          <div className="flex gap-3 w-full mt-2">
            <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition">
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 transition flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ManageIngredientsPage() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [addEditTarget, setAddEditTarget] = useState<Partial<Ingredient> | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Ingredient | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const showToast = (type: "success" | "error", msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchIngredients = useCallback(async () => {
    try {
      const res = await fetch("/api/ingredients");
      const data = await res.json();
      setIngredients(Array.isArray(data) ? data : []);
    } catch {
      showToast("error", "Failed to load ingredients.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchIngredients(); }, [fetchIngredients]);

  const handleSave = async (data: { name: string; image: string }) => {
    const isEdit = !!addEditTarget?.id;
    setModalLoading(true);
    try {
      const url = isEdit ? `/api/ingredients/${addEditTarget!.id}` : "/api/ingredients";
      const method = isEdit ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error();
      showToast("success", isEdit ? "Ingredient updated." : "Ingredient added.");
      setAddEditTarget(null);
      fetchIngredients();
    } catch {
      showToast("error", "Failed to save ingredient.");
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/ingredients/${deleteTarget.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setIngredients((prev) => prev.filter((i) => i.id !== deleteTarget.id));
      showToast("success", `"${deleteTarget.name}" deleted.`);
    } catch {
      showToast("error", "Failed to delete ingredient.");
    } finally {
      setDeleteLoading(false);
      setDeleteTarget(null);
    }
  };

  const filtered = ingredients.filter((i) =>
    i.name.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  return (
    <div className="max-w-7xl mx-auto admin-page-enter">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Kelola Bahan</h2>
          <p className="text-slate-500 text-sm mt-0.5">Tambah, edit, dan hapus bahan</p>
        </div>
        <button
          onClick={() => setAddEditTarget({})}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-bold text-sm shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all"
        >
          <Plus className="w-4 h-4" />
          Tambah Bahan
        </button>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-1 gap-4 mb-8">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4 stat-card">
          <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <Carrot className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-800 font-bold uppercase tracking-widest">Total Bahan</p>
            <p className="text-2xl font-extrabold text-slate-900">{ingredients.length}</p>
          </div>
        </div>
      </div>

      {/* ── Table Card ── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Cari Bahan..."
              className="pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-slate-900 font-medium placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 bg-white w-64"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <span className="text-xs text-slate-500 font-medium">
            {filtered.length} Bahan{filtered.length !== 1 ? "" : ""}
          </span>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-3 text-xs font-bold text-slate-800 uppercase tracking-wider">Bahan</th>
                <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider hidden md:table-cell">Tanggal Ditambahkan</th>
                <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading
                ? Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-32" /></td>
                    <td className="px-6 py-4 hidden md:table-cell"><div className="h-4 bg-slate-100 rounded w-24" /></td>
                    <td className="px-6 py-4" />
                  </tr>
                ))
                : paginated.map((ingredient, idx) => (
                  <tr
                    key={ingredient.id}
                    className="hover:bg-slate-50/70 transition-colors recipe-row"
                    style={{ animationDelay: `${idx * 30}ms` }}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 font-bold text-sm">
                          {ingredient.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-semibold text-slate-900">{ingredient.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-700 hidden md:table-cell">
                      {new Date(ingredient.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setAddEditTarget(ingredient)}
                          className="p-2 rounded-lg text-slate-400 hover:text-primary hover:bg-primary/10 transition-all"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(ingredient)}
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
                  <td colSpan={3} className="px-6 py-16 text-center">
                    <Carrot className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                    <p className="text-slate-500 font-medium">Belum ada bahan yang tersedia.</p>
                    <button
                      onClick={() => setAddEditTarget({})}
                      className="text-primary font-bold text-sm mt-1 hover:underline"
                    >
                      Tambah Bahan
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between text-sm">
            <span className="text-slate-500">Page {page} of {totalPages}</span>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="p-2 rounded-lg text-slate-400 hover:text-slate-700 disabled:opacity-30">
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <button key={n} onClick={() => setPage(n)} className={`w-8 h-8 rounded-lg text-sm font-bold transition-all ${n === page ? "bg-primary text-white" : "text-slate-600 hover:bg-slate-100"}`}>
                  {n}
                </button>
              ))}
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-2 rounded-lg text-slate-400 hover:text-slate-700 disabled:opacity-30">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {addEditTarget !== null && (
        <IngredientModal
          initial={addEditTarget}
          onSave={handleSave}
          onClose={() => setAddEditTarget(null)}
          loading={modalLoading}
        />
      )}
      {deleteTarget && (
        <ConfirmDialog
          name={deleteTarget.name}
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
