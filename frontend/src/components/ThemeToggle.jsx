import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export const ThemeToggle = ({ className = '', collapsed = false }) => {
  const { toggleTheme, isDark } = useTheme();

  // Tamaños más pequeños cuando está colapsado
  const width = collapsed ? 'w-14' : 'w-14';
  const height = collapsed ? 'h-7' : 'h-8';
  const knobSize = collapsed ? 'w-5 h-5' : 'w-6 h-6';
  const translateX = collapsed ? 18 : 24;
  const iconSize = collapsed ? 'w-3 h-3' : 'w-3.5 h-3.5';

  return (
    <motion.button
      onClick={toggleTheme}
      className={`relative ${width} ${height} rounded-full ${collapsed ? 'p-0.5' : 'p-1'} transition-colors duration-300 ${
        isDark 
          ? 'bg-slate-700 border border-slate-600' 
          : 'bg-slate-200 border border-slate-300'
      } ${className}`}
      whileTap={{ scale: 0.95 }}
      whileHover={{ scale: 1.05 }}
      title={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
    >
      <motion.div
        className={`${knobSize} rounded-full flex items-center justify-center shadow-md ${
          isDark ? 'bg-slate-600' : 'bg-white'
        }`}
        initial={false}
        animate={{
          x: isDark ? translateX : 0,
        }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        layout
      >
        {isDark ? (
          <Moon className={`${iconSize} text-slate-300`} />
        ) : (
          <Sun className={`${iconSize} text-slate-600`} />
        )}
      </motion.div>
    </motion.button>
  );
};

export default ThemeToggle;
