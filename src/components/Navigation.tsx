"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Box, Grid, Bell, Moon, Crown, Mic } from "lucide-react";
import { cn } from "@/lib/utils";

export function TopNav() {
  return (
    <header className="flex items-center justify-between px-8 py-4 w-full">
      <div className="flex items-center gap-6">
        <h1 className="text-xl font-bold tracking-tight">
          <span className="text-cyan-400">AI</span> Assistant
        </h1>
        <div className="flex items-center gap-2 bg-white/5 rounded-full px-3 py-1.5 border border-white/5">
          <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-500" />
          <span className="text-sm font-medium text-zinc-300">Roman Atwood</span>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button className="text-zinc-400 hover:text-white transition-colors">
          <Bell className="w-5 h-5" />
        </button>
        <button className="text-zinc-400 hover:text-white transition-colors">
          <Moon className="w-5 h-5" />
        </button>
        <button className="flex items-center gap-2 bg-amber-500/10 text-amber-500 border border-amber-500/20 px-3 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase hover:bg-amber-500/20 transition-colors">
          <Crown className="w-3.5 h-3.5" /> Premium
        </button>
      </div>
    </header>
  );
}

export function BottomNav() {
  const pathname = usePathname();
  
  const links = [
    { href: "/", icon: Home },
    { href: "/search", icon: Search },
    { href: "/command", icon: Box },
    { href: "/gallery", icon: Grid },
  ];

  return (
    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 glass-panel rounded-2xl px-6 py-3 flex items-center gap-8">
      {links.map((link) => {
        const Icon = link.icon;
        const isActive = pathname === link.href;
        return (
          <Link 
            key={link.href} 
            href={link.href}
            className={cn(
              "p-2 rounded-xl transition-all duration-300",
              isActive ? "text-cyan-400 bg-cyan-400/10" : "text-zinc-500 hover:text-white hover:bg-white/5"
            )}
          >
            <Icon className="w-5 h-5" />
          </Link>
        );
      })}
    </div>
  );
}
