import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import logoWhite from "@/assets/logo-white.png";

export function Intro() {
  const [show, setShow] = useState(true);

  useEffect(() => {
    if (!show) return;
    const t = setTimeout(() => setShow(false), 3000);
    return () => clearTimeout(t);
  }, [show]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.6 } }}
        >
          {/* radial glow accents */}
          <div className="pointer-events-none absolute inset-0 opacity-40">
            <div className="absolute top-1/4 left-1/3 h-96 w-96 rounded-full bg-primary/30 blur-[120px]" />
            <div className="absolute bottom-1/4 right-1/3 h-96 w-96 rounded-full bg-blue-500/20 blur-[120px]" />
          </div>

          <motion.div
            className="relative flex flex-col items-center gap-6"
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* circular logo with glowing ring */}
            <motion.div
              className="relative"
              initial={{ rotate: -15, scale: 0.5 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="absolute -inset-3 rounded-full bg-gradient-primary opacity-60 blur-2xl animate-pulse" />
              <div className="relative h-36 w-36 rounded-full overflow-hidden ring-4 ring-white/20 bg-white/5 backdrop-blur-sm flex items-center justify-center">
                <img
                  src={logoWhite}
                  alt="RDV logo"
                  className="h-full w-full object-cover scale-110"
                />
              </div>
            </motion.div>

            <div className="overflow-hidden">
              <motion.h1
                className="text-5xl md:text-7xl font-bold tracking-tight text-white"
                initial={{ y: 80, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              >
                R D V <span className="text-white">Prasad</span>
              </motion.h1>
            </div>

            <motion.p
              className="text-sm uppercase tracking-[0.4em] text-white/60"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.6 }}
            >
              Portfolio
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
