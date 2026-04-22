import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { useTheme } from "@/hooks/useTheme";
import logoWhite from "@/assets/logo-white.png";
import logoBlack from "@/assets/logo-black.png";

export function Intro() {
  const { theme } = useTheme();
  const [show, setShow] = useState(() => !sessionStorage.getItem("rdv-intro-seen"));

  useEffect(() => {
    if (!show) return;
    const t = setTimeout(() => {
      setShow(false);
      sessionStorage.setItem("rdv-intro-seen", "1");
    }, 2200);
    return () => clearTimeout(t);
  }, [show]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-background"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.5 } }}
        >
          <div className="absolute inset-0 bg-gradient-glow opacity-60" />
          <motion.div
            className="relative flex flex-col items-center gap-6"
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.img
              src={theme === "dark" ? logoWhite : logoBlack}
              alt="RDV.Dev logo"
              className="h-24 w-24 object-contain drop-shadow-glow"
              initial={{ rotate: -20, scale: 0.5 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            />
            <div className="overflow-hidden">
              <motion.h1
                className="text-5xl md:text-6xl font-bold tracking-tight gradient-text"
                initial={{ y: 60, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              >
                RDV.Dev
              </motion.h1>
            </div>
            <motion.p
              className="text-sm uppercase tracking-[0.3em] text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9, duration: 0.6 }}
            >
              The Living Portfolio
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
