"use client";

import { motion, useReducedMotion } from "framer-motion";

const orbitTransition = (duration: number) => ({
  duration,
  repeat: Number.POSITIVE_INFINITY,
  repeatType: "mirror" as const,
  ease: "easeInOut" as const,
});

export function AmbientMotionLayer() {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return (
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
      >
        <div className="hero-vignette absolute inset-0" />
        <div className="hero-lattice absolute inset-0 opacity-40" />
        <div className="hero-orb absolute left-[8%] top-[12%] h-64 w-64 bg-[rgba(138,34,48,0.16)]" />
        <div className="hero-orb absolute bottom-[10%] right-[10%] h-72 w-72 bg-[rgba(183,138,76,0.2)]" />
      </div>
    );
  }

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0">
      <div className="hero-vignette absolute inset-0" />
      <div className="hero-lattice absolute inset-0 opacity-50" />

      <motion.div
        className="hero-orb absolute left-[5%] top-[8%] h-72 w-72 bg-[rgba(138,34,48,0.18)]"
        animate={{
          x: [0, 26, -18, 0],
          y: [0, -18, 20, 0],
          scale: [1, 1.06, 0.98, 1],
        }}
        transition={orbitTransition(26)}
      />

      <motion.div
        className="hero-orb absolute right-[9%] top-[18%] h-80 w-80 bg-[rgba(183,138,76,0.2)]"
        animate={{
          x: [0, -22, 14, 0],
          y: [0, 16, -14, 0],
          scale: [1, 0.96, 1.08, 1],
        }}
        transition={orbitTransition(30)}
      />

      <motion.div
        className="hero-orb absolute bottom-[8%] left-[28%] h-64 w-64 bg-[rgba(255,255,255,0.24)]"
        animate={{
          x: [0, -18, 24, 0],
          y: [0, 12, -18, 0],
          scale: [1, 1.04, 0.94, 1],
        }}
        transition={orbitTransition(24)}
      />

      <motion.div
        className="hero-orb absolute bottom-[4%] right-[18%] h-56 w-56 bg-[rgba(104,42,30,0.12)]"
        animate={{
          x: [0, 20, -12, 0],
          y: [0, -12, 16, 0],
          scale: [1, 1.03, 0.97, 1],
        }}
        transition={orbitTransition(28)}
      />

      <motion.div
        className="hero-sheen absolute inset-y-[-20%] left-[-25%] w-[40%]"
        animate={{ x: ["0%", "240%"] }}
        transition={{
          duration: 18,
          repeat: Number.POSITIVE_INFINITY,
          repeatDelay: 3,
          ease: "linear",
        }}
      />
    </div>
  );
}
