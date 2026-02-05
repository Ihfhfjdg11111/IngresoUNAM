import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

export const ModernCard = ({ 
  children, 
  className = "",
  hover = true,
  glow = false,
  dark = false,
  onClick
}) => {
  return (
    <motion.div
      onClick={onClick}
      className={cn(
        "relative overflow-hidden rounded-2xl backdrop-blur-xl border transition-all duration-300",
        dark 
          ? "bg-[#0A2540]/80 border-white/10 text-white" 
          : "bg-white/80 border-white/50 text-[#0A2540]",
        hover && "cursor-pointer",
        className
      )}
      whileHover={hover ? { 
        y: -8, 
        boxShadow: glow 
          ? "0 0 40px rgba(242, 183, 5, 0.3), 0 20px 40px rgba(10, 37, 64, 0.15)"
          : "0 20px 40px rgba(10, 37, 64, 0.15)"
      } : {}}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      {/* Gradient overlay */}
      <div className={cn(
        "absolute inset-0 opacity-0 transition-opacity duration-300",
        hover && "group-hover:opacity-100"
      )}>
        <div className={cn(
          "absolute inset-0",
          dark 
            ? "bg-gradient-to-br from-white/5 to-transparent" 
            : "bg-gradient-to-br from-[#F2B705]/5 to-transparent"
        )} />
      </div>
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
};

export const StatCard = ({ 
  title, 
  value, 
  subtitle,
  icon: Icon,
  color = "blue",
  trend = null
}) => {
  const colors = {
    blue: "from-blue-500/20 to-blue-600/5",
    green: "from-green-500/20 to-green-600/5",
    yellow: "from-yellow-500/20 to-yellow-600/5",
    red: "from-red-500/20 to-red-600/5",
    purple: "from-purple-500/20 to-purple-600/5"
  };

  return (
    <motion.div
      className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 p-6"
      whileHover={{ y: -4, boxShadow: "0 20px 40px rgba(10, 37, 64, 0.1)" }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      {/* Background gradient */}
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${colors[color]} rounded-full blur-3xl opacity-60 -translate-y-1/2 translate-x-1/2`} />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-xl bg-gradient-to-br ${colors[color]}`}>
            {Icon && <Icon className="w-6 h-6 text-[#0A2540] dark:text-white" />}
          </div>
          {trend !== null && (
            <span className={`text-sm font-medium ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {trend >= 0 ? '+' : ''}{trend}%
            </span>
          )}
        </div>
        
        <h3 className="text-3xl font-bold text-[#0A2540] dark:text-white mb-1">{value}</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">{title}</p>
        {subtitle && <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{subtitle}</p>}
      </div>
    </motion.div>
  );
};

export const GlassCard = ({ 
  children, 
  className = "",
  intensity = "medium"
}) => {
  const intensities = {
    light: "bg-white/40",
    medium: "bg-white/60",
    heavy: "bg-white/80"
  };

  return (
    <div className={cn(
      "relative rounded-2xl backdrop-blur-xl border border-white/50 shadow-lg",
      intensities[intensity],
      className
    )}>
      {children}
    </div>
  );
};
