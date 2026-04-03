"use client";

import { useState } from "react";
import { UploadCloud, FileText, CheckCircle2, ArrowRight, Loader2, Bot, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRole } from "@/components/RoleContext";
import { AccessDenied } from "@/components/AccessDenied";
import { store } from "@/lib/store";
import { extractFromTranscript, hasApiKey, ExtractedData } from "@/lib/ai";

export default function MeetingsPage() {
  const { role } = useRole();
  const [transcriptText, setTranscriptText] = useState("");
  const [meetingTitle, setMeetingTitle] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isHovering, setIsHovering] = useState(false);

  if (role === 'employee') return <AccessDenied />;

  const handleExtract = async () => {
    if (!transcriptText.trim()) return;
    
    if (!hasApiKey()) {
      setError("No API key configured. Go to Settings → AI Configuration to add your Gemini API key.");
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const data = await extractFromTranscript(transcriptText);
      setExtractedData(data);
    } catch (err: any) {
      setError(err.message || "Failed to extract data. Check your API key.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmAndSave = () => {
    if (!extractedData) return;

    const title = meetingTitle.trim() || `Meeting ${new Date().toLocaleDateString()}`;

    // Add tasks to store
    extractedData.tasks.forEach((task, i) => {
      store.addTask({
        id: `t-${Date.now()}-${i}`,
        title: task.title,
        owner: task.owner,
        deadline: task.deadline,
        status: "Pending",
        assignedDate: new Date().toISOString().split("T")[0],
        sourceMeeting: title
      });
    });

    // Add decisions to store
    extractedData.decisions.forEach((dec, i) => {
      store.addDecision({
        id: `d-${Date.now()}-${i}`,
        context: dec.context,
        outcome: dec.outcome,
        date: new Date().toISOString().split("T")[0]
      });
    });

    // Save meeting transcript
    store.addMeeting({
      id: `meet-${Date.now()}`,
      title,
      date: new Date().toISOString().split("T")[0],
      transcript: transcriptText,
      summary: extractedData.summary
    });

    setIsSaved(true);
  };

  const handleReset = () => {
    setTranscriptText("");
    setMeetingTitle("");
    setExtractedData(null);
    setIsSaved(false);
    setError(null);
  };

  const containerVars = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.15 } }
  };

  const itemVars = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.8 } }
  };

  return (
    <div className="h-full flex flex-col pt-12 px-12 relative z-10 w-full mb-20 overflow-y-auto scrollbar-hide">
      <motion.header variants={itemVars} initial="hidden" animate="show" className="mb-14">
        <h1 className="text-3xl font-semibold tracking-wide text-white mb-3">Sync & Extract</h1>
        <p className="text-[15px] font-light text-zinc-400">Paste meeting transcripts — AI will extract tasks, decisions, and assign them to your team.</p>
      </motion.header>

      <motion.div variants={containerVars} initial="hidden" animate="show" className="max-w-4xl w-full">
        
        {!extractedData && !isSaved ? (
          <motion.div variants={itemVars} className="space-y-8">
            
            {/* Meeting Title */}
            <div>
              <label className="block text-[10px] font-mono font-bold text-zinc-500 tracking-[0.2em] mb-2 uppercase">Meeting Title (optional)</label>
              <input 
                type="text" 
                value={meetingTitle}
                onChange={(e) => setMeetingTitle(e.target.value)}
                placeholder="e.g. Q3 Strategy Sync"
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500/50 font-sans"
              />
            </div>

            {/* Transcript Input */}
            <div>
              <label className="block text-[10px] font-mono font-bold text-zinc-500 tracking-[0.2em] mb-2 uppercase">Meeting Transcript / Notes</label>
              <textarea
                value={transcriptText}
                onChange={(e) => setTranscriptText(e.target.value)}
                placeholder={`Paste your meeting transcript here...

Example:
"Sarah mentioned we need to finalize the Q3 marketing budget by April 15th. 
Alex suggested we set up a new AWS RDS instance for the vector database. 
The team decided to use React/Next.js for the new frontend project.
Michael needs to review the vendor contracts before end of week."`}
                className="w-full bg-black/40 border border-white/10 rounded-[20px] px-6 py-5 text-white outline-none focus:border-blue-500/50 font-sans min-h-[280px] resize-none placeholder:text-zinc-700 leading-relaxed"
              />
            </div>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-start gap-3"
                >
                  <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-red-400 font-light">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Extract Button */}
            <button 
              onClick={handleExtract}
              disabled={isProcessing || !transcriptText.trim()}
              className={`w-full h-16 rounded-2xl flex items-center justify-center gap-3 text-[15px] font-medium tracking-wide transition-all relative overflow-hidden group ${
                isProcessing 
                  ? "bg-blue-600/50 text-white/50 cursor-wait" 
                  : !transcriptText.trim() 
                    ? "bg-white/5 text-zinc-600 cursor-not-allowed" 
                    : "bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.6)]"
              }`}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  AI Extracting Tasks & Decisions...
                </>
              ) : (
                <>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none" />
                  <Bot className="w-5 h-5" />
                  Extract with AI
                </>
              )}
            </button>
          </motion.div>

        ) : isSaved ? (
          /* ── SAVED CONFIRMATION ── */
          <motion.div variants={itemVars} className="space-y-12">
            <div className="glass-surface p-10 rounded-[32px] border border-blue-500/20 shadow-[0_0_40px_rgba(37,99,235,0.1)] flex items-center gap-6 relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-indigo-600 shadow-[0_0_10px_rgba(37,99,235,0.8)]" />
               <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-7 h-7 text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
               </div>
               <div>
                 <h2 className="text-xl font-medium text-white tracking-wide mb-1">Tasks Pushed to Pipeline</h2>
                 <p className="text-sm font-light text-zinc-400">AI extracted and saved {extractedData?.tasks.length} tasks and {extractedData?.decisions.length} decisions.</p>
               </div>
               
               <div className="ml-auto flex gap-6">
                 <div className="text-center">
                    <p className="text-3xl font-light text-white leading-none">{extractedData?.tasks.length}</p>
                    <p className="text-[10px] font-mono font-bold text-zinc-500 tracking-[0.2em] mt-1">TASKS</p>
                 </div>
                 <div className="w-px h-10 bg-white/10" />
                 <div className="text-center">
                    <p className="text-3xl font-light text-white leading-none">{extractedData?.decisions.length}</p>
                    <p className="text-[10px] font-mono font-bold text-zinc-500 tracking-[0.2em] mt-1">DECISIONS</p>
                 </div>
               </div>
            </div>

            <div className="flex justify-end">
              <button 
                onClick={handleReset}
                className="text-sm font-semibold tracking-wide text-zinc-400 hover:text-white transition-colors flex items-center gap-2 group"
              >
                Upload another <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </motion.div>

        ) : (
          /* ── EXTRACTED DATA REVIEW ── */
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            
            {/* Summary */}
            <div className="glass-surface p-8 rounded-[24px] border border-white/5">
              <h3 className="text-[11px] font-mono font-bold text-blue-400 tracking-[0.2em] mb-3 flex items-center gap-2">
                <Bot className="w-4 h-4" /> AI MEETING SUMMARY
              </h3>
              <p className="text-[15px] font-light text-zinc-300 leading-relaxed">{extractedData?.summary}</p>
            </div>

            {/* Extracted Tasks */}
            <div className="glass-surface p-8 rounded-[24px] border border-white/5">
              <h3 className="text-[11px] font-mono font-bold text-zinc-500 tracking-[0.2em] mb-6">EXTRACTED TASKS ({extractedData?.tasks?.length ?? 0})</h3>
              <div className="space-y-4">
                {extractedData?.tasks?.map?.((task, i) => (
                  <div key={i} className="flex items-center justify-between bg-black/30 p-4 rounded-xl border border-white/5">
                    <div className="flex-1">
                      <h4 className="text-[15px] font-medium text-white mb-1">{task.title}</h4>
                      <div className="flex items-center gap-3 text-[11px] font-mono text-zinc-500 tracking-widest">
                        <span>→ {task.owner}</span>
                        <span className="text-zinc-700">•</span>
                        <span>DUE {task.deadline}</span>
                      </div>
                    </div>
                    <span className={`text-[10px] font-mono font-bold px-3 py-1 rounded border ${
                      task.priority === "High" ? "text-red-400 border-red-500/30 bg-red-500/10" :
                      task.priority === "Medium" ? "text-amber-400 border-amber-500/30 bg-amber-500/10" :
                      "text-zinc-400 border-zinc-500/30 bg-white/5"
                    }`}>
                      {task.priority}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Extracted Decisions */}
            {extractedData && (extractedData.decisions?.length ?? 0) > 0 && (
              <div className="glass-surface p-8 rounded-[24px] border border-white/5">
                <h3 className="text-[11px] font-mono font-bold text-zinc-500 tracking-[0.2em] mb-6">DECISIONS LOGGED ({extractedData.decisions?.length ?? 0})</h3>
                <div className="space-y-4">
                  {extractedData.decisions?.map?.((dec, i) => (
                    <div key={i} className="bg-black/30 p-4 rounded-xl border border-white/5">
                      <p className="text-sm text-zinc-400 mb-1 font-light">{dec.context}</p>
                      <p className="text-[15px] text-white font-medium">→ {dec.outcome}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Confirm / Discard */}
            <div className="flex gap-4">
              <button 
                onClick={handleConfirmAndSave}
                className="flex-1 h-14 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-2xl flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] tracking-wide"
              >
                <CheckCircle2 className="w-5 h-5" />
                Confirm & Push to Pipeline
              </button>
              <button 
                onClick={handleReset}
                className="px-8 h-14 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-2xl font-medium transition-all tracking-wide"
              >
                Discard
              </button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
