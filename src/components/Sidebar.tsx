"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, MessageSquare, CheckCircle, Database, Users, Settings, HelpCircle, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Meetings", href: "/meetings", icon: MessageSquare },
  { name: "Tasks", href: "/tasks", icon: CheckCircle },
  { name: "Knowledge", href: "/knowledge", icon: Database },
  { name: "Team", href: "/team", icon: Users },
];

export function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname();

  return (
    <div className={cn("flex flex-col bg-[#050505] p-6 text-zinc-400 w-[260px] h-full", className)}>
      
      {/* Brand Header with Animated Lightning Effect */}
      <div className="flex items-center gap-3 mb-10 px-2 cursor-default">
        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(37,99,235,0.4)]">
          <Zap className="w-5 h-5 text-white fill-white" />
        </div>
        <span className="text-xl font-bold tracking-tight text-white whitespace-nowrap lightning-sweep font-sans">
          CortexFlow
        </span>
      </div>

      {/* Main Navigation */}
      <nav className="space-y-1.5 flex-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-sm font-medium",
                isActive 
                  ? "bg-[#111111] text-white border border-[#1f1f1f]" 
                  : "hover:text-zinc-200 hover:bg-[#0a0a0a]"
              )}
            >
              <Icon className={cn("w-4 h-4", isActive ? "text-blue-500" : "text-zinc-500")} />
              {item.name}
            </Link>
          );
        })}
      </nav>
      
      {/* Bottom Actions */}
      <div className="space-y-1.5 mt-auto pt-8">
        <Link href="/settings" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium hover:text-white transition-colors">
          <Settings className="w-4 h-4 text-zinc-500" />
          Settings
        </Link>
        <Link href="/support" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium hover:text-white transition-colors">
          <HelpCircle className="w-4 h-4 text-zinc-500" />
          Support
        </Link>
      </div>
    </div>
  );
}
