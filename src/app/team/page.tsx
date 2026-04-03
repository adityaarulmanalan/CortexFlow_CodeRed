"use client";

import { store } from "@/lib/store";
import { Bot, ArrowRight, Activity, Terminal, Trash2, UserPlus } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useRole } from "@/components/RoleContext";
import { AccessDenied } from "@/components/AccessDenied";
import { useState, useCallback, useEffect } from "react";
import { Modal } from "@/components/Modal";

export default function WorkforceHub() {
  const { role } = useRole();
  if (role === 'employee') return <AccessDenied />;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newMember, setNewMember] = useState({ name: "", email: "", role: "", type: "employee" as "employee" | "manager" });
  const [refreshKey, setRefreshKey] = useState(0);
  const refresh = useCallback(() => setRefreshKey(k => k + 1), []);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const baseTeam = store.getTeam();
  const allTasks = store.getTasks();
  const router = useRouter();

  const handleAdd = () => {
    if (!newMember.name.trim() || !newMember.email.trim()) return;
    store.addTeamMember({
      id: `m${Date.now()}`,
      name: newMember.name,
      email: newMember.email,
      role: newMember.role || "Team Member",
      type: newMember.type
    });
    setIsModalOpen(false);
    setNewMember({ name: "", email: "", role: "", type: "employee" });
    refresh();
  };

  const handleRemove = (memberId: string) => {
    if (confirm("Remove this team member? Their tasks will also be removed.")) {
      store.removeTeamMember(memberId);
      refresh();
    }
  };

  const containerVars = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVars = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    show: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.8 } }
  };

  return (
    <div className="h-full flex flex-col pt-12 px-12 relative z-10 w-full mb-20 overflow-y-auto scrollbar-hide">
      
      <motion.header variants={itemVars} initial="hidden" animate="show" className="mb-14 pb-6 border-b border-white/5 flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-wide text-white mb-3">Distributed Agents</h1>
          <p className="text-[15px] font-light text-zinc-400">Monitor and access personal AI agents coordinating execution across the team.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-white hover:bg-zinc-200 text-black px-6 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)]"
        >
          <UserPlus className="w-4 h-4" /> Add Team Member
        </button>
      </motion.header>

      <motion.div variants={containerVars} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        
        {isMounted && baseTeam.map((member) => {
          const memberTasks = allTasks.filter(t => t.owner === member.name);
          const pendingTasks = memberTasks.filter(t => t.status !== "Done").length;
          const doneTasks = memberTasks.filter(t => t.status === "Done").length;
          
          return (
            <motion.div 
              variants={itemVars} 
              key={member.id} 
              className="glass-surface p-8 rounded-[24px] border border-white/5 hover:border-blue-500/30 hover:bg-black/40 transition-all duration-300 group flex flex-col h-full"
            >
              <div className="flex items-center gap-5 mb-8">
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${member.name}&style=circle&backgroundColor=0a0a0a`} className="w-14 h-14 rounded-full border border-white/10 bg-black/40 shadow-inner group-hover:border-blue-500/50 transition-colors" alt="" />
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-white mb-1 tracking-wide">{member.name}</h3>
                  <p className="text-[12px] text-zinc-500 font-mono tracking-widest">{member.role}</p>
                </div>
                <span className={`text-[10px] font-mono font-bold px-2 py-1 rounded tracking-widest ${
                  member.type === "manager" ? "text-amber-400 bg-amber-500/10 border border-amber-500/20" : "text-blue-400 bg-blue-500/10 border border-blue-500/20"
                }`}>
                  {member.type.toUpperCase()}
                </span>
              </div>

              <div className="flex items-center gap-3 mb-4 bg-black/40 rounded-xl p-4 border border-white/5">
                <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                </div>
                <div className="flex-1">
                   <p className="text-[10px] font-mono text-zinc-500 tracking-[0.2em] mb-1">AGENT STATUS</p>
                   <div className="flex items-center gap-2">
                     <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                     <span className="text-sm font-medium text-white tracking-wide">
                       {pendingTasks > 0 ? `Processing ${pendingTasks} Tasks` : "Standing By"}
                     </span>
                   </div>
                </div>
              </div>

              {/* Task stats */}
              <div className="flex gap-4 mb-6">
                <div className="flex-1 bg-black/30 rounded-xl p-3 text-center border border-white/5">
                  <p className="text-xl font-light text-white">{memberTasks.length}</p>
                  <p className="text-[9px] font-mono text-zinc-600 tracking-widest">TOTAL</p>
                </div>
                <div className="flex-1 bg-black/30 rounded-xl p-3 text-center border border-white/5">
                  <p className="text-xl font-light text-blue-400">{pendingTasks}</p>
                  <p className="text-[9px] font-mono text-zinc-600 tracking-widest">ACTIVE</p>
                </div>
                <div className="flex-1 bg-black/30 rounded-xl p-3 text-center border border-white/5">
                  <p className="text-xl font-light text-emerald-400">{doneTasks}</p>
                  <p className="text-[9px] font-mono text-zinc-600 tracking-widest">DONE</p>
                </div>
              </div>

              <div className="mt-auto pt-6 border-t border-white/5 flex gap-3">
                <button 
                  onClick={() => router.push(`/agent/${member.id}`)}
                  className="flex-1 bg-blue-600 hover:bg-blue-500 transition-all text-white text-[13px] font-medium py-3 rounded-xl flex items-center justify-center gap-2 group/btn shadow-[0_0_15px_rgba(37,99,235,0.2)]"
                >
                  Access Workspace <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                </button>
                {member.type !== "manager" && (
                  <button 
                    onClick={() => handleRemove(member.id)}
                    className="px-4 bg-white/5 hover:bg-red-500/10 border border-white/10 hover:border-red-500/30 text-zinc-500 hover:text-red-400 rounded-xl transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}

      </motion.div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Register New Identity">
        <div className="space-y-5">
           <div>
             <label className="block text-[10px] font-mono text-zinc-500 tracking-[0.2em] mb-2 uppercase">Full Name</label>
             <input 
               type="text" 
               value={newMember.name}
               onChange={(e) => setNewMember({...newMember, name: e.target.value})}
               placeholder="e.g. Elena Rodriguez" 
               className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500/50" 
             />
           </div>
           <div>
             <label className="block text-[10px] font-mono text-zinc-500 tracking-[0.2em] mb-2 uppercase">Email Address</label>
             <input 
               type="email" 
               value={newMember.email}
               onChange={(e) => setNewMember({...newMember, email: e.target.value})}
               placeholder="elena@cortex.ai" 
               className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500/50" 
             />
           </div>
           <div className="grid grid-cols-2 gap-5">
             <div>
               <label className="block text-[10px] font-mono text-zinc-500 tracking-[0.2em] mb-2 uppercase">Work Role</label>
               <input 
                 type="text" 
                 value={newMember.role}
                 onChange={(e) => setNewMember({...newMember, role: e.target.value})}
                 placeholder="Product Designer" 
                 className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500/50" 
               />
             </div>
             <div>
               <label className="block text-[10px] font-mono text-zinc-500 tracking-[0.2em] mb-2 uppercase">Access Level</label>
               <select 
                 value={newMember.type}
                 onChange={(e) => setNewMember({...newMember, type: e.target.value as any})}
                 className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500/50 appearance-none cursor-pointer"
               >
                  <option value="employee">Employee</option>
                  <option value="manager">Manager</option>
               </select>
             </div>
           </div>
           <button 
             onClick={handleAdd}
             disabled={!newMember.name.trim() || !newMember.email.trim()}
             className={`w-full mt-6 font-medium py-3.5 rounded-xl transition-all tracking-wide ${
               newMember.name.trim() && newMember.email.trim()
                 ? "bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_15px_rgba(37,99,235,0.3)]"
                 : "bg-white/5 text-zinc-600 cursor-not-allowed"
             }`}
           >
             Activate Identity
           </button>
        </div>
      </Modal>
    </div>
  );
}
