import { ReactNode } from "react";
import { motion } from "framer-motion";

interface PageWrapperProps {
  children: ReactNode;
  title: string;
  description?: string;
  maxWidth?: "full" | "7xl" | "6xl" | "5xl";
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.3,
    },
  },
};

export function PageWrapper({
  children,
  title,
  description,
  maxWidth = "full",
}: PageWrapperProps) {
  const maxWidthClass = {
    full: "max-w-full",
    "7xl": "max-w-7xl",
    "6xl": "max-w-6xl",
    "5xl": "max-w-5xl",
  }[maxWidth];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={`${maxWidthClass} mx-auto`}
    >
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          {title}
        </h1>
        {description && (
          <p className="text-muted-foreground mt-2 text-lg">{description}</p>
        )}
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}
