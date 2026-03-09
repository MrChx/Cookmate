"use client";

import { useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { UtensilsCrossed, ArrowRight, KeyRound, X, Loader2, CheckCircle } from "lucide-react";
import Link from "next/link";

function ResetModal({ onClose }: { onClose: () => void }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!currentPassword) {
      setError("Masukkan password saat ini.");
      return;
    }
    if (!newEmail && !newPassword) {
      setError("Isi minimal email baru atau password baru.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/reset-credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newEmail: newEmail || undefined, newPassword: newPassword || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal memperbarui.");
      setSuccess("Berhasil diperbarui! Silakan login ulang.");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const inp = "appearance-none block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 text-gray-900 font-medium focus:outline-none focus:ring-orange-500 focus:border-orange-500 text-sm bg-white transition";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-orange-100 flex items-center justify-center">
              <KeyRound className="w-5 h-5 text-orange-500" />
            </div>
            <h3 className="text-lg font-extrabold text-gray-900">Reset Kredensial</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {success ? (
          <div className="flex flex-col items-center gap-4 py-6 text-center">
            <CheckCircle className="w-12 h-12 text-emerald-500" />
            <p className="text-gray-900 font-semibold">{success}</p>
            <button onClick={onClose}
              className="px-6 py-2.5 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition">
              Tutup
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-sm text-gray-600">
              Masukkan password saat ini untuk verifikasi, lalu isi email baru dan/atau password baru.
            </p>

            {error && (
              <div className="px-4 py-2.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-medium">
                {error}
              </div>
            )}

            {/* Password Saat Ini — WAJIB */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-1.5">
                Password Saat Ini <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder=""
                className={inp}
                required
              />
            </div>

            {/* Email Baru — Opsional */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-1.5">
                Email Baru <span className="text-gray-400 font-normal text-xs">(opsional)</span>
              </label>
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder=""
                className={inp}
              />
            </div>

            {/* Password Baru — Opsional */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-1.5">
                Password Baru <span className="text-gray-400 font-normal text-xs">(opsional)</span>
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder=""
                className={inp}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={onClose}
                className="flex-1 py-3 rounded-xl border border-gray-300 text-gray-700 font-bold hover:bg-gray-50 transition text-sm">
                Batal
              </button>
              <button type="submit" disabled={isLoading}
                className="flex-1 py-3 rounded-xl bg-orange-500 text-white font-bold hover:bg-orange-600 transition flex items-center justify-center gap-2 disabled:opacity-60 text-sm">
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
                Simpan
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showReset, setShowReset] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      const res = await signIn("credentials", { redirect: false, email, password });
      if (res?.error) {
        setError("Email atau password salah.");
        setIsLoading(false);
      } else {
        router.push("/admin");
        router.refresh();
      }
    } catch {
      setError("Terjadi kesalahan. Coba lagi.");
      setIsLoading(false);
    }
  };

  const inp = "appearance-none block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 text-gray-900 font-medium focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm bg-white transition";

  return (
    <>
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="bg-orange-500 rounded-md p-2 flex items-center justify-center">
                <UtensilsCrossed size={28} className="text-white" />
              </div>
              <span className="font-bold text-3xl tracking-tight text-gray-900">CookMate</span>
            </Link>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Monitoring Panel</h2>
          <p className="mt-2 text-center text-sm text-gray-600">Hanya admin yang dapat menggunakan ini!</p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow-xl shadow-gray-200/50 sm:rounded-2xl sm:px-10 border border-gray-100">
            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm font-medium text-center">
                  {error}
                </div>
              )}
              <div>
                <label htmlFor="email" className="block text-sm font-bold text-gray-900">Email address</label>
                <div className="mt-1">
                  <input id="email" name="email" type="email" autoComplete="email" required
                    value={email} onChange={(e) => setEmail(e.target.value)}
                    className={inp} placeholder="example@gmail.com" />
                </div>
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-bold text-gray-900">Password</label>
                <div className="mt-1">
                  <input id="password" name="password" type="password" autoComplete="current-password" required
                    value={password} onChange={(e) => setPassword(e.target.value)}
                    className={inp} placeholder="••••••••" />
                </div>
              </div>
              <div>
                <button type="submit" disabled={isLoading}
                  className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm shadow-orange-500/30 text-sm font-bold text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition">
                  {isLoading
                    ? <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white" />
                    : <> Sign in <ArrowRight size={18} className="ml-2" /> </>
                  }
                </button>
              </div>
            </form>

            {/* Reset Credentials Button */}
            <div className="mt-6 pt-5 border-t border-gray-100 text-center">
              <button
                onClick={() => setShowReset(true)}
                className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-orange-500 font-semibold transition"
              >
                <KeyRound className="w-4 h-4" />
                Reset email / password
              </button>
            </div>
          </div>
        </div>
      </div>

      {showReset && <ResetModal onClose={() => setShowReset(false)} />}
    </>
  );
}
