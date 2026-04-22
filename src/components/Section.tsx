import { motion } from "framer-motion";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Section({
  id,
  title,
  eyebrow,
  description,
  children,
  className,
}: {
  id?: string;
  title?: string;
  eyebrow?: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={cn("container py-16 md:py-24", className)}>
      {(eyebrow || title || description) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mb-10 max-w-2xl"
        >
          {eyebrow && (
            <p className="text-xs uppercase tracking-[0.2em] text-primary font-semibold mb-2">{eyebrow}</p>
          )}
          {title && <h2 className="text-3xl md:text-4xl font-bold tracking-tight">{title}</h2>}
          {description && <p className="mt-3 text-muted-foreground">{description}</p>}
        </motion.div>
      )}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.div>
    </section>
  );
}
