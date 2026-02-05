import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  BookOpen, Target, TrendingUp, TrendingDown, Lightbulb, 
  AlertTriangle, Crown, Lock, Clock, BarChart3, Sparkles,
  ChevronRight, Play, Award, MessageSquare, RotateCcw
} from "lucide-react";
import { Button } from "../components/ui/button";
import { AnimatedButton } from "../components/ui/AnimatedButton";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog";
import { AuthContext, API } from "../App";
import { toast } from "sonner";
import Sidebar from "../components/Sidebar";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import { 
  FadeIn, FadeInStagger, FadeInStaggerChild,
  AnimatedCounter, GradientText 
} from "../components/animations";
import { UserLimits } from "../components";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [progress, setProgress] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [simulators, setSimulators] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSimulator, setSelectedSimulator] = useState(null);
  const [showQuestionCountDialog, setShowQuestionCountDialog] = useState(false);
  const [selectedQuestionCount, setSelectedQuestionCount] = useState(120);
  const [showUpsellDialog, setShowUpsellDialog] = useState(false);
  const [lockedArea, setLockedArea] = useState(null);
  const [inProgressAttempt, setInProgressAttempt] = useState(null);
  const [showExamConflictDialog, setShowExamConflictDialog] = useState(false);
  const [pendingExamStart, setPendingExamStart] = useState(null);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = { "Authorization": `Bearer ${token}` };
      
      const [progressRes, simulatorsRes, analyticsRes, subRes, attemptsRes] = await Promise.all([
        fetch(`${API}/progress`, { headers, credentials: "include" }),
        fetch(`${API}/simulators`, { headers, credentials: "include" }),
        fetch(`${API}/analytics/student/performance`, { headers, credentials: "include" }),
        fetch(`${API}/payments/subscription`, { headers, credentials: "include" }),
        fetch(`${API}/attempts`, { headers, credentials: "include" })
      ]);

      if (progressRes.ok) setProgress(await progressRes.json());
      if (simulatorsRes.ok) setSimulators(await simulatorsRes.json());
      if (analyticsRes.ok) setAnalytics(await analyticsRes.json());
      if (subRes.ok) setSubscription(await subRes.json());
      if (attemptsRes.ok) {
        const attempts = await attemptsRes.json();
        const inProgress = attempts.find(a => a.status === "in_progress");
        setInProgressAttempt(inProgress || null);
      }
    } catch (error) {
      // Error fetching data
    } finally {
      setLoading(false);
    }
  };

  const handleStartExam = (simulator, questionCount) => {
    if (inProgressAttempt) {
      setPendingExamStart({ simulatorId: simulator.simulator_id, questionCount });
      setShowExamConflictDialog(true);
    } else {
      navigate(`/exam/${simulator.simulator_id}?questions=${questionCount}`);
    }
  };

  const abandonAndStartNew = async () => {
    if (!pendingExamStart) return;
    
    try {
      const token = localStorage.getItem("token");
      await fetch(`${API}/attempts/${inProgressAttempt.attempt_id}/abandon`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        credentials: "include"
      });
      
      setInProgressAttempt(null);
      setShowExamConflictDialog(false);
      navigate(`/exam/${pendingExamStart.simulatorId}?questions=${pendingExamStart.questionCount}`);
    } catch (error) {
      toast.error("Error al abandonar el examen anterior");
    }
  };

  const resumeExistingExam = () => {
    setShowExamConflictDialog(false);
    navigate(`/exam/${inProgressAttempt.simulator_id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F7FA] dark:bg-slate-900 flex items-center justify-center">
        <motion.div 
          className="w-16 h-16 border-4 border-[#0A2540] border-t-[#F2B705] dark:border-slate-600 dark:border-t-[#F2B705] rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
    );
  }

  const weakSubjects = analytics?.weak_subjects || [];
  const strongSubjects = analytics?.strong_subjects || [];

  return (
    <div className="min-h-screen bg-[#F5F7FA] dark:bg-slate-900 transition-colors duration-300">
      <Sidebar />

      <main className="lg:ml-64 p-6 md:p-8 pt-20 lg:pt-8">
        {/* Welcome */}
        <FadeIn>
          <div className="mb-8">
            <motion.h1 
              className="text-3xl md:text-4xl font-bold text-[#0A2540] dark:text-white font-[Poppins]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              ¡Hola, {user?.name?.split(" ")[0] || "Estudiante"}! 👋
            </motion.h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">Continúa tu preparación para el examen UNAM</p>
          </div>
        </FadeIn>

        {/* Stats Cards */}
        <FadeInStagger className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          <FadeInStaggerChild>
            <motion.div 
              className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700"
              whileHover={{ y: -4, boxShadow: "0 20px 40px rgba(10, 37, 64, 0.1)" }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 rounded-xl flex items-center justify-center mb-4">
                <Target className="w-6 h-6 text-[#0A2540] dark:text-blue-400" />
              </div>
              <p className="text-3xl font-bold text-[#0A2540] dark:text-white">
                <AnimatedCounter value={analytics?.total_attempts || 0} />
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Simulacros Completados</p>
            </motion.div>
          </FadeInStaggerChild>

          <FadeInStaggerChild>
            <motion.div 
              className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700"
              whileHover={{ y: -4, boxShadow: "0 20px 40px rgba(10, 37, 64, 0.1)" }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <div className="w-12 h-12 bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-900/30 dark:to-amber-800/30 rounded-xl flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-[#F2B705]" />
              </div>
              <p className="text-3xl font-bold text-[#0A2540] dark:text-white">
                <AnimatedCounter value={analytics?.overall_accuracy || 0} suffix="%" />
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Precisión General</p>
            </motion.div>
          </FadeInStaggerChild>

          <FadeInStaggerChild>
            <motion.div 
              className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700"
              whileHover={{ y: -4, boxShadow: "0 20px 40px rgba(10, 37, 64, 0.1)" }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30 rounded-xl flex items-center justify-center mb-4">
                <BookOpen className="w-6 h-6 text-[#10B981]" />
              </div>
              <p className="text-3xl font-bold text-[#0A2540] dark:text-white">
                <AnimatedCounter value={analytics?.total_questions_answered || 0} />
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Preguntas Respondidas</p>
            </motion.div>
          </FadeInStaggerChild>
        </FadeInStagger>

        {/* Subscription Banner */}
        <FadeIn delay={0.3}>
          {!subscription?.is_premium && user?.role !== "admin" && (
            <>
              {/* Premium CTA Banner */}
              <motion.div 
                className="relative overflow-hidden rounded-2xl p-6 mb-8 bg-gradient-to-r from-[#F2B705] to-[#F59E0B]"
                whileHover={{ scale: 1.01 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <motion.div
                      className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm"
                      whileHover={{ rotate: 10 }}
                    >
                      <Crown className="w-7 h-7 text-[#0A2540]" />
                    </motion.div>
                    <div>
                      <p className="font-bold text-[#0A2540] text-lg">Plan Gratuito</p>
                      <p className="text-sm text-[#0A2540]/80">
                        Solo {subscription?.simulators_limit || 3} simulacros por área. 
                        <span className="font-semibold"> ¡Necesitas más práctica para competir!</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="hidden md:block text-right">
                      <p className="text-xs text-[#0A2540]/70">Precio especial</p>
                      <p className="text-2xl font-bold text-[#0A2540]">$10<span className="text-sm font-normal">/mes</span></p>
                    </div>
                    <AnimatedButton
                      onClick={() => navigate("/plans")}
                      variant="primary"
                      size="md"
                      className="bg-[#0A2540] hover:bg-[#0A2540]/90"
                    >
                      Ver Planes
                    </AnimatedButton>
                  </div>
                </div>
              </motion.div>
            </>
          )}

          {subscription?.is_premium && (
            <motion.div 
              className="relative overflow-hidden rounded-2xl p-6 mb-8 bg-gradient-to-r from-[#10B981] to-[#059669]"
              whileHover={{ scale: 1.01 }}
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <div className="relative z-10 flex items-center gap-4">
                <motion.div
                  className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Crown className="w-7 h-7 text-white" />
                </motion.div>
                <div>
                  <p className="font-bold text-white text-lg">Plan {subscription.plan_name}</p>
                  <p className="text-sm text-white/80">Acceso ilimitado a todos los simulacros</p>
                </div>
              </div>
            </motion.div>
          )}
        </FadeIn>

        {/* Simulacros por Área */}
        <FadeIn delay={0.4}>
          <motion.div 
            className="bg-[#0A2540] rounded-2xl p-6 text-white mb-8 relative overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Background effects */}
            <div className="absolute inset-0 overflow-hidden">
              <motion.div 
                className="absolute top-0 left-1/4 w-64 h-64 bg-[#F2B705]/10 rounded-full blur-3xl"
                animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
                transition={{ duration: 8, repeat: Infinity }}
              />
            </div>

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold font-[Poppins]">Iniciar Simulacro</h2>
                  <p className="text-white/60 mt-1">Selecciona tu área de estudio</p>
                </div>
                {!subscription?.is_premium && user?.role !== "admin" && (
                  <span className="text-xs bg-white/20 px-4 py-2 rounded-full backdrop-blur-sm">
                    {subscription?.simulators_limit || 3} gratis por área
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {simulators.map((sim, index) => {
                  const areaUsed = subscription?.simulators_used?.[sim.area] || 0;
                  const remaining = (subscription?.simulators_limit || 3) - areaUsed;
                  const isLocked = !subscription?.is_premium && user?.role !== "admin" && remaining <= 0;
                  
                  return (
                    <motion.button
                      key={sim.simulator_id}
                      onClick={() => {
                        if (isLocked) {
                          setLockedArea(sim);
                          setShowUpsellDialog(true);
                        } else {
                          setSelectedSimulator(sim);
                          setShowQuestionCountDialog(true);
                        }
                      }}
                      className={`relative p-5 rounded-xl transition-all text-left overflow-hidden ${
                        isLocked 
                          ? "bg-white/5 opacity-60" 
                          : "bg-white/10 hover:bg-white/20"
                      }`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={!isLocked ? { y: -4, scale: 1.02 } : {}}
                      whileTap={!isLocked ? { scale: 0.98 } : {}}
                    >
                      {isLocked && (
                        <div className="absolute top-3 right-3">
                          <Lock className="w-4 h-4 text-white/60" />
                        </div>
                      )}
                      
                      <motion.div 
                        className="w-14 h-14 rounded-xl mb-4 flex items-center justify-center text-white font-bold text-xl shadow-lg"
                        style={{ 
                          backgroundColor: sim.area_color,
                          boxShadow: `0 8px 30px ${sim.area_color}50`
                        }}
                        whileHover={{ scale: 1.1, rotate: 5 }}
                      >
                        {sim.area.replace("area_", "")}
                      </motion.div>
                      
                      <p className="text-sm font-semibold text-white leading-tight">{sim.area_name}</p>
                      
                      {!subscription?.is_premium && user?.role !== "admin" && (
                        <p className={`text-xs mt-2 ${remaining <= 0 ? 'text-red-400' : 'text-white/60'}`}>
                          {remaining > 0 ? `${remaining} restantes` : "Sin intentos"}
                        </p>
                      )}

                      {!isLocked && (
                        <motion.div
                          className="absolute bottom-3 right-3"
                          initial={{ opacity: 0, x: -10 }}
                          whileHover={{ opacity: 1, x: 0 }}
                        >
                          <Play className="w-4 h-4 text-white/60" />
                        </motion.div>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </FadeIn>

        {/* Weak Subjects */}
        {weakSubjects.length > 0 && (
          <FadeIn delay={0.5}>
            <motion.div 
              className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm mb-8 border border-slate-100 dark:border-slate-700"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                </div>
                <h2 className="text-xl font-bold text-[#0A2540] dark:text-white font-[Poppins]">Materias a Reforzar</h2>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-5">
                Enfócate en estas materias para mejorar tu puntaje general
              </p>
              <div className="space-y-3">
                {weakSubjects.map((subj, idx) => (
                  <motion.div 
                    key={idx} 
                    className="flex items-center justify-between p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl border border-amber-100 dark:border-amber-800/30"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    whileHover={{ x: 4 }}
                  >
                    <div className="flex items-center gap-3">
                      <TrendingDown className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                      <span className="font-semibold text-amber-900 dark:text-amber-200">{subj.subject}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-lg font-bold text-amber-600 dark:text-amber-400">{subj.percentage}%</span>
                      <AnimatedButton
                        size="sm"
                        variant="outline"
                        onClick={() => navigate("/subjects")}
                        className="border-amber-500 text-amber-600 hover:bg-amber-500 hover:text-white dark:border-amber-500 dark:text-amber-400 dark:hover:bg-amber-500 dark:hover:text-white"
                      >
                        Practicar
                      </AnimatedButton>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </FadeIn>
        )}

        {/* Progress and Recommendations */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Progress Chart */}
          <FadeIn delay={0.6} direction="left">
            <motion.div 
              className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700"
              whileHover={{ boxShadow: "0 20px 40px rgba(10, 37, 64, 0.08)" }}
            >
              <h2 className="text-xl font-bold text-[#0A2540] dark:text-white mb-6 font-[Poppins] flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-[#F2B705]" />
                Tu Progreso
              </h2>
              {analytics?.progress_trend?.length > 1 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={analytics.progress_trend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" className="dark:stroke-slate-700" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 10, fill: "#64748B" }} 
                      stroke="#64748B"
                      tickFormatter={(date) => new Date(date).toLocaleDateString("es-MX", { day: "2-digit", month: "short" })}
                    />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: "#64748B" }} stroke="#64748B" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: "#0A2540", border: "none", borderRadius: "12px", color: "white" }}
                      formatter={(value) => [`${value}%`, "Aciertos"]}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="percentage" 
                      stroke="#F2B705" 
                      strokeWidth={3} 
                      dot={{ fill: "#F2B705", strokeWidth: 2, r: 4 }} 
                      activeDot={{ r: 6, fill: "#0A2540" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[220px] flex items-center justify-center">
                  <div className="text-center">
                    <motion.div
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <BarChart3 className="w-16 h-16 mx-auto mb-4 text-slate-200 dark:text-slate-700" />
                    </motion.div>
                    <p className="text-slate-400 dark:text-slate-500">Completa al menos 2 simulacros para ver tu progreso</p>
                  </div>
                </div>
              )}
            </motion.div>
          </FadeIn>

          {/* Recommendations */}
          <FadeIn delay={0.6} direction="right">
            <motion.div 
              className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700"
              whileHover={{ boxShadow: "0 20px 40px rgba(10, 37, 64, 0.08)" }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
                  <Lightbulb className="w-5 h-5 text-[#F2B705]" />
                </div>
                <h2 className="text-xl font-bold text-[#0A2540] dark:text-white font-[Poppins]">Recomendaciones</h2>
              </div>
              
              {analytics?.recommendations?.length > 0 ? (
                <div className="space-y-3">
                  {analytics.recommendations.map((rec, idx) => (
                    <motion.div 
                      key={idx} 
                      className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl text-slate-600 dark:text-slate-300 text-sm leading-relaxed"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      whileHover={{ x: 4, backgroundColor: "#F2B70510" }}
                    >
                      <div className="flex items-start gap-3">
                        <Sparkles className="w-4 h-4 text-[#F2B705] mt-0.5 flex-shrink-0" />
                        {rec}
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="h-[180px] flex items-center justify-center">
                  <div className="text-center">
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 4, repeat: Infinity }}
                    >
                      <Lightbulb className="w-16 h-16 mx-auto mb-4 text-slate-200 dark:text-slate-700" />
                    </motion.div>
                    <p className="text-slate-400 dark:text-slate-500">Completa simulacros para recibir recomendaciones</p>
                  </div>
                </div>
              )}
            </motion.div>
          </FadeIn>
        </div>

        {/* Feedback Invitation */}
        <FadeIn delay={0.8}>
          <motion.div 
            className="bg-gradient-to-r from-[#0A2540] to-[#0A2540]/90 rounded-2xl p-6 shadow-lg mb-8 overflow-hidden relative"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#F2B705]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#F2B705]/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
            
            <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-[#F2B705]/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="w-6 h-6 text-[#F2B705]" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white font-[Poppins]">
                    ¿Tienes sugerencias?
                  </h3>
                  <p className="text-white/70 text-sm mt-1">
                    Ayúdanos a mejorar la plataforma. Tu opinión es importante para nosotros.
                  </p>
                </div>
              </div>
              <motion.button
                onClick={() => document.querySelector('[title="Enviar feedback"]')?.click()}
                className="px-5 py-2.5 bg-[#F2B705] hover:bg-[#F59E0B] text-[#0A2540] font-medium rounded-xl transition-colors flex items-center gap-2 flex-shrink-0"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <MessageSquare className="w-4 h-4" />
                Enviar feedback
              </motion.button>
            </div>
          </motion.div>
        </FadeIn>

        {/* Recent Attempts */}
        {progress?.recent_attempts?.length > 0 && (
          <FadeIn delay={0.7}>
            <motion.div 
              className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Award className="w-5 h-5 text-[#0A2540]" />
                  </div>
                  <h2 className="text-xl font-bold text-[#0A2540] dark:text-white font-[Poppins]">Últimos Resultados</h2>
                </div>
                <motion.button
                  onClick={() => navigate("/history")}
                  className="text-sm text-slate-500 dark:text-slate-400 hover:text-[#0A2540] dark:hover:text-white flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  whileHover={{ x: 4 }}
                >
                  Ver Todo
                  <ChevronRight className="w-4 h-4" />
                </motion.button>
              </div>
              
              <div className="space-y-3">
                {progress.recent_attempts.slice(0, 3).map((attempt, idx) => (
                  <motion.div 
                    key={idx} 
                    className="flex items-center justify-between p-5 bg-slate-50 dark:bg-slate-700/50 rounded-xl"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    whileHover={{ x: 4, backgroundColor: "#F8FAFC" }}
                  >
                    <div>
                      <p className="font-semibold text-[#0A2540] dark:text-white">{attempt.simulator_name}</p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                        {new Date(attempt.date).toLocaleDateString("es-MX", { 
                          day: "numeric", 
                          month: "short", 
                          year: "numeric" 
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-[#0A2540] dark:text-white">{attempt.score}/{attempt.total}</p>
                      <p className={`text-sm font-semibold ${(attempt.score/attempt.total)*100 >= 60 ? 'text-green-500' : 'text-red-500'}`}>
                        {((attempt.score / attempt.total) * 100).toFixed(0)}%
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </FadeIn>
        )}
      </main>

      {/* Question Count Dialog */}
      <AlertDialog open={showQuestionCountDialog} onOpenChange={setShowQuestionCountDialog}>
        <AlertDialogContent className="sm:max-w-md rounded-2xl bg-white dark:bg-slate-800 border dark:border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-[#0A2540] dark:text-white text-xl">
              <Target className="w-6 h-6 text-[#F2B705]" />
              Configurar Simulacro
            </AlertDialogTitle>
            <AlertDialogDescription className="dark:text-slate-300">
              <div className="space-y-5 mt-4">
                <div className="bg-slate-50 dark:bg-slate-700 p-4 rounded-xl">
                  <p className="font-bold text-[#0A2540] dark:text-white text-lg">{selectedSimulator?.area_name}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Selecciona la cantidad de preguntas</p>
                </div>
                
                <div className="grid grid-cols-3 gap-3">
                  {[40, 80, 120].map((count) => (
                    <motion.button
                      key={count}
                      onClick={() => setSelectedQuestionCount(count)}
                      className={`p-5 rounded-xl border-2 transition-all bg-white dark:bg-slate-700 ${
                        selectedQuestionCount === count
                          ? "border-[#F2B705] bg-amber-50 dark:bg-amber-900/20 shadow-md"
                          : "border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500"
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <p className={`text-3xl font-bold ${
                        selectedQuestionCount === count ? "text-[#0A2540] dark:text-white" : "text-slate-500 dark:text-slate-400"
                      }`}>
                        {count}
                      </p>
                      <p className="text-xs text-slate-400 dark:text-slate-300 mt-1">preguntas</p>
                      <div className="flex items-center justify-center gap-1 mt-3 text-xs text-slate-400 dark:text-slate-300">
                        <Clock className="w-3 h-3" />
                        <span>{Math.round(count * 1.5)} min</span>
                      </div>
                    </motion.button>
                  ))}
                </div>

                <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-100 dark:border-amber-800/50">
                  <p className="text-xs text-amber-800 dark:text-amber-200">
                    <strong>Nota:</strong> El examen real de la UNAM tiene 120 preguntas en 180 minutos. 
                    Los modos de 40 y 80 preguntas son ideales para práctica rápida.
                  </p>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6">
            <AlertDialogCancel className="rounded-xl dark:border-slate-600 dark:text-white dark:hover:bg-slate-700">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setShowQuestionCountDialog(false);
                handleStartExam(selectedSimulator, selectedQuestionCount);
              }}
              className="bg-[#F2B705] text-[#0A2540] hover:bg-[#F2B705]/90 rounded-xl font-semibold"
            >
              Iniciar Simulacro
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Exam Conflict Dialog - When user has an exam in progress */}
      <AlertDialog open={showExamConflictDialog} onOpenChange={setShowExamConflictDialog}>
        <AlertDialogContent className="sm:max-w-lg w-full rounded-2xl bg-white dark:bg-slate-800 border dark:border-slate-700 p-6">
          <AlertDialogHeader className="space-y-3">
            <AlertDialogTitle className="flex items-center gap-2 text-[#0A2540] dark:text-white text-xl text-left">
              <AlertTriangle className="w-6 h-6 text-[#F59E0B] flex-shrink-0" />
              <span>Examen en progreso</span>
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base text-slate-600 dark:text-slate-300 text-left">
              <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-xl border border-amber-100 dark:border-amber-800/50 w-full">
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  Ya tienes un examen iniciado: <strong>{inProgressAttempt?.simulator_name || "Simulacro"}</strong>
                </p>
                <p className="text-xs text-amber-700 dark:text-amber-300 mt-2">
                  Puedes reanudarlo o iniciar uno nuevo (perderás el progreso del anterior).
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6 flex-col gap-2 w-full">
            <AlertDialogAction
              onClick={resumeExistingExam}
              className="w-full bg-[#10B981] text-white hover:bg-[#10B981]/90 rounded-xl font-semibold py-3"
            >
              <Play className="w-5 h-5 mr-2" />
              Reanudar examen anterior
            </AlertDialogAction>
            <AlertDialogAction
              onClick={abandonAndStartNew}
              className="w-full bg-[#F2B705] text-[#0A2540] hover:bg-[#F2B705]/90 rounded-xl font-semibold py-3"
            >
              <RotateCcw className="w-5 h-5 mr-2" />
              Iniciar nuevo (perder progreso)
            </AlertDialogAction>
            <AlertDialogCancel 
              onClick={() => setPendingExamStart(null)}
              className="w-full rounded-xl dark:border-slate-600 dark:text-white dark:hover:bg-slate-700"
            >
              Cancelar
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Upsell Dialog - When user runs out of free attempts */}
      <AlertDialog open={showUpsellDialog} onOpenChange={setShowUpsellDialog}>
        <AlertDialogContent className="sm:max-w-lg rounded-2xl bg-white dark:bg-slate-800 border dark:border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600 text-xl">
              <Lock className="w-6 h-6" />
              Has alcanzado el límite gratuito
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base text-slate-600 dark:text-slate-300">
              <div className="space-y-4 mt-2">
                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-100 dark:border-red-800/50">
                  <p className="font-semibold text-red-800 dark:text-red-200 mb-2">
                    {lockedArea?.area_name}
                  </p>
                  <p className="text-sm text-red-700 dark:text-red-300">
                    Ya usaste tus {subscription?.simulators_limit || 3} simulacros gratuitos en esta área. 
                    Para seguir practicando y aumentar tus probabilidades de pasar, necesitas acceso ilimitado.
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="bg-slate-50 dark:bg-slate-700 p-3 rounded-lg">
                    <p className="text-2xl font-bold text-[#0A2540] dark:text-white">150k</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">aspirantes</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-700 p-3 rounded-lg">
                    <p className="text-2xl font-bold text-[#0A2540] dark:text-white">15k</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">lugares</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-700 p-3 rounded-lg">
                    <p className="text-2xl font-bold text-[#10B981]">2.5x</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">más probabilidades</p>
                  </div>
                </div>

                <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg border border-amber-200 dark:border-amber-800/50">
                  <p className="text-sm text-amber-800 dark:text-amber-200">
                    <strong>💡 Dato importante:</strong> El 78% de los aceptados en 2024 usaron simulacros ilimitados durante su preparación.
                  </p>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6 flex-col gap-2">
            <AlertDialogAction
              onClick={() => {
                setShowUpsellDialog(false);
                navigate("/plans");
              }}
              className="w-full bg-[#F2B705] text-[#0A2540] hover:bg-[#F2B705]/90 rounded-xl font-semibold py-3"
            >
              <Crown className="w-5 h-5 mr-2" />
              Ver Planes Premium
            </AlertDialogAction>
            <AlertDialogCancel className="w-full rounded-xl dark:border-slate-600 dark:text-white dark:hover:bg-slate-700">
              Quizás más tarde
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Dashboard;
