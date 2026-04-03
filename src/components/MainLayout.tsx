"use client";

import { useRole } from "@/components/RoleContext";
import { Sidebar } from "@/components/Sidebar";
import { Search, Bell, Circle, LogOut, X, Loader2, Bot } from "lucide-react";
import { useState, useRef } from "react";
import { smartSearch, hasApiKey } from "@/lib/ai";
import { motion, AnimatePresence } from "framer-motion";

export function MainLayout({ children }: { children: React.ReactNode }) {
  const { role, user, logout } = useRole();
  const isManager = role === "manager";

  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<string | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    if (!hasApiKey()) {
      setSearchResult("No API key configured. Go to Settings → AI Configuration to add your Gemini API key.");
      return;
    }

    setIsSearching(true);
    setSearchResult(null);

    try {
      const result = await smartSearch(searchQuery);
      setSearchResult(result);
    } catch (err: any) {
      setSearchResult("AI search failed. Check your API key in Settings.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchFocus = () => {
    setIsSearchOpen(true);
  };

  const handleSearchClose = () => {
    setIsSearchOpen(false);
    setSearchQuery("");
    setSearchResult(null);
  };

  return (
    <div className="min-h-screen bg-[#020205] text-[#e5e5e5] antialiased overflow-hidden flex w-full">
      {/* Conditionally Render Sidebar */}
      {isManager && (
        <Sidebar className="shrink-0 relative z-10 bg-black/40 backdrop-blur-2xl border-r border-white/5" />
      )}
      
      <div className="flex-1 flex flex-col min-w-0 relative z-10 bg-black/60 backdrop-blur-sm">
        
        {/* Top Navigation / Status Bar */}
        <header className="h-[72px] px-10 flex items-center justify-between border-b border-white/5 bg-black/40 backdrop-blur-md relative z-50">
          {/* Search */}
          <form 
            onSubmit={handleSearch}
            className="flex items-center gap-3 max-w-sm w-full bg-white/[0.02] border border-white/5 px-4 py-2 rounded-full hover:border-white/10 transition-colors"
          >
            {isSearching ? (
              <Loader2 className="w-4 h-4 text-blue-500 animate-spin shrink-0" />
            ) : (
              <Search className="w-4 h-4 text-zinc-500 shrink-0" />
            )}
            <input 
              ref={inputRef}
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={handleSearchFocus}
              placeholder="Ask CortexFlow AI..." 
              className="bg-transparent border-none outline-none text-[13px] text-white placeholder:text-zinc-500 w-full tracking-wide"
            />
            {searchQuery && (
              <button type="button" onClick={handleSearchClose} className="text-zinc-600 hover:text-white transition-colors">
                <X className="w-3 h-3" />
              </button>
            )}
          </form>
          
          {/* Right Status */}
          <div className="flex items-center gap-6">
            
            {/* User Profile & Logout */}
            <div className="flex items-center gap-4 border-r border-white/5 pr-6">
              <div className="flex flex-col items-end mr-1">
                 <span className="text-[13px] font-medium text-white leading-none mb-1">{user?.name}</span>
                 <span className="text-[10px] font-mono font-bold text-zinc-500 tracking-widest uppercase">{user?.role}</span>
              </div>
              <img 
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}&style=circle&backgroundColor=0a0a0a`} 
                className="w-10 h-10 rounded-full border border-white/10"
                alt=""
              />
              <button 
                onClick={logout}
                className="text-zinc-500 hover:text-red-400 transition-colors ml-2"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>

            <button className="text-zinc-500 hover:text-white transition-colors relative">
              <Bell className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 bg-blue-500/10 px-3 py-1.5 rounded-full border border-blue-500/20">
              <Circle className="w-2 h-2 fill-blue-500 text-blue-500 animate-pulse" />
              <span className="text-[10px] font-mono font-semibold tracking-widest text-blue-400 uppercase">Live Sys</span>
            </div>
          </div>
        </header>

        {/* Search Result Dropdown */}
        <AnimatePresence>
          {(searchResult || isSearching) && isSearchOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-[72px] left-0 right-0 z-40 px-10 pt-4"
            >
              <div className="max-w-2xl glass-surface rounded-[20px] border border-white/10 shadow-2xl overflow-hidden">
                <div className="px-6 py-4 border-b border-white/5 flex items-center gap-3">
                  <Bot className="w-4 h-4 text-blue-400" />
                  <span className="text-[11px] font-mono text-zinc-500 tracking-widest uppercase">CortexFlow AI Response</span>
                  <button onClick={handleSearchClose} className="ml-auto text-zinc-600 hover:text-white transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="px-6 py-5">
                  {isSearching ? (
                    <div className="flex items-center gap-3 text-blue-400 text-sm font-light">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Searching CortexFlow memory...
                    </div>
                  ) : (
                    <p className="text-[14px] text-zinc-300 font-light leading-relaxed whitespace-pre-wrap">{searchResult}</p>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <main className="flex-1 overflow-auto relative">
          {children}
        </main>
        
      </div>
    </div>
  );
}
