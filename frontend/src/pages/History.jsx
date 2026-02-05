import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  History as HistoryIcon, Clock, Target, CheckCircle, 
  ArrowLeft, ChevronRight, Calendar, TrendingUp,
  Award, Zap
} from "lucide-react";
import { Button } from "../components/ui/button";
import { AuthContext, API } from "../App";
import Sidebar from "../components/Sidebar";
import { FadeIn, AnimatedCounter } from "../components";

const History = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await fetch(`${API}/attempts`, {
        headers: { "Authorization": `Bearer ${token}` },
        credentials: "include"
      });

      if (response.ok) {
        const data = await response.json();
        setAttempts(data);
      }
    } catch (error) {
      // Error silenciado
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score, total) => {
    const percentage = (score / total) * 100;
    if (percentage >= 80) return "text-[#10B981]";
    if (percentage >= 60) return "text-[#F2B705]";
    if (percentage >= 40) return "text-[#F59E0B]";
    return "text-[#EF4444]";
  };

  const getScoreBgColor = (score, total) => {
    const percentage = (score / total) * 100;
    if (percentage >= 80) return "bg-green-50 border-green-200";
    if (percentage >= 60) return "bg-amber-50 border-amber-200";
    if (percentage >= 40) return "bg-orange-50 border-orange-200";
    return "bg-red-50 border-red-200";
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("es-MX", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F7FA] dark:bg-slate-900 flex items-center justify-center">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-[#0A2540] dark:border-slate-600 border-t-[#F2B705] rounded-full"
        />
      </div>
    );
  }

  const completedAttempts = attempts.filter(a => a.status === "completed");
  const inProgressAttempts = attempts.filter(a => a.status === "in_progress");
  const bestScore = Math.max(...completedAttempts.map(a => a.score || 0), 0);
  const averageScore = completedAttempts.length > 0 
    ? Math.round(completedAttempts.reduce((acc, a) => acc + (a.score || 0), 0) / completedAttempts.length)
    : 0;

  return (
    <div className="min-h-screen bg-[#F5F7FA] dark:bg-slate-900 transition-colors duration-300">
      <Sidebar />
      <div className="lg:ml-64 min-h-screen">
        <main className="p-6 md:p-8">
          {/* Mobile Header */}
          <div className="lg:hidden flex items-center gap-4 mb-6">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-bold text-[#0A2540] dark:text-white">Historial</h1>
          </div>

          {/* Header */}
          <FadeIn>
            <div className="mb-8">
              <h1 className="text-2xl md:text-3xl font-bold text-[#0A2540] dark:text-white font-[Poppins] hidden lg:block">
                Historial de Intentos
              </h1>
              <p className="text-[#4A5568] dark:text-slate-400 mt-1">
                Revisa tus intentos anteriores y analiza tu progreso.
              </p>
            </div>
          </FadeIn>

          {/* Stats Summary */}
          {attempts.length > 0 && (
            <FadeIn delay={0.1}>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <motion.div 
                  className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-100 dark:border-slate-700"
                  whileHover={{ y: -4, scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-blue-50 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                    </div>
                    <p className="text-sm text-[#4A5568] dark:text-slate-400">Total Intentos</p>
                  </div>
                  <p className="text-2xl font-bold text-[#0A2540] dark:text-white">
                    <AnimatedCounter end={completedAttempts.length} duration={1} />
                  </p>
                </motion.div>

                <motion.div 
                  className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-100 dark:border-slate-700"
                  whileHover={{ y: -4, scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-amber-50 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
                      <Clock className="w-4 h-4 text-amber-500" />
                    </div>
                    <p className="text-sm text-[#4A5568] dark:text-slate-400">En Progreso</p>
                  </div>
                  <p className="text-2xl font-bold text-[#F59E0B]">
                    <AnimatedCounter end={inProgressAttempts.length} duration={1} />
                  </p>
                </motion.div>

                <motion.div 
                  className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-100 dark:border-slate-700"
                  whileHover={{ y: -4, scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-green-50 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                      <Award className="w-4 h-4 text-green-500" />
                    </div>
                    <p className="text-sm text-[#4A5568] dark:text-slate-400">Mejor Puntaje</p>
                  </div>
                  <p className="text-2xl font-bold text-[#10B981]">
                    <AnimatedCounter end={bestScore} duration={1.5} />
                  </p>
                </motion.div>

                <motion.div 
                  className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-100 dark:border-slate-700"
                  whileHover={{ y: -4, scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-purple-50 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 text-purple-500" />
                    </div>
                    <p className="text-sm text-[#4A5568] dark:text-slate-400">Promedio</p>
                  </div>
                  <p className="text-2xl font-bold text-[#0A2540] dark:text-white">
                    <AnimatedCounter end={averageScore} duration={1.5} />
                  </p>
                </motion.div>
              </div>
            </FadeIn>
          )}

          {/* Attempts List */}
          <div className="space-y-4">
            {attempts.map((attempt, index) => (
              <FadeIn key={attempt.attempt_id} delay={0.1 + index * 0.05}>
                <motion.div 
                  className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-5 border border-slate-100 dark:border-slate-700"
                  data-testid={`attempt-${attempt.attempt_id}`}
                  whileHover={{ y: -2, boxShadow: "0 10px 40px -10px rgba(0,0,0,0.1)" }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-bold text-[#0A2540] dark:text-white">{attempt.simulator_name}</h3>
                        <motion.span 
                          className={`text-xs px-2 py-1 rounded-full ${
                            attempt.status === "completed" 
                              ? "bg-green-100 text-green-700" 
                              : "bg-amber-100 text-amber-700"
                          }`}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.2 + index * 0.05 }}
                        >
                          {attempt.status === "completed" ? "Completado" : "En Progreso"}
                        </motion.span>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-[#4A5568] dark:text-slate-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(attempt.started_at)}
                        </span>
                        {attempt.status === "completed" && (
                          <span className="flex items-center gap-1">
                            <Target className="w-4 h-4" />
                            {attempt.total_questions} preguntas
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {attempt.status === "completed" ? (
                        <>
                          <div className={`text-right p-3 rounded-xl ${getScoreBgColor(attempt.score, attempt.total_questions)}`}>
                            <p className={`text-2xl font-bold ${getScoreColor(attempt.score, attempt.total_questions)}`}>
                              {attempt.score}
                            </p>
                            <p className="text-xs text-[#4A5568] dark:text-slate-400">
                              de {attempt.total_questions}
                            </p>
                          </div>
                          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => navigate(`/results/${attempt.attempt_id}`)}
                              data-testid={`view-results-${attempt.attempt_id}`}
                              className="rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
                            >
                              <ChevronRight className="w-5 h-5" />
                            </Button>
                          </motion.div>
                        </>
                      ) : (
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Button
                            onClick={() => navigate(`/exam/${attempt.simulator_id}`)}
                            className="bg-[#F2B705] text-[#0A2540] hover:bg-[#F2B705]/90 shadow-lg shadow-[#F2B705]/20"
                            data-testid={`continue-exam-${attempt.attempt_id}`}
                          >
                            <Zap className="w-4 h-4 mr-1" />
                            Continuar
                          </Button>
                        </motion.div>
                      )}
                    </div>
                  </div>
                </motion.div>
              </FadeIn>
            ))}
          </div>

          {attempts.length === 0 && (
            <FadeIn>
              <motion.div 
                className="text-center py-16"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <HistoryIcon className="w-16 h-16 mx-auto text-[#4A5568]/30 dark:text-slate-600 mb-4" />
                </motion.div>
                <h3 className="text-lg font-medium text-[#0A2540] dark:text-white mb-2">No hay intentos aún</h3>
                <p className="text-[#4A5568] dark:text-slate-400 mb-6">Comienza tu primer simulacro para ver tu historial aquí.</p>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    onClick={() => navigate("/dashboard")}
                    className="bg-[#F2B705] text-[#0A2540] hover:bg-[#F2B705]/90"
                  >
                    Ir al Dashboard
                  </Button>
                </motion.div>
              </motion.div>
            </FadeIn>
          )}
        </main>
      </div>
    </div>
  );
};

export default History;
