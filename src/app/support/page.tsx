"use client";

import { motion } from "framer-motion";
import { HelpCircle, MessageSquare, BookOpen, ExternalLink, Send, X, Check } from "lucide-react";
import { useState } from "react";
import { Modal } from "@/components/Modal";

export default function SupportPage() {
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketBody, setTicketBody] = useState("");
  const [ticketSubmitted, setTicketSubmitted] = useState(false);

  const handleSubmitTicket = () => {
    if (!ticketSubject.trim() || !ticketBody.trim()) return;
    // Simulate ticket submission
    setTicketSubmitted(true);
    setTimeout(() => {
      setIsTicketModalOpen(false);
      setTicketSubmitted(false);
      setTicketSubject("");
      setTicketBody("");
    }, 2000);
  };

  const containerVars = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.15 } }
  };

  const itemVars = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const faqs = [
    { q: "How do I get a Gemini API key?", a: "Go to aistudio.google.com/apikey and create a free key. Add it in Settings → AI Configuration." },
    { q: "How does task extraction work?", a: "Go to Meetings, paste your meeting transcript, and click 'Extract with AI'. Gemini will parse tasks and decisions automatically." },
    { q: "Can employees see all tasks?", a: "No. Employees only see tasks assigned to them. Managers see everything." },
    { q: "How do I add a team member?", a: "Go to Team → Add Team Member. They can log in using their email address." },
  ];

  return (
    <div className="h-full flex flex-col pt-12 px-12 relative z-10 w-full max-w-5xl mx-auto mb-20 overflow-y-auto scrollbar-hide">
      <motion.header variants={itemVars} initial="hidden" animate="show" className="mb-14 pb-6 border-b border-white/5 flex items-center gap-5">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-blue-500/20 border border-blue-500/30 flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.2)]">
           <HelpCircle className="w-7 h-7 text-blue-400" />
        </div>
        <div>
          <h1 className="text-3xl font-semibold tracking-wide text-white mb-2">Help & Support</h1>
          <p className="text-[15px] font-light text-zinc-400">Access documentation or connect with CortexFlow engineering.</p>
        </div>
      </motion.header>

      <motion.div variants={containerVars} initial="hidden" animate="show" className="space-y-10">
        
        {/* Action cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Support Ticket Card */}
          <motion.div variants={itemVars} className="glass-surface p-10 rounded-[24px] border border-white/10 hover:shadow-2xl transition-all relative overflow-hidden group">
             <div className="absolute top-0 left-0 w-full h-1 bg-blue-500 opacity-50 group-hover:opacity-100 transition-opacity" />
             <MessageSquare className="w-8 h-8 text-white mb-6" />
             <h3 className="text-xl font-medium text-white mb-3">Priority Support</h3>
             <p className="text-zinc-400 font-light leading-relaxed mb-10">
               Open a direct conduit to our Tier-2 engineering team for critical infrastructure issues or model hallucination reports.
             </p>
             <button 
               onClick={() => setIsTicketModalOpen(true)}
               className="bg-white text-black font-semibold tracking-wide px-6 py-3 rounded-xl hover:bg-zinc-200 transition-colors shadow-[0_0_15px_rgba(255,255,255,0.1)]"
             >
               Open Ticket
             </button>
          </motion.div>

          {/* Documentation Card */}
          <motion.div variants={itemVars} className="glass-surface p-10 rounded-[24px] border border-white/10 hover:shadow-2xl transition-all relative overflow-hidden group">
             <BookOpen className="w-8 h-8 text-white mb-6" />
             <h3 className="text-xl font-medium text-white mb-3">API Documentation</h3>
             <p className="text-zinc-400 font-light leading-relaxed mb-10">
               Review our REST structure, webhook payloads, and best practices for integrating the CortexFlow agentic pipeline into your stack.
             </p>
             <a 
               href="https://ai.google.dev/gemini-api/docs" 
               target="_blank" 
               rel="noopener noreferrer"
               className="inline-flex items-center gap-3 bg-[#111] border border-white/10 hover:bg-white/5 text-white font-semibold tracking-wide px-6 py-3 rounded-xl transition-all"
             >
               Read the Docs <ExternalLink className="w-4 h-4" />
             </a>
          </motion.div>
        </div>

        {/* FAQ Section */}
        <motion.div variants={itemVars} className="glass-surface p-10 rounded-[24px] border border-white/5">
          <h2 className="text-xl font-semibold text-white mb-8 tracking-wide">Frequently Asked Questions</h2>
          <div className="space-y-6">
            {faqs.map((faq, i) => (
              <div key={i} className="border-b border-white/5 pb-6 last:border-0 last:pb-0">
                <h3 className="text-[15px] font-medium text-white mb-2">{faq.q}</h3>
                <p className="text-[14px] text-zinc-400 font-light leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </motion.div>

      </motion.div>

      {/* Ticket Modal */}
      <Modal isOpen={isTicketModalOpen} onClose={() => setIsTicketModalOpen(false)} title="Open Support Ticket">
        {ticketSubmitted ? (
          <div className="flex flex-col items-center justify-center py-8 gap-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
              <Check className="w-8 h-8 text-emerald-400" />
            </div>
            <p className="text-white font-medium">Ticket Submitted!</p>
            <p className="text-zinc-500 text-sm font-light text-center">Our engineering team will respond within 24 hours.</p>
          </div>
        ) : (
          <div className="space-y-5">
            <div>
              <label className="block text-[10px] font-mono text-zinc-500 tracking-[0.2em] mb-2 uppercase">Subject</label>
              <input 
                type="text"
                value={ticketSubject}
                onChange={(e) => setTicketSubject(e.target.value)}
                placeholder="e.g. AI extraction not working"
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500/50"
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono text-zinc-500 tracking-[0.2em] mb-2 uppercase">Description</label>
              <textarea
                value={ticketBody}
                onChange={(e) => setTicketBody(e.target.value)}
                placeholder="Describe the issue in detail..."
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500/50 min-h-[120px] resize-none font-light"
              />
            </div>
            <button
              onClick={handleSubmitTicket}
              disabled={!ticketSubject.trim() || !ticketBody.trim()}
              className={`w-full py-3.5 rounded-xl font-medium transition-all flex items-center justify-center gap-2 tracking-wide ${
                ticketSubject.trim() && ticketBody.trim()
                  ? "bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_15px_rgba(37,99,235,0.3)]"
                  : "bg-white/5 text-zinc-600 cursor-not-allowed"
              }`}
            >
              <Send className="w-4 h-4" /> Submit Ticket
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
}
