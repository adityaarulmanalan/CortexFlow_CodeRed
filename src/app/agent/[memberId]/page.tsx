"use client";

import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Bot, Terminal, Code2, ArrowLeft, CheckCircle2, Loader2, ArrowRight } from "lucide-react";
import { store } from "@/lib/store";
import { useState, useCallback } from "react";
import { generateCodeForTask, hasApiKey } from "@/lib/ai";

export default function AgentWorkspacePage() {
  const params = useParams();
  const router = useRouter();
  const memberId = params?.memberId as string;
  
  const allTeam = store.getTeam();
  const member = allTeam.find(m => m.id === memberId) || allTeam[0];
  const allTasks = store.getTasks();
  const memberTasks = allTasks.filter(t => t.owner === member?.name);
  const activeTask = memberTasks.find(t => t.status !== "Done") || memberTasks[0];
  
  const [refreshKey, setRefreshKey] = useState(0);
  const refresh = useCallback(() => setRefreshKey(k => k + 1), []);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateCode = async () => {
    if (!activeTask) return;
    if (!hasApiKey()) {
      setError("No API key configured. Go to Settings → AI Configuration.");
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const code = await generateCodeForTask(
        activeTask.title,
        `Source meeting: ${activeTask.sourceMeeting}, Assigned to: ${member.name} (${member.role}), Deadline: ${activeTask.deadline}`,
        member.name
      );
      setGeneratedCode(code);
    } catch (err: any) {
      setError(err.message || "AI generation failed.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleStatusChange = (newStatus: "In Progress" | "Done") => {
    if (!activeTask) return;
    store.updateTaskStatus(activeTask.id, newStatus);
    refresh();
  };

  const containerVars = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.15 } }
  };

  const itemVars = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  if (!member) {
    return <div className="h-full flex items-center justify-center text-zinc-500">Member not found</div>;
  }

  // Re-fetch active task after refresh
  const currentActiveTask = store.getTasks().find(t => t.id === activeTask?.id) || activeTask;

  return (
    <div className="h-full flex flex-col pt-8 px-12 relative z-10 w-full max-w-6xl mx-auto mb-20 overflow-y-auto scrollbar-hide">
      
      <button 
        onClick={() => router.push('/team')}
        className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors text-sm font-medium w-fit mb-8"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Network
      </button>

      <motion.header variants={itemVars} initial="hidden" animate="show" className="mb-12 flex items-center gap-6">
        <div className="relative">
          <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full" />
          <div className="w-16 h-16 rounded-full bg-black/60 border border-blue-500/40 relative flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.3)]">
             <Bot className="w-8 h-8 text-blue-400 drop-shadow-[0_0_10px_rgba(56,189,248,0.8)]" />
          </div>
        </div>
        <div>
          <h1 className="text-3xl font-semibold tracking-wide text-white mb-1">{member.name}&apos;s Agent</h1>
          <p className="text-[14px] font-mono tracking-widest text-zinc-500 uppercase">{member.role} • {memberTasks.length} Tasks</p>
        </div>
      </motion.header>

      <motion.div variants={containerVars} initial="hidden" animate="show" className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Task List + Status */}
        <div className="lg:col-span-1 space-y-8">
          
          {/* Active task */}
          {currentActiveTask ? (
            <motion.div variants={itemVars} className="glass-surface p-8 rounded-[24px] border border-white/5">
              <h3 className="text-[11px] font-mono font-bold text-zinc-500 tracking-[0.2em] mb-4">ACTIVE DIRECTIVE</h3>
              <p className="text-lg font-medium text-white leading-snug mb-4">{currentActiveTask.title}</p>
              <div className="flex items-center gap-2 mb-6">
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded tracking-wider ${
                  currentActiveTask.status === "Done" ? "text-emerald-400 bg-emerald-500/10" :
                  currentActiveTask.status === "In Progress" ? "text-blue-400 bg-blue-500/10" :
                  "text-zinc-500 bg-white/5"
                }`}>
                  {currentActiveTask.status.toUpperCase()}
                </span>
                <span className="text-[10px] font-mono text-zinc-600">DUE {currentActiveTask.deadline}</span>
              </div>
              
              <div className="bg-black/40 border border-white/5 p-4 rounded-xl">
                <h4 className="text-[10px] font-mono font-bold text-blue-400 tracking-[0.2em] mb-2 flex items-center gap-2">
                  <Bot className="w-3 h-3" /> SOURCE
                </h4>
                <p className="text-sm font-light text-zinc-400 leading-relaxed">
                  From: {currentActiveTask.sourceMeeting}
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div variants={itemVars} className="glass-surface p-8 rounded-[24px] border border-white/5 text-center">
              <p className="text-zinc-500 font-light">No active tasks for this agent.</p>
            </motion.div>
          )}

          {/* Status buttons */}
          {currentActiveTask && currentActiveTask.status !== "Done" && (
            <motion.div variants={itemVars} className="glass-surface p-6 rounded-[24px] border border-white/5 space-y-3">
              <h3 className="text-[11px] font-mono font-bold text-zinc-500 tracking-[0.2em] mb-4">EXECUTION STATUS</h3>
              {currentActiveTask.status === "Pending" && (
                <button 
                  onClick={() => handleStatusChange("In Progress")}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-3 rounded-xl transition-all flex items-center justify-center gap-2 text-sm"
                >
                  <ArrowRight className="w-4 h-4" /> Start Execution
                </button>
              )}
              {currentActiveTask.status === "In Progress" && (
                <button 
                  onClick={() => handleStatusChange("Done")}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-3 rounded-xl transition-all flex items-center justify-center gap-2 text-sm"
                >
                  <CheckCircle2 className="w-4 h-4" /> Mark Complete
                </button>
              )}
            </motion.div>
          )}

          {/* Other tasks */}
          {memberTasks.length > 1 && (
            <motion.div variants={itemVars} className="glass-surface p-6 rounded-[24px] border border-white/5">
              <h3 className="text-[11px] font-mono font-bold text-zinc-500 tracking-[0.2em] mb-4">ALL TASKS ({memberTasks.length})</h3>
              <div className="space-y-3">
                {memberTasks.map(t => (
                  <div key={t.id} className="flex items-center justify-between text-sm">
                    <span className={`truncate flex-1 mr-3 ${t.status === "Done" ? "text-zinc-600 line-through" : "text-zinc-300"}`}>
                      {t.title}
                    </span>
                    <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded shrink-0 ${
                      t.status === "Done" ? "text-emerald-400 bg-emerald-500/10" :
                      t.status === "In Progress" ? "text-blue-400 bg-blue-500/10" :
                      "text-zinc-600 bg-white/5"
                    }`}>
                      {t.status === "In Progress" ? "WIP" : t.status === "Done" ? "✓" : "•"}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

        </div>

        {/* Right Column: Code Generation */}
        <div className="lg:col-span-2 space-y-8">
          
          <motion.div variants={itemVars} className="glass-surface p-8 rounded-[24px] border border-white/5 h-full flex flex-col">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/5">
              <h3 className="text-lg font-medium text-white tracking-wide">AI Execution Path</h3>
              <div className="flex items-center gap-3">
                <button 
                  onClick={handleGenerateCode}
                  disabled={isGenerating || !activeTask}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono font-semibold tracking-widest transition-all ${
                    isGenerating ? "bg-white/5 text-zinc-600" :
                    generatedCode ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                    "bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white border border-blue-500/30"
                  }`}
                >
                  {isGenerating ? (
                    <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Generating...</>
                  ) : generatedCode ? (
                    <><CheckCircle2 className="w-3.5 h-3.5" /> Regenerate</>
                  ) : (
                    <><Code2 className="w-3.5 h-3.5" /> Generate with AI</>
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-sm text-red-400 font-light mb-6">
                {error}
              </div>
            )}

            {/* Code output */}
            <div className="flex-1">
              {generatedCode ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <div className="bg-[#0a0a0a] rounded-xl border border-white/10 overflow-hidden">
                    <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 bg-[#111]">
                      <Terminal className="w-4 h-4 text-zinc-500" />
                      <span className="text-[11px] font-mono text-zinc-500 tracking-widest">ai_output</span>
                      <span className="ml-auto text-[10px] font-mono text-emerald-500">GENERATED</span>
                    </div>
                    <pre className="p-6 text-[13px] font-mono text-zinc-300 overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-[500px] overflow-y-auto scrollbar-hide">
                      {generatedCode}
                    </pre>
                  </div>
                </motion.div>
              ) : activeTask ? (
                <div className="space-y-6">
                  <p className="text-zinc-500 font-light text-sm italic mb-8">
                    Click &quot;Generate with AI&quot; to have Gemini create an execution plan and starter code for this task.
                  </p>
                  {[
                    { step: 1, title: 'Analyze Requirements', desc: `Parse the task "${activeTask.title}" and identify key deliverables.` },
                    { step: 2, title: 'Generate Implementation', desc: 'AI will create contextual code and step-by-step instructions.' },
                    { step: 3, title: 'Execute & Verify', desc: 'Follow the generated plan and mark the task complete.' }
                  ].map((s) => (
                    <div key={s.step} className="flex gap-5 group">
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full bg-black/60 border border-zinc-700 flex items-center justify-center text-[11px] font-mono font-bold text-zinc-400 group-hover:border-blue-500 group-hover:text-blue-400 transition-colors">
                          0{s.step}
                        </div>
                        {s.step !== 3 && <div className="w-px h-full bg-white/5 my-2" />}
                      </div>
                      <div className="pb-6">
                        <h4 className="text-[15px] font-medium text-white mb-1 tracking-wide">{s.title}</h4>
                        <p className="text-[13px] font-light text-zinc-400 leading-relaxed pr-10">{s.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 text-zinc-600 font-light">
                  No active tasks to generate code for.
                </div>
              )}
            </div>
          </motion.div>

        </div>

      </motion.div>

    </div>
  );
}
