import Link from "next/link";
import { UtensilsCrossed } from "lucide-react";

export default function Navbar() {
  return (
    <header className="flex items-center justify-between border-b border-white/10 px-6 py-4 md:px-20 lg:px-40 bg-slate-900 sticky top-0 z-50">
      <div className="flex items-center gap-3">
        <div className="text-primary">
          <UtensilsCrossed className="w-9 h-9" />
        </div>
        <h2 className="text-xl font-extrabold tracking-tight text-white">CookMate</h2>
      </div>
      <div className="flex flex-1 justify-end gap-8 items-center">
        <nav className="hidden md:flex items-center gap-8">
          <Link
            className="text-sm font-semibold text-slate-300 hover:text-primary transition-colors"
            href="/"
          >
            Home
          </Link>
          <Link
            className="text-sm font-semibold text-slate-300 hover:text-primary transition-colors"
            href="/recipes"
          >
            Recipes
          </Link>
          <Link
            className="text-sm font-semibold text-slate-300 hover:text-primary transition-colors"
            href="/about"
          >
            About
          </Link>
        </nav>
        <Link
          href="/login"
          className="flex min-w-[100px] cursor-pointer items-center justify-center rounded-xl h-10 px-5 bg-primary text-white text-sm font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all"
        >
          Sign In
        </Link>
      </div>
    </header>
  );
}

