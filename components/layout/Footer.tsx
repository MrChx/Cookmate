import Link from "next/link";
import { UtensilsCrossed } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 py-12 px-6 md:px-20 lg:px-40 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="flex items-center gap-3 text-white">
          <UtensilsCrossed className="w-6 h-6 text-primary" />
          <span className="text-xl font-bold tracking-tight">CookMate</span>
        </div>
        <div className="flex gap-8 text-sm">
          <Link className="hover:text-white transition-colors" href="">
            Terms
          </Link>
          <Link className="hover:text-white transition-colors" href="">
            Privacy
          </Link>
          <Link className="hover:text-white transition-colors" href="">
            Help
          </Link>
          <Link className="hover:text-white transition-colors" href="">
            Contact
          </Link>
        </div>
        <p className="text-xs">© 2026 CookMate AI. MrChax Copyright.</p>
      </div>
    </footer>
  );
}
