"use client";

import { store } from "@/lib/store";
import { Copy, Plus, FileText, Bug, Rocket, Zap, MoreHorizontal, Activity, Bot } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/Modal";
import { useRole } from "@/components/RoleContext";
import { User } from "lucide-react";
import { EmployeeDashboard } from "@/components/EmployeeDashboard";

export default function UnifiedDashboardPage() {
  const router = useRouter();
  const { role, currentUser } = useRole();
  const [refreshKey, setRefreshKey] = useState(0);
  const refresh = useCallback(() => setRefreshKey(k => k + 1), []);
  
  const allTasks = store.getTasks();
  const team = store.getTeam().filter(m => m.type === "employee");
  
  // Role-based filtering
  const tasks = role === 'employee' ? allTasks.filter(t => t.owner === currentUser) : allTasks;
  
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  // Task creation form state
  const [newTitle, setNewTitle] = useState("");
  const [newAssignee, setNewAssignee] = useState(team[0]?.name || "");
  const [newPriority, setNewPriority] = useState("Medium");
  const [newDeadline, setNewDeadline] = useState(new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]);

  const handleCreateTask = () => {
    if (!newTitle.trim()) return;
    store.addTask({
      id: `t-${Date.now()}`,
      title: newTitle.trim(),
      owner: newAssignee,
      deadline: newDeadline,
      status: "Pending",
      assignedDate: new Date().toISOString().split('T')[0],
      sourceMeeting: "Manual Entry"
    });
    setNewTitle("");
    setIsTaskModalOpen(false);
    refresh();
  };

  const containerVars = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.15 } }
  };

  const itemVars = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.8 } }
  };

  if (role === "employee") {
    return <EmployeeDashboard />;
  }

  // Compute real stats
  const pendingTasks = allTasks.filter(t => t.status === "Pending").length;
  const inProgressTasks = allTasks.filter(t => t.status === "In Progress").length;
  const doneTasks = allTasks.filter(t => t.status === "Done").length;
  const activeTasks = pendingTasks + inProgressTasks;
  const totalTasks = allTasks.length;
  const stabilityScore = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;
  const decisions = store.getDecisions();

  return (
    <>
      <div className="min-h-full flex flex-col pt-12 relative z-10 w-full overflow-hidden">
        
        {/* 3 Column Grid */}
        <motion.div 
          variants={containerVars} initial="hidden" animate="show"
          className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-14 px-12 overflow-y-auto scrollbar-hide pb-20"
        >
          
          {/* COLUMN 1: Meetings & Context */}
          <div className="space-y-12">
            {/* Recent Meeting Card */}
            <motion.div variants={itemVars} className="animated-border shadow-2xl shadow-blue-900/10 hover:scale-[1.02] transition-transform duration-500">
              <div className="glass-surface inner-content p-8 flex flex-col min-h-[340px]">
                <div className="flex items-center justify-between mb-10">
                  <h3 className="font-semibold text-white tracking-wide text-lg">Recent Meeting</h3>
                  <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest bg-white/5 px-2 py-1 rounded">Yesterday</span>
                </div>
                
                <div className="flex items-start gap-5 mb-10">
                  <div className="w-12 h-12 rounded-xl bg-blue-600/10 flex items-center justify-center border border-blue-500/30 shrink-0">
                    <div className="w-5 h-5 rounded-md bg-blue-500 shadow-[0_0_15px_rgba(37,99,235,0.8)]" />
                  </div>
                  <div>
                    <h4 className="text-[17px] font-medium text-white mb-1.5 tracking-wide leading-snug">Product Strategy & AI Integration</h4>
                    <p className="text-xs font-mono text-zinc-500 tracking-[0.1em]">48 MIN • 6 PARTICIPANTS</p>
                  </div>
                </div>

                <ul className="space-y-5 mb-8 flex-1">
                  <li className="flex items-start gap-4">
                    <div className="mt-1.5 w-4 h-4 rounded-full bg-blue-600/20 flex items-center justify-center shrink-0 border border-blue-500/40">
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                    </div>
                    <p className="text-[15px] text-zinc-300 leading-relaxed font-light">Adopt Vector DB for knowledge retrieval by Q3.</p>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="mt-1.5 w-4 h-4 rounded-full bg-transparent flex items-center justify-center shrink-0 border border-zinc-600">
                      <div className="w-1.5 h-1.5 bg-transparent rounded-full" />
                    </div>
                    <p className="text-[15px] text-zinc-400 leading-relaxed font-light">Re-allocate 20% budget to GPU infrastructure.</p>
                  </li>
                </ul>

                <button 
                  onClick={() => router.push('/meetings')}
                  className="w-full bg-[#111] hover:bg-[#1f1f1f] border border-white/10 transition-all text-white text-sm font-medium py-3.5 rounded-xl flex items-center justify-center gap-2 group mt-6 shadow-inner tracking-wide"
                >
                  Review Transcript <span className="text-zinc-600 group-hover:translate-x-1 group-hover:text-blue-400 transition-all">→</span>
                </button>
              </div>
            </motion.div>

            {/* Knowledge Context Card */}
            <motion.div variants={itemVars} className="glass-surface p-8 rounded-[24px] hover:bg-white/[0.04] transition-colors shadow-2xl relative overflow-hidden group cursor-pointer" onClick={() => router.push('/knowledge')}>
              <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-500 to-indigo-500 opacity-50 group-hover:opacity-100 transition-opacity" />
              
              <h3 className="font-semibold text-white mb-8 flex items-center gap-3 text-lg tracking-wide">
                <Zap className="w-5 h-5 text-blue-500 filter drop-shadow-[0_0_8px_rgba(37,99,235,0.6)]" />
                Knowledge Context
              </h3>
              
              {decisions.length > 0 ? (
                <>
                  <p className="italic text-[15px] text-zinc-400 mb-8 font-light border-l border-white/10 pl-4 py-1 leading-relaxed">
                    &quot;{decisions[decisions.length - 1]?.context}&quot;
                  </p>
                  <p className="text-[15px] text-zinc-300 leading-relaxed mb-8 font-light">
                    {decisions[decisions.length - 1]?.outcome}
                  </p>
                </>
              ) : (
                <p className="text-[15px] text-zinc-500 mb-8 font-light">No decisions logged yet. Upload a meeting transcript to get started.</p>
              )}

              <button 
                onClick={(e) => { e.stopPropagation(); router.push('/knowledge'); }}
                className="flex items-center gap-2 text-[10px] font-mono text-zinc-500 uppercase tracking-[0.15em] font-semibold bg-black/40 w-fit px-4 py-2 rounded-lg border border-white/5 hover:border-white/20 hover:text-zinc-300 transition-colors"
              >
                <FileText className="w-3.5 h-3.5" />
                Search Knowledge Base →
              </button>
            </motion.div>
          </div>

          {/* COLUMN 2: Pipeline */}
          <motion.div variants={itemVars} className="flex flex-col">
            <div className="flex items-center justify-between pb-6 mb-8 border-b border-white/5">
              <div className="flex items-center gap-4">
                <h3 className="font-semibold text-white tracking-wide text-lg">Pipeline</h3>
                <span className="bg-blue-600/20 text-blue-400 flex items-center justify-center text-[10px] font-mono px-3 py-1 rounded font-bold tracking-widest shadow-[inset_0_0_10px_rgba(37,99,235,0.2)]">
                  {activeTasks} ACTIVE
                </span>
              </div>
              <button 
                onClick={() => router.push('/tasks')}
                className="text-zinc-600 hover:text-white transition-colors bg-white/5 p-2 rounded-lg"
              >
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 space-y-5">
              {tasks.slice(0, 6).map((task) => (
                <div key={task.id} className="relative group cursor-pointer border border-transparent hover:border-white/10 bg-transparent hover:glass-surface p-5 rounded-[20px] transition-all duration-300 hover:shadow-2xl hover:-translate-y-1" onClick={() => router.push('/tasks')}>
                  <div className="flex items-center justify-between gap-5">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${task.owner}&style=circle&backgroundColor=0a0a0a`} className="w-12 h-12 rounded-full border border-white/10 shadow-inner group-hover:border-blue-500/50 transition-colors" alt="" />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-[15px] font-medium text-white mb-2 truncate group-hover:text-blue-400 transition-colors tracking-wide">{task.title}</h4>
                      <div className="flex items-center gap-3 text-[11px] font-mono text-zinc-500 tracking-[0.1em]">
                        <span className="bg-white/5 px-2 py-0.5 rounded flex items-center gap-1.5"><Bot className="w-3 h-3 text-blue-500" /> Agent Processing</span>
                        <span className="text-zinc-700">•</span>
                        <span>{task.sourceMeeting}</span>
                      </div>
                    </div>
                    <div className={`text-[10px] font-mono font-bold uppercase tracking-[0.1em] px-3 py-1.5 rounded-lg border ${
                      task.status === 'In Progress' ? 'border-blue-500/40 text-blue-400 bg-blue-500/10 shadow-[0_0_15px_rgba(37,99,235,0.2)]' :
                      task.status === 'Done' ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10' :
                      'border-zinc-700 text-zinc-600 bg-transparent'
                    }`}>
                      {task.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button 
              onClick={() => setIsTaskModalOpen(true)}
              className="mt-12 w-full bg-blue-600 hover:bg-blue-500 transition-all text-white font-medium py-4 rounded-[16px] shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.6)] flex items-center justify-center gap-3 relative overflow-hidden group tracking-wide text-[15px]"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              <Plus className="w-5 h-5" /> New Task Entry
            </button>
          </motion.div>

          {/* COLUMN 3: Exit Risk & Score */}
          <motion.div variants={itemVars} className="flex flex-col">
            <div className="flex items-center justify-between pb-6 mb-8 border-b border-white/5">
              <h3 className="font-semibold text-white tracking-wide text-lg">Team Overview</h3>
              <div className="bg-white/5 p-2 rounded-lg cursor-pointer" onClick={() => router.push('/team')}>
                <Activity className="w-5 h-5 text-zinc-400 hover:text-white transition-colors" />
              </div>
            </div>

            <div className="space-y-6 mb-auto">
              {team.slice(0, 3).map((member) => {
                const memberTasks = allTasks.filter(t => t.owner === member.name);
                const pendingCount = memberTasks.filter(t => t.status !== "Done").length;
                const riskLevel = pendingCount > 3 ? "HIGH" : pendingCount > 1 ? "MEDIUM" : "LOW";
                const riskColor = riskLevel === "HIGH" ? "red" : riskLevel === "MEDIUM" ? "amber" : "blue";
                const riskPercent = Math.min(pendingCount * 20, 100);

                return (
                  <div key={member.id} className={`p-6 rounded-[20px] bg-black/20 border border-white/5 hover:border-${riskColor}-500/30 hover:bg-${riskColor}-500/5 transition-all duration-300 group`}>
                    <div className="flex items-center gap-5 mb-6">
                      <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${member.name}&style=circle&backgroundColor=0a0a0a`} className="w-12 h-12 rounded-full border border-white/10" alt="" />
                      <div>
                        <h4 className="text-[15px] font-medium text-white mb-1">{member.name}</h4>
                        <p className={`text-[10px] font-mono font-bold tracking-[0.2em] ${
                          riskLevel === "HIGH" ? "text-red-500" : riskLevel === "MEDIUM" ? "text-amber-500" : "text-blue-500"
                        }`}>{riskLevel} LOAD</p>
                      </div>
                    </div>
                    <div className="flex justify-between text-[11px] text-zinc-500 font-mono tracking-widest mb-4">
                      <span>{memberTasks.length} TASKS</span>
                      <span className="text-zinc-400 cursor-pointer hover:text-white" onClick={() => router.push(`/agent/${member.id}`)}>VIEW AGENT →</span>
                    </div>
                    <div className="w-full h-1.5 bg-black/80 border border-white/5 rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${riskPercent}%` }} transition={{ duration: 1.5, delay: 0.2 }} className={`h-full rounded-full ${
                        riskLevel === "HIGH" ? "bg-gradient-to-r from-red-600 to-red-400 shadow-[0_0_10px_rgba(239,68,68,0.8)]" :
                        riskLevel === "MEDIUM" ? "bg-gradient-to-r from-amber-600 to-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.8)]" :
                        "bg-blue-500"
                      }`} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Stability Score */}
            <div className="mt-12 glass-surface p-8 rounded-[24px] border border-white/10 shadow-2xl relative overflow-hidden cursor-default">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                 <Activity className="w-32 h-32 text-blue-500" />
              </div>
              
              <div className="flex justify-between items-end mb-8 relative z-10">
                <h4 className="text-[11px] font-mono text-zinc-400 tracking-[0.2em] font-bold">COMPLETION RATE</h4>
                <span className="text-4xl font-light text-white tracking-tight leading-none">{stabilityScore}%</span>
              </div>
              <div className="w-full h-1 bg-black/60 rounded-full mb-8 relative z-10 overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${stabilityScore}%` }} transition={{ duration: 1.5, delay: 0.6 }} className="h-full bg-blue-500 rounded-full shadow-[0_0_15px_rgba(37,99,235,1)]" />
              </div>
              <p className="text-[13px] text-zinc-400 leading-relaxed font-light relative z-10">
                {doneTasks} of {totalTasks} tasks completed. {inProgressTasks} in progress, {pendingTasks} pending.
              </p>
            </div>
          </motion.div>
        </motion.div>

        {/* Bottom Global Stats Bar */}
        <motion.div 
          initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.8, delay: 0.2 }}
          className="glass-surface border-t border-white/5 px-12 py-6 flex items-center justify-between w-full mt-auto shrink-0 relative z-20"
        >
          <div className="flex gap-24">
            <div>
              <p className="text-[10px] font-mono font-bold text-zinc-500 tracking-[0.2em] mb-3">SPRINT</p>
              <div className="flex items-center gap-3">
                <span className="text-[15px] font-medium text-white tracking-wide">V2.4 Launch</span>
                <Rocket className="w-4 h-4 text-blue-500" />
              </div>
            </div>

            <div>
              <p className="text-[10px] font-mono font-bold text-zinc-500 tracking-[0.2em] mb-3">TASKS</p>
              <div className="flex items-center gap-3">
                <span className="text-[15px] font-medium text-white font-mono tracking-widest">{totalTasks}</span>
              </div>
            </div>

            <div>
              <p className="text-[10px] font-mono font-bold text-zinc-500 tracking-[0.2em] mb-3">BLOCKERS</p>
              <div className="flex items-center gap-3 cursor-pointer" onClick={() => router.push('/tasks')}>
                <div className="w-5 h-5 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/30">
                  <div className="w-2 h-2 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(37,99,235,0.8)]" />
                </div>
                <span className="text-[15px] font-medium text-white tracking-wide hover:underline">{pendingTasks} Pending</span>
                <Bug className="w-4 h-4 text-red-500 ml-1" />
              </div>
            </div>

            <div>
              <p className="text-[10px] font-mono font-bold text-zinc-500 tracking-[0.2em] mb-3">TEAM</p>
              <div className="flex items-center gap-3 cursor-pointer" onClick={() => router.push('/team')}>
                <span className="text-[15px] font-medium text-white tracking-wide hover:underline">{team.length} Members</span>
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
              </div>
            </div>
          </div>

          {/* Floating Action Button */}
          <button 
            onClick={() => setIsTaskModalOpen(true)}
            className="w-14 h-14 rounded-full bg-white text-black flex items-center justify-center hover:bg-zinc-200 hover:scale-110 transition-all shadow-[0_0_30px_rgba(255,255,255,0.2)]"
          >
            <Plus className="w-6 h-6" />
          </button>
        </motion.div>
      </div>

      <Modal 
        isOpen={isTaskModalOpen} 
        onClose={() => setIsTaskModalOpen(false)}
        title="Create Agentic Task"
      >
        <div className="space-y-5">
           <div>
             <label className="block text-[11px] font-mono text-zinc-500 tracking-widest mb-2 uppercase">Task Directive</label>
             <input 
               type="text" 
               value={newTitle}
               onChange={(e) => setNewTitle(e.target.value)}
               placeholder="e.g. Optimize vector embedding pipeline" 
               className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500/50" 
             />
           </div>
           <div className="grid grid-cols-2 gap-5">
             <div>
               <label className="block text-[11px] font-mono text-zinc-500 tracking-widest mb-2 uppercase">Assignee</label>
               <select 
                 value={newAssignee}
                 onChange={(e) => setNewAssignee(e.target.value)}
                 className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500/50 appearance-none"
               >
                  {team.map(m => (
                    <option key={m.id} value={m.name}>{m.name}</option>
                  ))}
               </select>
             </div>
             <div>
               <label className="block text-[11px] font-mono text-zinc-500 tracking-widest mb-2 uppercase">Deadline</label>
               <input 
                 type="date" 
                 value={newDeadline}
                 onChange={(e) => setNewDeadline(e.target.value)}
                 className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500/50"
               />
             </div>
           </div>
           <button 
             onClick={handleCreateTask}
             disabled={!newTitle.trim()}
             className={`w-full mt-6 font-medium py-3.5 rounded-xl transition-all tracking-wide ${
               newTitle.trim() 
                 ? "bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_15px_rgba(37,99,235,0.3)]" 
                 : "bg-white/5 text-zinc-600 cursor-not-allowed"
             }`}
           >
             Push to Pipeline
           </button>
        </div>
      </Modal>
    </>
  );
}
