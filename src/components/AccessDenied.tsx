"use client";

import { motion } from "framer-motion";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export function AccessDenied() {
  const router = useRouter();

  return (
    <div className="h-full flex flex-col items-center justify-center p-12 text-center bg-[#020205] relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-red-500/5 blur-[120px] rounded-full pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10"
      >
        <div className="w-20 h-20 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-8 mx-auto">
          <ShieldAlert className="w-10 h-10 text-red-500" />
        </div>
        
        <h1 className="text-3xl font-semibold text-white mb-4 tracking-tight">Access Restricted</h1>
        <p className="text-zinc-500 max-w-md mx-auto mb-10 font-light leading-relaxed">
          The requested module requires <span className="text-white font-medium">Manager Privileges</span>. Your current identity context (Employee) is restricted to your personal AI Workspace.
        </p>

        <button 
          onClick={() => router.push("/")}
          className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white px-8 py-3 rounded-xl transition-all group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Return to Workspace
        </button>
      </motion.div>
    </div>
  );
}
