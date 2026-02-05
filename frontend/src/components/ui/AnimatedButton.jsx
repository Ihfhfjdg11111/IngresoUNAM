import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

export const AnimatedButton = ({ 
  children, 
  variant = "primary",
  size = "md",
  className = "",
  onClick,
  disabled = false,
  loading = false,
  icon: Icon = null
}) => {
  const variants = {
    primary: "bg-gradient-to-r from-[#0A2540] to-[#0d2f4f] text-white hover:shadow-lg hover:shadow-[#0A2540]/25",
    secondary: "bg-gradient-to-r from-[#F2B705] to-[#FFD54F] text-[#0A2540] hover:shadow-lg hover:shadow-[#F2B705]/25",
    outline: "border-2 border-[#0A2540] text-[#0A2540] hover:bg-[#0A2540] hover:text-white",
    ghost: "text-[#0A2540] hover:bg-[#0A2540]/5",
    danger: "bg-gradient-to-r from-red-500 to-red-600 text-white hover:shadow-lg hover:shadow-red-500/25"
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg"
  };

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        "relative inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all overflow-hidden",
        variants[variant],
        sizes[size],
        (disabled || loading) && "opacity-50 cursor-not-allowed",
        className
      )}
      whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      {/* Shine effect */}
      {!disabled && !loading && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full"
          whileHover={{ translateX: "100%" }}
          transition={{ duration: 0.6 }}
        />
      )}
      
      {/* Loading spinner */}
      {loading && (
        <motion.div
          className="w-5 h-5 border-2 border-current border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      )}
      
      {/* Icon */}
      {Icon && !loading && <Icon className="w-5 h-5" />}
      
      {/* Text */}
      <span className="relative z-10">{children}</span>
    </motion.button>
  );
};

export const GlowButton = ({ 
  children, 
  className = "",
  glowColor = "#F2B705",
  ...props 
}) => {
  return (
    <motion.button
      className={cn(
        "relative px-8 py-4 bg-[#0A2540] text-white rounded-xl font-bold overflow-hidden",
        className
      )}
      whileHover={{ 
        boxShadow: `0 0 30px ${glowColor}80, 0 0 60px ${glowColor}40`,
      }}
      whileTap={{ scale: 0.98 }}
      {...props}
    >
      {/* Animated gradient background */}
      <motion.div
        className="absolute inset-0 opacity-0"
        style={{
          background: `linear-gradient(90deg, transparent, ${glowColor}30, transparent)`,
        }}
        whileHover={{ opacity: 1, x: ["-100%", "100%"] }}
        transition={{ duration: 0.8 }}
      />
      
      <span className="relative z-10">{children}</span>
    </motion.button>
  );
};
