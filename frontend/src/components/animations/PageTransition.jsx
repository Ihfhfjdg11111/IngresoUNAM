import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";

export const PageTransition = ({ children }) => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ 
          duration: 0.4, 
          ease: [0.25, 0.1, 0.25, 1] 
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

export const SlideTransition = ({ children, direction = "right" }) => {
  const directions = {
    right: { x: 100, opacity: 0 },
    left: { x: -100, opacity: 0 },
    up: { y: 100, opacity: 0 },
    down: { y: -100, opacity: 0 }
  };

  return (
    <motion.div
      initial={directions[direction]}
      animate={{ x: 0, y: 0, opacity: 1 }}
      exit={directions[direction === "right" ? "left" : "right"]}
      transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {children}
    </motion.div>
  );
};

export const FadeTransition = ({ children }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
};
