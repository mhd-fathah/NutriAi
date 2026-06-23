"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Upload, History, LogOut } from "lucide-react";
import { logoutUser } from "@/actions/auth.actions";
import { cn } from "@/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/upload", label: "Log Meal", icon: Upload },
  { href: "/history", label: "History", icon: History },
];

export function Sidebar({ userName }: { userName: string }) {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex flex-col w-60 min-h-screen bg-white border-r border-gray-100 fixed left-0 top-0 z-30">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
            <span className="text-white text-base">🥗</span>
          </div>
          <div>
            <p className="font-bold text-gray-900 text-sm">NutriAI</p>
            <p className="text-xs text-gray-400">AI Nutrition Coach</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                active
                  ? "bg-emerald-50 text-emerald-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <Icon
                className={cn("w-4.5 h-4.5", active ? "text-emerald-600" : "text-gray-400")}
                size={18}
              />
              {label}
              {active && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-500" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center gap-3 mb-3 px-2">
          <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
            <span className="text-emerald-700 text-xs font-bold">
              {userName?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{userName}</p>
          </div>
        </div>
        <form action={logoutUser}>
          <button
            type="submit"
            className="flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
          >
            <LogOut size={16} />
            Sign out
          </button>
        </form>
      </div>
    </aside>
  );
}

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-30 safe-area-pb">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all duration-200",
                active ? "text-emerald-600" : "text-gray-400"
              )}
            >
              <Icon size={20} />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
