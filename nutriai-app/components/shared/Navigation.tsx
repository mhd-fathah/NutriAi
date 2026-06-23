"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Upload, History, LogOut } from "lucide-react";
import { logoutUser } from "@/actions/auth.actions";
import { cn } from "@/utils";
import Logo from "./Logo";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/upload", label: "Log Meal", icon: Upload },
  { href: "/history", label: "History", icon: History },
];

export function Sidebar({ userName }: { userName: string }) {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex flex-col w-60 min-h-screen bg-white border-r border-gray-100 fixed left-0 top-0 z-30 shadow-sm shadow-gray-100/50">
      {/* BRANDING SECTION */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <Logo size={36} />
          <div>
            <p className="font-extrabold text-gray-900 text-sm tracking-tight">NutriAI</p>
            <p className="text-[10px] font-semibold text-emerald-600 tracking-wider uppercase">AI Nutrition Coach</p>
          </div>
        </div>
      </div>

      {/* NAVIGATION ITEMS */}
      <nav className="flex-1 px-3 py-6 space-y-1.5">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 relative group overflow-hidden",
                active
                  ? "bg-emerald-500/10 text-emerald-700 shadow-md shadow-emerald-500/[0.02]"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              {/* Left active line accent indicator */}
              {active && (
                <span className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500 rounded-r-md" />
              )}
              <Icon
                className={cn("w-4.5 h-4.5 transition-transform duration-300 group-hover:scale-105", active ? "text-emerald-600" : "text-gray-400")}
                size={18}
              />
              <span className="relative z-10">{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* USER PROFILE SECTION */}
      <div className="p-4 border-t border-gray-100 space-y-4">
        <div className="flex items-center gap-3 p-2 bg-gray-50/50 border border-gray-100 rounded-2xl shadow-sm">
          <div className="w-9 h-9 bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 rounded-xl flex items-center justify-center font-bold text-sm">
            {userName?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-gray-900 truncate leading-tight">{userName}</p>
            <p className="text-[9px] font-semibold text-emerald-600 flex items-center gap-1 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Tracking Active
            </p>
          </div>
        </div>

        {/* SIGN OUT BUTTON */}
        <form action={logoutUser}>
          <button
            type="submit"
            className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl text-sm font-bold text-gray-500 hover:bg-rose-50 hover:text-rose-600 active:scale-[0.98] transition-all duration-300"
          >
            <LogOut size={16} />
            Sign out
          </button>
        </form>

        {/* SIDEBAR FOOTER */}
        <div className="text-center pt-2">
          <p className="text-[10px] font-semibold text-gray-400 tracking-tight">
            NutriAI v1.0
          </p>
        </div>
      </div>
    </aside>
  );
}

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="lg:hidden fixed bottom-4 left-4 right-4 bg-white/90 backdrop-blur-xl border border-gray-100/60 z-30 rounded-3xl shadow-xl shadow-gray-200/50 safe-area-pb">
      <div className="flex items-center justify-around px-2 py-3">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center gap-1.5 px-4 py-2.5 rounded-2xl transition-all duration-300 active:scale-[0.95]",
                active ? "text-emerald-600 bg-emerald-500/10" : "text-gray-400"
              )}
            >
              <Icon size={20} className={cn("transition-transform duration-300", active && "scale-105")} />
              <span className="text-[10px] font-bold tracking-tight">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
