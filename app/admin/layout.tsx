"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  UtensilsCrossed,
  ChefHat,
  Carrot,
  LogOut,
  MenuIcon,
  X,
} from "lucide-react";
import { useState } from "react";

const navItems = [
  { label: "Kelola Resep", href: "/admin", icon: ChefHat },
  { label: "Kelola Bahan", href: "/admin/ingredients", icon: Carrot },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const Sidebar = () => (
    <aside className="w-72 bg-slate-900 border-r border-white/5 flex flex-col h-full">
      <div className="p-6 flex flex-col gap-8 h-full">
        {/* Logo */}
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
              <UtensilsCrossed className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-extrabold tracking-tight text-white">CookMate</h1>
              <p className="text-xs text-slate-400">Admin Panel</p>
            </div>
          </Link>
          <button
            className="lg:hidden text-slate-400 hover:text-white"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 flex flex-col gap-2">
          {navItems.map((item) => {
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all ${isActive
                    ? "bg-primary text-white shadow-lg shadow-primary/25"
                    : "text-slate-400 hover:bg-white/10 hover:text-white"
                  }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className="pt-6 border-t border-white/10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-extrabold text-lg shrink-0">
            {session?.user?.name?.charAt(0) || "A"}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-bold text-white truncate">
              {session?.user?.name || "Admin User"}
            </p>
            <p className="text-xs text-slate-400 truncate">Super Admin</p>
          </div>
          <button
            title="Log out"
            onClick={() => signOut({ callbackUrl: "/" })}
            className="text-slate-400 hover:text-red-400 transition-colors shrink-0"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex h-full">
        <Sidebar />
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full w-72">
            <Sidebar />
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto min-w-0">
        {/* Mobile Top Bar */}
        <div className="lg:hidden sticky top-0 z-30 bg-slate-900 px-4 py-3 flex items-center gap-3 border-b border-white/10">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-slate-400 hover:text-white"
          >
            <MenuIcon className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2">
            <UtensilsCrossed className="w-5 h-5 text-primary" />
            <span className="font-bold text-white">CookMate Admin</span>
          </div>
        </div>

        <div className="p-6 md:p-8">{children}</div>
      </main>
    </div>
  );
}
