"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Settings, Shield, Key, Bell, CreditCard, ChevronRight, Check, Bot, Eye, EyeOff } from "lucide-react";
import { useState, useEffect } from "react";
import { getApiKey, setApiKey, hasApiKey } from "@/lib/ai";
import { Modal } from "@/components/Modal";

export default function SettingsPage() {
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [isKeySaved, setIsKeySaved] = useState(false);
  const [hasKey, setHasKey] = useState(false);
  const [savedToast, setSavedToast] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  // Notification settings
  const [notifSlack, setNotifSlack] = useState(true);
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifTaskComplete, setNotifTaskComplete] = useState(true);

  useEffect(() => {
    const existing = getApiKey();
    if (existing) {
      setApiKeyInput(existing);
      setHasKey(true);
      setIsKeySaved(true);
    }
  }, []);

  const handleSaveApiKey = () => {
    if (apiKeyInput.trim()) {
      setApiKey(apiKeyInput.trim());
      setIsKeySaved(true);
      setHasKey(true);
    }
  };

  const [demoMode, setDemoModeState] = useState(false);
  useEffect(() => {
    const { isDemoMode } = require("@/lib/ai");
    setDemoModeState(isDemoMode());
  }, []);

  const handleToggleDemo = () => {
    const { setDemoMode } = require("@/lib/ai");
    const newVal = !demoMode;
    setDemoMode(newVal);
    setDemoModeState(newVal);
  };

  const handleSaveAll = () => {
    if (apiKeyInput.trim()) {
      setApiKey(apiKeyInput.trim());
      setIsKeySaved(true);
      setHasKey(true);
    }
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 3000);
  };

  const containerVars = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVars = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <div className="h-full flex flex-col pt-12 px-12 relative z-10 w-full max-w-4xl mx-auto mb-20 overflow-y-auto scrollbar-hide">
      <motion.header variants={itemVars} initial="hidden" animate="show" className="mb-14 pb-6 border-b border-white/5">
        <h1 className="text-3xl font-semibold tracking-wide text-white mb-2">System Settings</h1>
        <p className="text-[15px] font-light text-zinc-400">Configure your agentic infrastructure and access controls.</p>
      </motion.header>

      <motion.div variants={containerVars} initial="hidden" animate="show" className="space-y-4">
        
        {/* AI Configuration - THE MOST IMPORTANT SECTION */}
        <motion.div variants={itemVars} className="glass-surface p-8 rounded-[20px] border border-blue-500/20 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-indigo-600" />
          
          <div className="flex items-center gap-6 mb-6">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <Bot className="w-6 h-6 text-blue-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-medium text-white mb-1">AI Configuration</h3>
              <p className="text-sm text-zinc-500 font-light tracking-wide">Connect your Google Gemini API key to enable agentic AI features</p>
            </div>
            {hasKey && (
              <div className="flex items-center gap-2 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-mono font-bold text-emerald-400 tracking-widest uppercase">Connected</span>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-mono font-bold text-zinc-500 tracking-[0.2em] mb-2 uppercase">Gemini API Key</label>
              <div className="relative">
                <input 
                  type={showKey ? "text" : "password"} 
                  value={apiKeyInput}
                  onChange={(e) => { setApiKeyInput(e.target.value); setIsKeySaved(false); }}
                  placeholder="AIza..." 
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500/50 font-mono text-sm pr-24"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-2">
                  <button 
                    onClick={() => setShowKey(!showKey)}
                    className="p-2 text-zinc-500 hover:text-white transition-colors"
                  >
                    {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button 
                    onClick={handleSaveApiKey}
                    disabled={!apiKeyInput.trim() || isKeySaved}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                      isKeySaved ? "bg-emerald-500/20 text-emerald-400" : "bg-blue-600 text-white hover:bg-blue-500"
                    }`}
                  >
                    {isKeySaved ? <Check className="w-3 h-3" /> : "Save"}
                  </button>
                </div>
              </div>
              <p className="text-[11px] text-zinc-600 mt-2 font-light">
                Get a free key at <span className="text-blue-400">aistudio.google.com/apikey</span> — Free tier: 15 requests/min
              </p>
            </div>

            <div className="pt-4 border-t border-white/5 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-white mb-1">Presentation Mode (Demo)</h4>
                <p className="text-[11px] text-zinc-500 font-light lowercase">Use synthetic AI if quota is exceeded or offline</p>
              </div>
              <button 
                onClick={handleToggleDemo}
                className={`w-12 h-6 rounded-full transition-all relative ${
                  demoMode ? "bg-amber-600 shadow-[0_0_10px_rgba(217,119,6,0.5)]" : "bg-zinc-700"
                }`}
              >
                <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all ${
                  demoMode ? "left-6" : "left-0.5"
                }`} />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Notifications */}
        <motion.div 
          variants={itemVars} 
          className="glass-surface p-6 rounded-[20px] border border-white/5 hover:border-blue-500/30 hover:bg-black/40 transition-all cursor-pointer"
          onClick={() => setActiveSection(activeSection === "notifications" ? null : "notifications")}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                <Bell className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-white mb-1">Notifications</h3>
                <p className="text-sm text-zinc-500 font-light tracking-wide">Configure alerting and slack webhooks</p>
              </div>
            </div>
            <ChevronRight className={`w-5 h-5 text-zinc-600 transition-transform ${activeSection === "notifications" ? "rotate-90" : ""}`} />
          </div>

          <AnimatePresence>
            {activeSection === "notifications" && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }} 
                animate={{ height: "auto", opacity: 1 }} 
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
                onClick={e => e.stopPropagation()}
              >
                <div className="pt-6 mt-6 border-t border-white/5 space-y-4">
                  {[
                    { label: "Slack Notifications", value: notifSlack, setter: setNotifSlack },
                    { label: "Email Notifications", value: notifEmail, setter: setNotifEmail },
                    { label: "Task Completion Alerts", value: notifTaskComplete, setter: setNotifTaskComplete },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between">
                      <span className="text-sm text-zinc-300">{item.label}</span>
                      <button 
                        onClick={() => item.setter(!item.value)}
                        className={`w-12 h-6 rounded-full transition-all relative ${
                          item.value ? "bg-blue-600" : "bg-zinc-700"
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all ${
                          item.value ? "left-6" : "left-0.5"
                        }`} />
                      </button>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Other sections (visual) */}
        {[
          { title: "Security & Access", icon: Shield, desc: "Manage SSO, 2FA, and Audit Logs" },
          { title: "API Keys", icon: Key, desc: "Neural Engine programmatic access tokens" },
          { title: "Billing & Context Limit", icon: CreditCard, desc: "Manage GPU hours and token capacity" },
        ].map((sec, i) => (
          <motion.div 
            key={i} variants={itemVars} 
            className="glass-surface p-6 rounded-[20px] border border-white/5 flex items-center justify-between group hover:border-blue-500/30 hover:bg-black/40 transition-all cursor-pointer"
          >
            <div className="flex items-center gap-6">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center group-hover:scale-105 transition-transform">
                <sec.icon className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-white mb-1 group-hover:text-blue-400 transition-colors">{sec.title}</h3>
                <p className="text-sm text-zinc-500 font-light tracking-wide">{sec.desc}</p>
              </div>
            </div>
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-zinc-600 group-hover:text-white group-hover:translate-x-1 transition-all">
              <ChevronRight className="w-5 h-5" />
            </div>
          </motion.div>
        ))}
        
        {/* Save Bar */}
        <motion.div variants={itemVars} className="mt-12 flex items-center justify-between">
          <AnimatePresence>
            {savedToast && (
              <motion.div 
                initial={{ opacity: 0, x: -20 }} 
                animate={{ opacity: 1, x: 0 }} 
                exit={{ opacity: 0, x: -20 }}
                className="flex items-center gap-2 text-emerald-400 text-sm"
              >
                <Check className="w-4 h-4" />
                Configuration saved successfully
              </motion.div>
            )}
          </AnimatePresence>
          <div className="ml-auto">
            <button 
              onClick={handleSaveAll}
              className="bg-blue-600 hover:bg-blue-500 transition-all text-white font-medium px-8 py-3.5 rounded-full shadow-[0_0_20px_rgba(37,99,235,0.3)] tracking-wide"
            >
              Save Configuration
            </button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
