import { useState, useEffect, useContext } from "react";
import { motion } from "framer-motion";
import { Crown, BookOpen, Calculator, AlertCircle } from "lucide-react";
import { AuthContext, API } from "../App";

export const UserLimits = () => {
  const { user } = useContext(AuthContext);
  const [limits, setLimits] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLimits();
  }, []);

  const fetchLimits = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API}/user/limits`, {
        headers: { "Authorization": `Bearer ${token}` },
        credentials: "include"
      });

      if (response.ok) {
        const data = await response.json();
        setLimits(data);
      }
    } catch (error) {
      console.error("Error fetching limits:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm animate-pulse">
        <div className="h-4 bg-slate-200 rounded w-1/2 mb-2"></div>
        <div className="h-8 bg-slate-200 rounded w-1/4"></div>
      </div>
    );
  }

  if (!limits) return null;

  // Premium users see a simple message
  if (limits.is_premium) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-purple-50 to-amber-50 dark:from-purple-900/20 dark:to-amber-900/20 rounded-xl p-4 border border-purple-200 dark:border-purple-800/50"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
            <Crown className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <p className="font-medium text-purple-900 dark:text-purple-200">Plan Premium Activo</p>
            <p className="text-sm text-purple-700 dark:text-purple-300">Acceso ilimitado a todos los simulacros y prácticas</p>
          </div>
        </div>
      </motion.div>
    );
  }

  // Free users see detailed limits
  const { simulators, practice } = limits;
  const totalRemaining = simulators.total_remaining;
  const practiceRemaining = practice.attempts_remaining;
  const questionsRemaining = practice.questions_remaining;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700"
    >
      <div className="flex items-center gap-2 mb-4">
        <AlertCircle className="w-5 h-5 text-amber-500" />
        <h3 className="font-medium text-[#0A2540] dark:text-white">Tu Plan Gratuito</h3>
        <span className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded">Gratis</span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Simulators */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <Calculator className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-900 dark:text-blue-200">Simulacros</span>
          </div>
          <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
            {totalRemaining}
            <span className="text-sm font-normal text-blue-500 dark:text-blue-400 ml-1">restantes</span>
          </p>
          <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
            {simulators.per_area.limit_per_area} por área • {simulators.total_limit} total
          </p>
        </div>

        {/* Practice */}
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-green-900 dark:text-green-200">Práctica Hoy</span>
          </div>
          <p className="text-2xl font-bold text-green-700 dark:text-green-300">
            {practiceRemaining}
            <span className="text-sm font-normal text-green-500 dark:text-green-400 ml-1">sesiones</span>
          </p>
          <p className="text-xs text-green-600 dark:text-green-400 mt-1">
            {questionsRemaining} preguntas restantes
          </p>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700">
        <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
          <Crown className="w-3 h-3 inline mr-1" />
          <a href="/plans" className="text-[#F2B705] hover:underline">Actualiza a Premium</a> para acceso ilimitado
        </p>
      </div>
    </motion.div>
  );
};

export default UserLimits;
