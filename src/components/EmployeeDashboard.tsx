"use client";

import { store, Task } from "@/lib/store";
import { useRole } from "./RoleContext";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo, useCallback } from "react";
import { 
  Calendar, 
  MessageSquare, 
  Clock, 
  CheckCircle2, 
  ArrowRight, 
  Code2, 
  Bot, 
  Terminal,
  Zap,
  Layout,
  Loader2,
  Send
} from "lucide-react";
import { AgentBlob } from "./AgentBlob";
import { generateCodeForTask, hasApiKey } from "@/lib/ai";

export function EmployeeDashboard() {
  const { currentUser } = useRole();
  const [refreshKey, setRefreshKey] = useState(0);
  const refresh = useCallback(() => setRefreshKey(k => k + 1), []);

  const allTasks = store.getTasks();
  const myTasks = useMemo(() => 
    allTasks.filter(t => t.owner === currentUser).sort((a,b) => b.assignedDate.localeCompare(a.assignedDate)),
    [allTasks, currentUser, refreshKey]
  );

  const [selectedTask, setSelectedTask] = useState<Task | null>(myTasks[0] || null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<{role: "user" | "ai"; text: string}[]>([]);

  const pendingCount = myTasks.filter(t => t.status !== "Done").length;

  const handleGenerateCode = async () => {
    if (!selectedTask) return;
    if (!hasApiKey()) {
      setError("No API key configured. Ask your Manager to set it up in Settings.");
      return;
    }

    setIsGenerating(true);
    setError(null);
    setGeneratedCode(null);

    try {
      const code = await generateCodeForTask(
        selectedTask.title, 
        `Source meeting: ${selectedTask.sourceMeeting}, Deadline: ${selectedTask.deadline}`,
        currentUser
      );
      setGeneratedCode(code);
    } catch (err: any) {
      setError(err.message || "AI generation failed.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleMarkComplete = () => {
    if (!selectedTask) return;
    store.updateTaskStatus(selectedTask.id, "Done");
    setSelectedTask({ ...selectedTask, status: "Done" });
    refresh();
  };

  const handleMarkInProgress = () => {
    if (!selectedTask) return;
    store.updateTaskStatus(selectedTask.id, "In Progress");
    setSelectedTask({ ...selectedTask, status: "In Progress" });
    refresh();
  };

  const handleChatSend = async () => {
    if (!chatInput.trim() || !selectedTask) return;
    if (!hasApiKey()) {
      setError("No API key configured.");
      return;
    }

    const userMsg = chatInput.trim();
    setChatInput("");
    setChatMessages(prev => [...prev, { role: "user", text: userMsg }]);

    try {
      const { generateCodeForTask } = await import("@/lib/ai");
      const response = await generateCodeForTask(
        userMsg,
        `Context: Working on "${selectedTask.title}" from ${selectedTask.sourceMeeting}`,
        currentUser
      );
      setChatMessages(prev => [...prev, { role: "ai", text: response }]);
    } catch {
      setChatMessages(prev => [...prev, { role: "ai", text: "Sorry, I couldn't process that. Check your API key." }]);
    }
  };

  return (
    <div className="h-full flex overflow-hidden">
      
      {/* Left Sidebar: My Task Queue */}
      <div className="w-[380px] border-r border-white/5 flex flex-col pt-8 bg-black/20">
        <div className="px-8 mb-10">
          <h2 className="text-[11px] font-mono font-bold text-zinc-500 tracking-[0.2em] mb-4 uppercase">My Work Queue</h2>
          <div className="flex items-center gap-3 bg-blue-500/5 border border-blue-500/20 px-4 py-3 rounded-2xl">
            <Clock className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium text-white">{pendingCount} Tasks Pending</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 space-y-3 pb-10 scrollbar-hide">
          {myTasks.map((task) => (
            <motion.div
              layoutId={task.id}
              key={task.id}
              onClick={() => {
                setSelectedTask(task);
                setGeneratedCode(null);
                setError(null);
                setChatMessages([]);
              }}
              className={`p-5 rounded-[20px] transition-all cursor-pointer border ${
                selectedTask?.id === task.id 
                  ? "bg-white/5 border-white/10 shadow-xl" 
                  : "border-transparent hover:bg-white/[0.02]"
              }`}
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <h3 className={`text-[15px] font-medium transition-colors ${
                  selectedTask?.id === task.id ? "text-blue-400" : "text-zinc-300"
                }`}>
                  {task.title}
                </h3>
                {task.status === "Done" && <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />}
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-[11px] text-zinc-500 font-mono">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>DUE {task.deadline}</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-zinc-500 font-mono">
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span className="truncate">FROM: {task.sourceMeeting}</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] font-mono">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider ${
                    task.status === "Done" ? "text-emerald-400 bg-emerald-500/10" :
                    task.status === "In Progress" ? "text-blue-400 bg-blue-500/10" :
                    "text-zinc-500 bg-white/5"
                  }`}>
                    {task.status.toUpperCase()}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
          
          {myTasks.length === 0 && (
            <div className="text-center py-16 text-zinc-600 text-sm font-light">
              No tasks assigned yet. Your manager will assign tasks from meetings.
            </div>
          )}
        </div>
      </div>

      {/* Main Content: Agent Interactive Terminal */}
      <div className="flex-1 flex flex-col relative">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/5 to-transparent pointer-events-none" />
        
        <AnimatePresence mode="wait">
          {selectedTask ? (
            <motion.div
              key={selectedTask.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex-1 flex flex-col p-12 relative z-10 overflow-y-auto scrollbar-hide"
            >
              <header className="mb-14 flex items-start justify-between">
                <div className="max-w-2xl">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-[10px] font-mono font-bold text-blue-400 bg-blue-400/10 border border-blue-400/30 px-2 py-0.5 rounded tracking-widest uppercase">Dynamic Execute</span>
                    <span className="text-zinc-700">•</span>
                    <span className={`text-[10px] font-mono font-bold tracking-widest uppercase px-2 py-0.5 rounded ${
                      selectedTask.status === "Done" ? "text-emerald-400 bg-emerald-500/10" :
                      selectedTask.status === "In Progress" ? "text-blue-400 bg-blue-500/10" :
                      "text-zinc-500 bg-white/5"
                    }`}>{selectedTask.status}</span>
                  </div>
                  <h1 className="text-4xl font-semibold tracking-tight text-white mb-6 leading-tight">
                    {selectedTask.title}
                  </h1>
                </div>

                {/* Animated AI Agent Orb */}
                <div className="flex flex-col items-center gap-3">
                   <AgentBlob />
                   <span className="text-[10px] font-mono font-bold text-blue-500 tracking-[0.3em] uppercase animate-pulse">Agent Active</span>
                </div>
              </header>

              <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 flex-1">
                {/* Left: Guidance */}
                <div className="lg:col-span-2 space-y-8">
                  <div className="glass-surface p-8 rounded-[24px] border border-white/5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                      <Bot className="w-32 h-32 text-blue-500" />
                    </div>
                    <div className="flex items-center gap-3 mb-6">
                      <Zap className="w-5 h-5 text-blue-400" />
                      <h3 className="text-lg font-medium text-white tracking-wide">AI Directive</h3>
                    </div>
                    <p className="text-zinc-400 font-light leading-relaxed mb-6">
                      Task from <span className="text-white border-b border-white/20">{selectedTask.sourceMeeting}</span>. 
                      Due by <span className="text-white border-b border-white/20">{selectedTask.deadline}</span>. 
                      Click &quot;AI Support Code&quot; to get AI-generated guidance and starter code.
                    </p>
                  </div>

                  {/* Error display */}
                  {error && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-sm text-red-400 font-light">
                      {error}
                    </div>
                  )}

                  <div className="flex gap-4">
                    <button 
                      onClick={handleGenerateCode}
                      disabled={isGenerating}
                      className="flex-1 bg-white text-black font-semibold h-14 rounded-2xl flex items-center justify-center gap-2 hover:bg-zinc-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] text-sm tracking-wide"
                    >
                      {isGenerating ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</>
                      ) : (
                        <><Code2 className="w-4 h-4" /> AI Support Code</>
                      )}
                    </button>
                    {selectedTask.status !== "Done" ? (
                      <button 
                        onClick={selectedTask.status === "Pending" ? handleMarkInProgress : handleMarkComplete}
                        className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-semibold h-14 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(37,99,235,0.2)] text-sm tracking-wide"
                      >
                        {selectedTask.status === "Pending" ? "Start Task" : "Mark Completed"}
                      </button>
                    ) : (
                      <div className="flex-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-semibold h-14 rounded-2xl flex items-center justify-center gap-2 text-sm tracking-wide">
                        <CheckCircle2 className="w-4 h-4" /> Completed
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Code/Terminal */}
                <div className="lg:col-span-3">
                  <div className="bg-[#050505] border border-white/5 rounded-[24px] overflow-hidden h-[500px] flex flex-col shadow-2xl">
                    <div className="bg-[#0a0a0a] border-b border-white/5 px-6 py-4 flex items-center justify-between shrink-0">
                       <div className="flex items-center gap-6">
                          <div className="flex items-center gap-2">
                             <Terminal className="w-4 h-4 text-zinc-600" />
                             <span className="text-[11px] font-mono text-zinc-500 tracking-widest uppercase">AI Workspace</span>
                          </div>
                          <div className="w-px h-3 bg-zinc-800" />
                          <span className="text-[11px] font-mono text-blue-400/60 lowercase italic">
                            {isGenerating ? "generating..." : generatedCode ? "response_ready" : "awaiting_input..."}
                          </span>
                       </div>
                       <div className="flex gap-1.5">
                          <div className="w-2.5 h-2.5 rounded-full bg-red-900/30" />
                          <div className="w-2.5 h-2.5 rounded-full bg-amber-900/30" />
                          <div className="w-2.5 h-2.5 rounded-full bg-emerald-900/30" />
                       </div>
                    </div>
                    
                    <div className="flex-1 p-6 font-mono text-[13px] leading-relaxed overflow-y-auto scrollbar-hide">
                      {isGenerating ? (
                        <div className="flex items-center gap-3 text-blue-400">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>AI is analyzing your task and generating code...</span>
                        </div>
                      ) : generatedCode ? (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                          <span className="text-emerald-500">{"> > >"} AI RESPONSE</span>
                          <br /><br />
                          <pre className="whitespace-pre-wrap text-zinc-300 font-light leading-relaxed">{generatedCode}</pre>
                        </motion.div>
                      ) : chatMessages.length > 0 ? (
                        <div className="space-y-4">
                          {chatMessages.map((msg, i) => (
                            <div key={i} className={msg.role === "user" ? "text-blue-400" : "text-zinc-300"}>
                              <span className="text-zinc-600 text-[10px]">{msg.role === "user" ? "YOU" : "AI"} →</span>
                              <br />
                              <pre className="whitespace-pre-wrap font-light">{msg.text}</pre>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-zinc-700 italic">
                          Click &quot;AI Support Code&quot; to have your agentic assistant generate code and guidance for this task, or type a question below.
                        </div>
                      )}
                    </div>

                    {/* Chat input */}
                    <div className="border-t border-white/5 px-4 py-3 flex gap-3 shrink-0">
                      <input 
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleChatSend()}
                        placeholder="Ask the AI about this task..."
                        className="flex-1 bg-transparent border-none outline-none text-sm text-white placeholder:text-zinc-700 font-mono"
                      />
                      <button 
                        onClick={handleChatSend}
                        disabled={!chatInput.trim()}
                        className="text-zinc-600 hover:text-blue-400 transition-colors disabled:opacity-30"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-md"
              >
                <div className="mb-10 flex flex-col items-center">
                   <AgentBlob />
                   <div className="mt-6 flex items-center gap-2 bg-blue-500/10 px-4 py-1.5 rounded-full border border-blue-500/20 shadow-[0_0_20px_rgba(37,99,235,0.1)]">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                      <span className="text-[10px] font-mono font-bold text-blue-400 tracking-widest uppercase">Agent Neutral Standby</span>
                   </div>
                </div>
                
                <h2 className="text-2xl font-semibold text-white mb-4 tracking-tight">Welcome, {currentUser}</h2>
                <p className="text-zinc-500 font-light leading-relaxed mb-10">
                  Your neural node is active and synchronized. Select a task from your queue, or wait for new assignments from your Manager.
                </p>

                <div className="glass-surface p-6 rounded-2xl border border-white/5 bg-white/[0.02] text-left">
                   <div className="flex items-center gap-3 mb-4 text-zinc-400 text-[11px] font-mono tracking-widest uppercase">
                      <Zap className="w-3.5 h-3.5" /> System Status
                   </div>
                   <div className="space-y-3">
                      <div className="flex items-center justify-between">
                         <span className="text-[12px] text-zinc-600">Tasks in Pipeline</span>
                         <span className="text-[12px] text-white font-mono">{myTasks.length}</span>
                      </div>
                      <div className="flex items-center justify-between">
                         <span className="text-[12px] text-zinc-600">Manager Link</span>
                         <span className="text-[12px] text-emerald-500 font-mono">ACTIVE</span>
                      </div>
                      <div className="flex items-center justify-between">
                         <span className="text-[12px] text-zinc-600">AI Engine</span>
                         <span className={`text-[12px] font-mono ${hasApiKey() ? "text-emerald-500" : "text-amber-500"}`}>
                           {hasApiKey() ? "ONLINE" : "KEY NEEDED"}
                         </span>
                      </div>
                   </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
}
