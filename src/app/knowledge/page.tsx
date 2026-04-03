"use client";

import { useState } from "react";
import { Search, Zap, ArrowRight, FileText, Bot, Loader2, RefreshCw } from "lucide-react";
import { store } from "@/lib/store";
import { motion, AnimatePresence } from "framer-motion";
import { useRole } from "@/components/RoleContext";
import { AccessDenied } from "@/components/AccessDenied";
import { askKnowledge, hasApiKey } from "@/lib/ai";

export default function KnowledgePage() {
  const { role } = useRole();
  if (role === 'employee') return <AccessDenied />;

  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<{q: string, a: string, source: string} | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;
    
    if (!hasApiKey()) {
      setError("No API key configured. Go to Settings → AI Configuration to add your Gemini API key.");
      return;
    }

    setIsSearching(true);
    setError(null);
    setResults(null);

    try {
      const answer = await askKnowledge(query);
      setResults({
        q: query,
        a: answer,
        source: "Organizational Memory + Gemini AI"
      });
    } catch (err: any) {
      setError(err.message || "AI query failed. Check your API key in Settings.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleQuickQuery = (question: string) => {
    setQuery(question);
  };

  const containerVars = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVars = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.8 } }
  };

  const quickQueries = [
    "Why did we choose this cloud architecture?",
    "What was decided about the frontend framework?",
    "Who is responsible for infrastructure?",
    "What are the current blockers for the team?"
  ];

  return (
    <div className="h-full flex flex-col pt-12 px-12 relative z-10 w-full max-w-5xl mx-auto">
      <motion.header variants={itemVars} initial="hidden" animate="show" className="mb-14 text-center">
        <h1 className="text-3xl font-semibold tracking-wide text-white mb-3 flex items-center justify-center gap-3">
          <Bot className="w-8 h-8 text-blue-500 drop-shadow-[0_0_10px_rgba(37,99,235,0.6)]" /> Neural Search
        </h1>
        <p className="text-[16px] font-light text-zinc-400">Ask CortexFlow why a decision was made. AI searches all meeting context & decisions.</p>
      </motion.header>

      <motion.div variants={containerVars} initial="hidden" animate="show" className="w-full">
        
        {/* Search Input */}
        <motion.div variants={itemVars} className="relative mb-14 group">
          <div className="absolute inset-0 bg-blue-500/10 blur-[40px] rounded-full opacity-50 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
          
          <form onSubmit={handleSearch} className="relative">
            <input 
              type="text" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Query system memory... (e.g. 'Why did we change architecture?')"
              className="w-full bg-black/40 backdrop-blur-3xl border border-white/10 rounded-full px-10 py-6 text-lg text-white placeholder:text-zinc-600 outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500 shadow-2xl transition-all font-sans tracking-wide pr-24"
            />
            <button 
              type="submit"
              disabled={isSearching || !query}
              className={`absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                isSearching || !query ? 'bg-white/5 text-zinc-600' : 'bg-blue-600 text-white hover:scale-105 shadow-[0_0_15px_rgba(37,99,235,0.5)]'
              }`}
            >
              {isSearching ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <ArrowRight className="w-6 h-6" />
              )}
            </button>
          </form>
        </motion.div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="mb-8 bg-red-500/10 border border-red-500/20 rounded-2xl p-4 text-red-400 text-sm font-light"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quick Queries + Decision Cards */}
        {!results && !isSearching && (
          <motion.div variants={itemVars} className="space-y-8">
            {/* Quick query buttons */}
            <div className="flex flex-wrap gap-3 mb-6">
              {quickQueries.map((q, i) => (
                <button 
                  key={i}
                  onClick={() => handleQuickQuery(q)}
                  className="bg-white/5 hover:bg-white/10 border border-white/5 hover:border-blue-500/30 rounded-full px-4 py-2 text-sm text-zinc-400 hover:text-white transition-all"
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Existing decisions */}
            <div className="grid grid-cols-2 gap-6">
              {store.getDecisions().map((d) => (
                <div 
                  key={d.id} 
                  className="glass-surface p-6 rounded-[24px] border border-white/5 hover:bg-white/[0.03] transition-colors cursor-pointer group"
                  onClick={() => handleQuickQuery(d.context)}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-[10px] font-mono font-bold text-zinc-500 tracking-[0.2em] bg-white/5 px-2 py-1 rounded">LOGGED</span>
                    <span className="text-[10px] font-mono tracking-widest text-zinc-600">{d.date}</span>
                  </div>
                  <p className="text-[15px] font-light text-zinc-300 leading-relaxed group-hover:text-blue-200 transition-colors">{d.outcome}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* AI Results */}
        {results && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="animated-border shadow-2xl">
            <div className="glass-surface inner-content p-10 flex flex-col min-h-[300px]">
              
              <div className="mb-10 pb-8 border-b border-white/10">
                <h3 className="text-[12px] font-mono font-bold text-zinc-500 tracking-[0.2em] mb-4">USER QUERY</h3>
                <p className="text-xl font-medium text-white tracking-wide">&quot;{results.q}&quot;</p>
              </div>

              <div className="flex items-start gap-6">
                <div className="w-12 h-12 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center shrink-0">
                  <Zap className="w-6 h-6 text-blue-400 drop-shadow-[0_0_8px_rgba(56,189,248,0.8)]" />
                </div>
                <div className="flex-1">
                   <h3 className="text-[12px] font-mono font-bold text-blue-400 tracking-[0.2em] mb-3">AI SYNTHESIZED RESPONSE</h3>
                   <p className="text-[17px] font-light text-zinc-200 leading-relaxed max-w-3xl mb-8 whitespace-pre-wrap">
                     {results.a}
                   </p>
                   
                   <div className="flex items-center gap-4">
                     <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-500 uppercase tracking-[0.15em] font-semibold bg-black/40 w-fit px-4 py-2 rounded-lg border border-white/5">
                       <Bot className="w-3.5 h-3.5" />
                       Powered by Gemini AI
                     </div>
                     <button 
                       onClick={() => { setResults(null); setQuery(""); }}
                       className="flex items-center gap-2 text-[10px] font-mono text-zinc-500 hover:text-white uppercase tracking-[0.15em] font-semibold bg-black/40 px-4 py-2 rounded-lg border border-white/5 hover:border-white/20 transition-colors"
                     >
                       <RefreshCw className="w-3.5 h-3.5" />
                       New Query
                     </button>
                   </div>
                </div>
              </div>

            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
