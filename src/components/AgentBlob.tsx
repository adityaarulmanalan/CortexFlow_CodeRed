"use client";

import { motion } from "framer-motion";

export function AgentBlob() {
  return (
    <div className="relative w-32 h-32 flex items-center justify-center">
      {/* Outer Pulse Rings */}
      {[1, 2, 3].map((i) => (
        <motion.div
          key={i}
          className="absolute inset-0 rounded-full border border-blue-500/20"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{
            scale: [0.8, 1.5],
            opacity: [0, 0.5, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            delay: i * 1,
            ease: "linear",
          }}
        />
      ))}

      {/* Main Core Orb */}
      <motion.div
        className="relative w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 shadow-[0_0_40px_rgba(37,99,235,0.6)] flex items-center justify-center overflow-hidden"
        animate={{
          scale: [1, 1.05, 1],
          boxShadow: [
            "0_0_40px_rgba(37,99,235,0.6)",
            "0_0_60px_rgba(37,99,235,0.8)",
            "0_0_40px_rgba(37,99,235,0.6)",
          ],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        {/* Swirling Inner Plasma Effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-50"
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "linear",
          }}
        />
        
        {/* Animated Soundwave / Voice Indicator */}
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4].map((i) => (
            <motion.div
              key={i}
              className="w-1 bg-white rounded-full"
              animate={{
                height: [4, 12, 4],
              }}
              transition={{
                duration: 0.5 + (i * 0.1),
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}
