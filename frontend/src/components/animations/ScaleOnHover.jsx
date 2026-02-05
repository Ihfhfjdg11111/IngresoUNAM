import { motion } from "framer-motion";

export const ScaleOnHover = ({ 
  children, 
  scale = 1.05,
  className = "",
  whileTap = 0.98
}) => {
  return (
    <motion.div
      whileHover={{ scale }}
      whileTap={{ scale: whileTap }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export const LiftOnHover = ({ 
  children, 
  y = -8,
  className = "" 
}) => {
  return (
    <motion.div
      whileHover={{ y, boxShadow: "0 20px 40px rgba(10, 37, 64, 0.15)" }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export const GlowOnHover = ({ 
  children, 
  className = "",
  glowColor = "rgba(242, 183, 5, 0.5)"
}) => {
  return (
    <motion.div
      whileHover={{ 
        boxShadow: `0 0 30px ${glowColor}, 0 0 60px ${glowColor}`,
      }}
      transition={{ duration: 0.3 }}
      className={className}
    >
      {children}
    </motion.div>
  );
};
