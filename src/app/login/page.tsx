"use client";

import { store, User } from "@/lib/store";
import { useRole } from "@/components/RoleContext";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Fingerprint, ShieldAlert, Loader2, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useRole();

  const handleSync = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSyncing(true);

    // Simulate Network Latency / Google Auth Sync
    setTimeout(() => {
      const member = store.findMemberByEmail(email);
      
      if (member) {
        login({
          id: member.id,
          name: member.name,
          email: member.email,
          role: member.type
        });
      } else {
        setError("Neural Identity Not Found. Please contact your System Administrator (Manager) for enrollment.");
        setIsSyncing(false);
      }
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[#020205] flex flex-col items-center justify-center p-8 relative overflow-hidden">
      
      {/* Background Spatial Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(37,99,235,0.05),transparent)] pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full z-10"
      >
        {/* Brand Neural Hub */}
        <div className="text-center mb-16">
          <div className="w-20 h-20 rounded-[28px] bg-blue-600 flex items-center justify-center mx-auto mb-8 shadow-[0_0_50px_rgba(37,99,235,0.4)] relative">
             <div className="absolute inset-0 rounded-[28px] border-2 border-white/20 animate-pulse" />
             <Zap className="w-12 h-12 text-white fill-white" />
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight mb-3">CortexFlow</h1>
          <p className="text-zinc-500 font-light tracking-[0.2em] uppercase text-[10px]">Neural Interface Sync Protocol</p>
        </div>

        {/* Sync Module */}
        <div className="glass-surface p-12 rounded-[40px] border border-white/5 shadow-2xl relative">
          <form onSubmit={handleSync} className="space-y-8">
            <div className="space-y-4">
              <label className="block text-[10px] font-mono font-bold text-zinc-500 tracking-[0.2em] uppercase">Neural Identity (Corporate Email)</label>
              <div className="relative">
                <input 
                  type="email" 
                  value={email}
                  disabled={isSyncing}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@cortex.ai" 
                  className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-zinc-700 outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all font-sans"
                  required
                />
              </div>
            </div>

            <AnimatePresence mode="wait">
              {error && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex gap-4"
                >
                  <ShieldAlert className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <p className="text-[13px] text-red-500/80 leading-relaxed font-light">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <button 
              type="submit"
              disabled={isSyncing}
              className="w-full h-16 bg-white text-black font-bold rounded-2xl flex items-center justify-center gap-3 hover:bg-zinc-200 transition-all relative overflow-hidden group shadow-[0_0_30px_rgba(255,255,255,0.1)] active:scale-[0.98]"
            >
              {isSyncing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="tracking-[0.1em] uppercase text-xs">Syncing Identity...</span>
                </>
              ) : (
                 <>
                   <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                   <span className="tracking-[0.1em] uppercase text-xs">Sync Identity</span>
                   <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-all" />
                 </>
              )}
            </button>
          </form>
          
          <div className="mt-10 pt-8 border-t border-white/5 text-center">
            <p className="text-[11px] text-zinc-600 font-mono tracking-widest uppercase">Endpoint: sso.cortex.internal</p>
          </div>
        </div>

        {/* Support */}
        <div className="mt-12 text-center opacity-40 hover:opacity-100 transition-opacity">
           <p className="text-[11px] font-light text-zinc-500 tracking-wide">
             Don't have an ID? Contact your <span className="text-white">Admin Hub</span> for enrollment.
           </p>
        </div>
      </motion.div>

      {/* Footer Branding */}
      <div className="absolute bottom-10 flex items-center gap-4 text-zinc-800 text-[10px] font-mono tracking-[0.4em] pointer-events-none">
        <Fingerprint className="w-4 h-4" />
        SECURE TERMINAL ENDPOINT VERIFIED
      </div>
    </div>
  );
}
