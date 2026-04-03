"use client";

import { store, TaskStatus } from "@/lib/store";
import { Plus, MoreHorizontal, CheckCircle2, Clock, CircleDashed, Bot, Trash2, ArrowRight, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useCallback } from "react";
import { Modal } from "@/components/Modal";
import { useRole } from "@/components/RoleContext";
import { AccessDenied } from "@/components/AccessDenied";

export default function TasksPage() {
  const { role } = useRole();
  if (role === 'employee') return <AccessDenied />;
  
  const [refreshKey, setRefreshKey] = useState(0);
  const refresh = useCallback(() => setRefreshKey(k => k + 1), []);
  
  const allTasks = store.getTasks();
  const team = store.getTeam().filter(m => m.type === "employee");
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  // Form state for new task
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

  const handleStatusChange = (taskId: string, newStatus: TaskStatus) => {
    store.updateTaskStatus(taskId, newStatus);
    setActiveMenu(null);
    refresh();
  };

  const handleDelete = (taskId: string) => {
    store.deleteTask(taskId);
    setActiveMenu(null);
    refresh();
  };

  const containerVars = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVars = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    show: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.6 } }
  };

  const columns = [
    { title: "Pending", status: "Pending" as TaskStatus, icon: CircleDashed, color: "text-zinc-500", glow: "shadow-zinc-500/20" },
    { title: "In Progress", status: "In Progress" as TaskStatus, icon: Clock, color: "text-blue-500", glow: "shadow-[0_0_15px_rgba(37,99,235,0.4)]" },
    { title: "Done", status: "Done" as TaskStatus, icon: CheckCircle2, color: "text-emerald-500", glow: "shadow-[0_0_15px_rgba(16,185,129,0.4)]" }
  ];

  const statusOptions: TaskStatus[] = ["Pending", "In Progress", "Done"];

  return (
    <>
      <div className="h-full flex flex-col pt-12 px-12 relative z-10 w-full overflow-hidden">
        <motion.header variants={itemVars} initial="hidden" animate="show" className="mb-10 flex items-end justify-between shrink-0">
          <div>
            <h1 className="text-3xl font-semibold tracking-wide text-white mb-3">Pipeline Execution</h1>
            <p className="text-[15px] font-light text-zinc-400">Orchestrate and monitor extracted tasks dynamically.</p>
          </div>
          <button 
            onClick={() => setIsTaskModalOpen(true)}
            className="bg-white hover:bg-zinc-200 text-black text-[15px] font-medium px-6 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
          >
              <Plus className="w-5 h-5" /> New Entry
          </button>
        </motion.header>

        <motion.div variants={containerVars} initial="hidden" animate="show" className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-10 overflow-hidden pb-10">
          
          {columns.map(col => {
            const colTasks = allTasks.filter(t => t.status === col.status);
            const Icon = col.icon;
            
            return (
              <motion.div variants={itemVars} key={col.title} className="flex flex-col h-full rounded-[24px] bg-black/20 border border-white/5 relative group p-6 hover:bg-black/40 transition-colors">
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/5">
                  <h3 className="font-semibold text-white tracking-wide text-[16px] flex items-center gap-3">
                    <Icon className={`w-5 h-5 ${col.color} ${col.glow} rounded-full`} /> {col.title}
                  </h3>
                  <span className="text-[10px] font-mono font-bold text-zinc-600 bg-white/5 px-2 py-1 rounded tracking-widest">{colTasks.length}</span>
                </div>
                
                <div className="flex-1 overflow-y-auto scrollbar-hide space-y-4 -mx-2 px-2">
                  {colTasks.map(task => (
                    <div key={task.id} className="glass-surface border border-white/5 rounded-[16px] p-5 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 hover:border-white/10 group/card relative">
                      <h4 className="text-[15px] font-medium text-white mb-4 tracking-wide group-hover/card:text-blue-400 transition-colors">{task.title}</h4>
                      
                      <div className="flex items-center justify-between">
                         <div className="flex items-center gap-3">
                            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${task.owner}&style=circle&backgroundColor=0a0a0a`} className="w-8 h-8 rounded-full border border-white/10 bg-black/40" alt="" />
                            <div className="flex flex-col">
                              <span className="text-[12px] text-zinc-400 tracking-wide font-light">{task.owner}</span>
                              <span className="text-[10px] font-mono text-zinc-600 tracking-widest">{task.deadline}</span>
                            </div>
                         </div>
                         
                         {/* Action menu */}
                         <div className="relative">
                           <button 
                             onClick={() => setActiveMenu(activeMenu === task.id ? null : task.id)}
                             className="text-zinc-500 hover:text-white transition-all bg-white/5 p-1.5 rounded-md"
                           >
                             <MoreHorizontal className="w-4 h-4" />
                           </button>
                           
                           <AnimatePresence>
                             {activeMenu === task.id && (
                               <motion.div 
                                 initial={{ opacity: 0, scale: 0.95, y: -5 }} 
                                 animate={{ opacity: 1, scale: 1, y: 0 }} 
                                 exit={{ opacity: 0, scale: 0.95 }}
                                 className="absolute right-0 top-10 w-48 bg-[#111] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden"
                               >
                                 {statusOptions.filter(s => s !== task.status).map(status => (
                                   <button 
                                     key={status}
                                     onClick={() => handleStatusChange(task.id, status)}
                                     className="w-full text-left px-4 py-3 text-sm text-zinc-300 hover:bg-white/5 hover:text-white transition-colors flex items-center gap-2"
                                   >
                                     <ArrowRight className="w-3 h-3 text-blue-500" />
                                     Move to {status}
                                   </button>
                                 ))}
                                 <div className="border-t border-white/5" />
                                 <button 
                                   onClick={() => handleDelete(task.id)}
                                   className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition-colors flex items-center gap-2"
                                 >
                                   <Trash2 className="w-3 h-3" />
                                   Delete Task
                                 </button>
                               </motion.div>
                             )}
                           </AnimatePresence>
                         </div>
                      </div>
                    </div>
                  ))}
                  
                  {colTasks.length === 0 && (
                    <div className="text-center py-12 text-zinc-700 text-sm font-light">No tasks</div>
                  )}
                </div>
              </motion.div>
            )
          })}

        </motion.div>
      </div>

      {/* Task Creation Modal */}
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
