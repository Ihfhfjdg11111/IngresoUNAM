import { useState, useEffect, useContext, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Clock, Target, CheckCircle, XCircle, Trophy,
  ArrowLeft, Home, RotateCcw, ChevronDown, ChevronUp,
  Filter, BookOpen, Flag, AlertTriangle, TrendingUp, MessageSquare
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Progress } from "../components/ui/progress";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { AuthContext, API } from "../App";
import { toast } from "sonner";
import Sidebar from "../components/Sidebar";
import { FadeIn, AnimatedCounter } from "../components";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from "recharts";

const Results = () => {
  const navigate = useNavigate();
  const { attemptId } = useParams();
  const { user } = useContext(AuthContext);
  
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showQuestions, setShowQuestions] = useState(false);
  const [filter, setFilter] = useState("all");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [expandedQuestion, setExpandedQuestion] = useState(null);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [reportingQuestion, setReportingQuestion] = useState(null);
  const [reportReason, setReportReason] = useState("");
  const [reportDetails, setReportDetails] = useState("");
  const [submittingReport, setSubmittingReport] = useState(false);

  const token = localStorage.getItem("token");
  const headers = { "Authorization": `Bearer ${token}` };

  useEffect(() => {
    fetchResults();
  }, [attemptId]);

  const handleReportQuestion = (question) => {
    setReportingQuestion(question);
    setReportReason("");
    setReportDetails("");
    setReportDialogOpen(true);
  };

  const submitReport = async () => {
    if (!reportReason) {
      toast.error("Selecciona un motivo");
      return;
    }
    setSubmittingReport(true);
    try {
      const response = await fetch(`${API}/reports`, {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          question_id: reportingQuestion.question_id,
          reason: reportReason,
          details: reportDetails || null
        })
      });
      if (response.ok) {
        toast.success("Reporte enviado. ¡Gracias por ayudarnos a mejorar!");
        setReportDialogOpen(false);
      } else {
        toast.error("Error al enviar el reporte");
      }
    } catch (error) {
      toast.error("Error de conexión");
    } finally {
      setSubmittingReport(false);
    }
  };

  const fetchResults = async () => {
    try {
      const response = await fetch(`${API}/attempts/${attemptId}/results`, {
        headers: { "Authorization": `Bearer ${token}` },
        credentials: "include"
      });

      if (response.ok) {
        const data = await response.json();
        setResults(data);
      } else {
        toast.error("Error al cargar resultados");
        navigate("/dashboard");
      }
    } catch (error) {
      toast.error("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (percentage) => {
    if (percentage >= 80) return "#10B981";
    if (percentage >= 60) return "#F2B705";
    if (percentage >= 40) return "#F59E0B";
    return "#EF4444";
  };

  const getScoreMessage = (percentage) => {
    if (percentage >= 80) return "¡Excelente trabajo!";
    if (percentage >= 60) return "¡Buen resultado!";
    if (percentage >= 40) return "Sigue practicando";
    return "Necesitas más práctica";
  };

  const prepareChartData = () => {
    if (!results?.subject_scores) return [];
    return Object.entries(results.subject_scores).map(([subject, scores]) => ({
      name: subject.length > 12 ? subject.substring(0, 12) + "..." : subject,
      fullName: subject,
      correct: scores.correct,
      total: scores.total,
      percentage: Math.round((scores.correct / scores.total) * 100)
    }));
  };

  const subjects = useMemo(() => {
    if (!results?.answers) return [];
    const uniqueSubjects = [...new Set(results.answers.map(a => a.subject_name))];
    return uniqueSubjects.filter(Boolean);
  }, [results]);

  const filteredQuestions = useMemo(() => {
    if (!results?.answers) return [];
    
    return results.answers.filter(answer => {
      if (filter === "correct" && !answer.is_correct) return false;
      if (filter === "incorrect" && answer.is_correct) return false;
      
      if (subjectFilter !== "all" && answer.subject_name !== subjectFilter) return false;
      
      return true;
    });
  }, [results, filter, subjectFilter]);

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

  const scoreColor = getScoreColor(results?.percentage);
  const chartData = prepareChartData();

  return (
    <>
      <Sidebar />
      <div className="lg:ml-64 min-h-screen">
        <div className="min-h-screen bg-[#F5F7FA] dark:bg-slate-900 py-8 px-4 transition-colors duration-300">
          <div className="max-w-4xl mx-auto">
            {/* Back Button */}
            <FadeIn>
              <Button
                variant="ghost"
                onClick={() => navigate("/dashboard")}
                className="mb-6 text-[#4A5568] hover:text-[#0A2540] dark:text-slate-400 dark:hover:text-white"
                data-testid="back-to-dashboard"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver al Dashboard
              </Button>
            </FadeIn>

            {/* Score Card */}
            <FadeIn delay={0.1}>
              <motion.div 
                className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg overflow-hidden mb-8 dark:border dark:border-slate-700"
                data-testid="results-card"
                whileHover={{ scale: 1.01 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div 
                  className="p-8 text-center text-white relative overflow-hidden"
                  style={{ backgroundColor: scoreColor }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <motion.div
                    className="absolute inset-0 opacity-20"
                    animate={{ 
                      background: [
                        "radial-gradient(circle at 20% 80%, white 0%, transparent 50%)",
                        "radial-gradient(circle at 80% 20%, white 0%, transparent 50%)",
                        "radial-gradient(circle at 20% 80%, white 0%, transparent 50%)"
                      ]
                    }}
                    transition={{ duration: 5, repeat: Infinity }}
                  />
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  >
                    <Trophy className="w-16 h-16 mx-auto mb-4 opacity-80" />
                  </motion.div>
                  <h1 className="text-4xl font-bold mb-2 font-[Poppins]">
                    <AnimatedCounter end={results?.score} duration={1.5} /> / {results?.total_questions}
                  </h1>
                  <p className="text-xl opacity-90">{results?.percentage}%</p>
                  <motion.p 
                    className="mt-2 opacity-80"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 0.8, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    {getScoreMessage(results?.percentage)}
                  </motion.p>
                </motion.div>

                <div className="p-6">
                  <h2 className="text-lg font-bold text-[#0A2540] dark:text-white mb-4 font-[Poppins]">
                    {results?.simulator_name}
                  </h2>
                  <p className="text-[#4A5568] dark:text-slate-400 text-sm mb-4">{results?.area_name}</p>

                  <div className="grid grid-cols-3 gap-4">
                    <motion.div 
                      className="text-center p-4 bg-gradient-to-br from-green-50 to-transparent dark:from-green-900/30 dark:to-transparent rounded-xl border border-green-100 dark:border-green-800/50"
                      whileHover={{ scale: 1.05, y: -2 }}
                    >
                      <CheckCircle className="w-6 h-6 text-[#10B981] mx-auto mb-2" />
                      <p className="text-2xl font-bold text-[#0A2540] dark:text-white">{results?.score}</p>
                      <p className="text-xs text-[#4A5568] dark:text-slate-400">Correctas</p>
                    </motion.div>
                    <motion.div 
                      className="text-center p-4 bg-gradient-to-br from-red-50 to-transparent dark:from-red-900/30 dark:to-transparent rounded-xl border border-red-100 dark:border-red-800/50"
                      whileHover={{ scale: 1.05, y: -2 }}
                    >
                      <XCircle className="w-6 h-6 text-[#EF4444] mx-auto mb-2" />
                      <p className="text-2xl font-bold text-[#0A2540] dark:text-white">
                        {results?.total_questions - results?.score}
                      </p>
                      <p className="text-xs text-[#4A5568] dark:text-slate-400">Incorrectas</p>
                    </motion.div>
                    <motion.div 
                      className="text-center p-4 bg-gradient-to-br from-blue-50 to-transparent dark:from-blue-900/30 dark:to-transparent rounded-xl border border-blue-100 dark:border-blue-800/50"
                      whileHover={{ scale: 1.05, y: -2 }}
                    >
                      <Clock className="w-6 h-6 text-[#3B82F6] mx-auto mb-2" />
                      <p className="text-2xl font-bold text-[#0A2540] dark:text-white">{results?.time_taken_minutes}</p>
                      <p className="text-xs text-[#4A5568] dark:text-slate-400">Minutos</p>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            </FadeIn>

            {/* Questions Review Section */}
            <FadeIn delay={0.2}>
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm mb-8 overflow-hidden dark:border dark:border-slate-700">
                <motion.button
                  onClick={() => setShowQuestions(!showQuestions)}
                  className="w-full p-6 flex items-center justify-between hover:bg-[#F5F7FA] dark:hover:bg-slate-700 transition-colors"
                  data-testid="toggle-questions-btn"
                  whileHover={{ backgroundColor: "rgba(245, 247, 250, 1)" }}
                >
                  <h2 className="text-lg font-bold text-[#0A2540] dark:text-white font-[Poppins] flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    Revisar Preguntas ({results?.answers?.length || 0})
                  </h2>
                  <motion.div
                    animate={{ rotate: showQuestions ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ChevronDown className="w-5 h-5 text-[#4A5568] dark:text-slate-400" />
                  </motion.div>
                </motion.button>

                <AnimatePresence>
                  {showQuestions && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="border-t border-slate-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-slate-800"
                    >
                      {/* Filters */}
                      <div className="p-4 bg-[#F5F7FA] dark:bg-slate-700 border-b border-slate-200 dark:border-slate-600">
                        <div className="flex flex-wrap gap-3 items-center">
                          <Filter className="w-4 h-4 text-[#4A5568] dark:text-slate-400" />
                          
                          {/* Status Filter */}
                          <div className="flex gap-2">
                            <motion.button
                              onClick={() => setFilter("all")}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                                filter === "all" 
                                  ? "bg-[#0A2540] text-white" 
                                  : "bg-white dark:bg-slate-800 text-[#4A5568] dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                              }`}
                              data-testid="filter-all"
                            >
                              Todas ({results?.answers?.length || 0})
                            </motion.button>
                            <motion.button
                              onClick={() => setFilter("correct")}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                                filter === "correct" 
                                  ? "bg-[#10B981] text-white" 
                                  : "bg-white dark:bg-slate-800 text-[#4A5568] dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                              }`}
                              data-testid="filter-correct"
                            >
                              Correctas ({results?.answers?.filter(a => a.is_correct).length || 0})
                            </motion.button>
                            <motion.button
                              onClick={() => setFilter("incorrect")}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                                filter === "incorrect" 
                                  ? "bg-[#EF4444] text-white" 
                                  : "bg-white dark:bg-slate-800 text-[#4A5568] dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                              }`}
                              data-testid="filter-incorrect"
                            >
                              Incorrectas ({results?.answers?.filter(a => !a.is_correct).length || 0})
                            </motion.button>
                          </div>

                          {/* Subject Filter */}
                          <select
                            value={subjectFilter}
                            onChange={(e) => setSubjectFilter(e.target.value)}
                            className="px-3 py-1.5 rounded-lg text-sm bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-[#0A2540] dark:text-white"
                            data-testid="filter-subject"
                          >
                            <option value="all">Todas las materias</option>
                            {subjects.map(subject => (
                              <option key={subject} value={subject}>{subject}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Questions List */}
                      <div className="divide-y divide-slate-100 dark:divide-slate-700 max-h-[600px] overflow-y-auto">
                        {filteredQuestions.length === 0 ? (
                          <div className="p-8 text-center text-[#4A5568] dark:text-slate-400">
                            No hay preguntas con los filtros seleccionados
                          </div>
                        ) : (
                          filteredQuestions.map((answer, index) => (
                            <motion.div 
                              key={answer.question_id} 
                              className="p-4"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.03 }}
                            >
                              <button
                                onClick={() => setExpandedQuestion(
                                  expandedQuestion === answer.question_id ? null : answer.question_id
                                )}
                                className="w-full text-left"
                              >
                                <div className="flex items-start gap-3">
                                  <motion.div 
                                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                                      answer.is_correct ? "bg-[#10B981]" : "bg-[#EF4444]"
                                    }`}
                                    whileHover={{ scale: 1.1 }}
                                  >
                                    {answer.is_correct ? (
                                      <CheckCircle className="w-5 h-5 text-white" />
                                    ) : (
                                      <XCircle className="w-5 h-5 text-white" />
                                    )}
                                  </motion.div>
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="text-xs font-medium text-[#F2B705]">{answer.subject_name}</span>
                                      {answer.topic && (
                                        <span className="text-xs text-[#4A5568] dark:text-slate-400">• {answer.topic}</span>
                                      )}
                                    </div>
                                    <p className="text-[#0A2540] dark:text-white font-medium line-clamp-2">{answer.question_text}</p>
                                  </div>
                                  <motion.div
                                    animate={{ rotate: expandedQuestion === answer.question_id ? 180 : 0 }}
                                    transition={{ duration: 0.2 }}
                                  >
                                    <ChevronDown className="w-5 h-5 text-[#4A5568] dark:text-slate-400" />
                                  </motion.div>
                                </div>
                              </button>

                              {/* Expanded Content */}
                              <AnimatePresence>
                                {expandedQuestion === answer.question_id && (
                                  <motion.div 
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="mt-4 ml-11 space-y-4 overflow-hidden"
                                  >
                                    {/* Reading Text */}
                                    {answer.reading_text && (
                                      <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800/50">
                                        <p className="text-xs font-medium text-[#F2B705] dark:text-amber-300 mb-1">Texto de Lectura</p>
                                        <p className="text-sm text-[#4A5568] dark:text-slate-400 whitespace-pre-wrap">{answer.reading_text}</p>
                                      </div>
                                    )}

                                    {/* Question Image */}
                                    {answer.image_url && (
                                      <img 
                                        src={answer.image_url} 
                                        alt="Imagen de la pregunta"
                                        className="max-w-full h-auto max-h-48 rounded-lg border border-slate-200 dark:border-slate-600"
                                      />
                                    )}

                                    {/* Options */}
                                    <div className="space-y-2">
                                      {answer.options?.map((option, optIndex) => {
                                        const isSelected = answer.selected_option === optIndex;
                                        const isCorrect = answer.correct_answer === optIndex;
                                        
                                        let bgColor = "bg-white dark:bg-slate-700";
                                        let borderColor = "border-slate-200 dark:border-slate-600";
                                        let textColor = "text-[#4A5568] dark:text-slate-300";
                                        
                                        if (isCorrect) {
                                          bgColor = "bg-green-50 dark:bg-green-900/30";
                                          borderColor = "border-[#10B981]";
                                          textColor = "text-[#10B981]";
                                        } else if (isSelected && !isCorrect) {
                                          bgColor = "bg-red-50 dark:bg-red-900/30";
                                          borderColor = "border-[#EF4444]";
                                          textColor = "text-[#EF4444]";
                                        }
                                        
                                        return (
                                          <div 
                                            key={optIndex}
                                            className={`p-3 rounded-lg border-2 ${bgColor} ${borderColor}`}
                                          >
                                            <div className="flex items-center gap-2">
                                              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                                                isCorrect ? "bg-[#10B981] text-white" : 
                                                (isSelected && !isCorrect) ? "bg-[#EF4444] text-white" : 
                                                "bg-slate-100 dark:bg-slate-700 text-[#4A5568] dark:text-slate-400"
                                              }`}>
                                                {String.fromCharCode(65 + optIndex)}
                                              </span>
                                              <span className={textColor}>{option}</span>
                                              {isSelected && (
                                                <span className="text-xs ml-auto">Tu respuesta</span>
                                              )}
                                              {isCorrect && (
                                                <CheckCircle className="w-4 h-4 text-[#10B981] ml-auto" />
                                              )}
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>

                                    {/* Explanation */}
                                    {answer.explanation && (
                                      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800/50">
                                        <p className="text-xs font-medium text-[#3B82F6] dark:text-blue-300 mb-1">Explicación</p>
                                        <p className="text-sm text-[#0A2540] dark:text-white">{answer.explanation}</p>
                                      </div>
                                    )}

                                    {/* Report Button */}
                                    <div className="flex justify-end">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleReportQuestion(answer);
                                        }}
                                        className="text-[#4A5568] dark:text-slate-400 hover:text-[#EF4444] hover:bg-[#EF4444]/10"
                                        data-testid={`report-question-${answer.question_id}`}
                                      >
                                        <Flag className="w-4 h-4 mr-1" />
                                        Reportar pregunta
                                      </Button>
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </motion.div>
                          ))
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </FadeIn>

            {/* Subject Breakdown */}
            <FadeIn delay={0.4}>
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 mb-8 dark:border dark:border-slate-700">
                <h2 className="text-lg font-bold text-[#0A2540] dark:text-white mb-6 font-[Poppins]">
                  Resultados por Materia
                </h2>
                
                {chartData.length > 0 ? (
                  <>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={chartData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                        <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12 }} stroke="#64748B" />
                        <YAxis 
                          dataKey="name" 
                          type="category" 
                          tick={{ fontSize: 11 }} 
                          width={100}
                          stroke="#64748B"
                        />
                        <Tooltip 
                          content={({ payload }) => {
                            if (payload && payload.length > 0) {
                              const data = payload[0].payload;
                              return (
                                <div className="bg-[#0A2540] text-white p-3 rounded-lg shadow-lg">
                                  <p className="font-medium">{data.fullName}</p>
                                  <p className="text-sm opacity-80">
                                    {data.correct}/{data.total} correctas ({data.percentage}%)
                                  </p>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Bar dataKey="percentage" radius={[0, 4, 4, 0]}>
                          {chartData.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={getScoreColor(entry.percentage)} 
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>

                    {/* Detailed List */}
                    <div className="mt-6 space-y-3">
                      {chartData.map((subject, index) => (
                        <motion.div 
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="flex items-center justify-between p-3 bg-[#F5F7FA] dark:bg-slate-700 rounded-lg hover:shadow-md transition-shadow"
                        >
                          <span className="text-[#0A2540] dark:text-white font-medium">{subject.fullName}</span>
                          <div className="flex items-center gap-4">
                            <div className="w-32">
                              <div className="h-2 bg-slate-200 dark:bg-slate-600 rounded-full overflow-hidden">
                                <motion.div 
                                  className="h-full rounded-full"
                                  style={{ backgroundColor: getScoreColor(subject.percentage) }}
                                  initial={{ width: 0 }}
                                  animate={{ width: `${subject.percentage}%` }}
                                  transition={{ duration: 0.8, delay: index * 0.1 }}
                                />
                              </div>
                            </div>
                            <span 
                              className="text-sm font-bold w-16 text-right"
                              style={{ color: getScoreColor(subject.percentage) }}
                            >
                              {subject.correct}/{subject.total}
                            </span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </>
                ) : (
                  <p className="text-[#4A5568] dark:text-slate-400 text-center py-8">No hay datos de materias disponibles</p>
                )}
              </div>
            </FadeIn>

            {/* Actions */}
            <FadeIn delay={0.5}>
              <div className="flex flex-col sm:flex-row gap-4">
                <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    onClick={() => navigate("/dashboard")}
                    className="w-full bg-[#0A2540] dark:bg-[#1e3a5f] dark:hover:bg-[#2a4a6f] hover:bg-[#0A2540]/90"
                    data-testid="go-dashboard-btn"
                  >
                    <Home className="w-4 h-4 mr-2" />
                    Ir al Dashboard
                  </Button>
                </motion.div>
                <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    onClick={() => navigate("/dashboard")}
                    variant="outline"
                    className="w-full border-[#0A2540] dark:border-slate-400 text-[#0A2540] dark:text-white dark:hover:bg-slate-700"
                    data-testid="new-exam-btn"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Nuevo Simulacro
                  </Button>
                </motion.div>
              </div>
            </FadeIn>

            {/* Feedback Invitation */}
            <FadeIn delay={0.6}>
              <motion.div 
                className="mt-8 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-4"
                whileHover={{ scale: 1.01 }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#F2B705]/20 rounded-lg flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-[#F2B705]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#0A2540] dark:text-white">
                      ¿Tienes comentarios sobre este simulacro?
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Tu feedback nos ayuda a mejorar la plataforma
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => document.querySelector('[title="Enviar feedback"]')?.click()}
                  className="px-4 py-2 text-sm font-medium text-[#0A2540] dark:text-white bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors flex-shrink-0"
                >
                  Enviar feedback
                </button>
              </motion.div>
            </FadeIn>
          </div>

          {/* Report Question Dialog */}
          <Dialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
            <DialogContent className="sm:max-w-md bg-white dark:bg-slate-800 dark:border-slate-700">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-[#0A2540] dark:text-white">
                  <AlertTriangle className="w-5 h-5 text-[#F59E0B]" />
                  Reportar Pregunta
                </DialogTitle>
                <DialogDescription>
                  Ayúdanos a mejorar reportando preguntas con errores o problemas.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div>
                  <p className="text-sm font-medium text-[#0A2540] dark:text-white mb-2">Motivo del reporte *</p>
                  <div className="space-y-2">
                    {[
                      { value: "incorrect_answer", label: "Respuesta incorrecta" },
                      { value: "unclear_text", label: "Texto confuso o mal redactado" },
                      { value: "wrong_subject", label: "Materia o tema incorrecto" },
                      { value: "typo", label: "Error tipográfico" },
                      { value: "other", label: "Otro problema" }
                    ].map((option) => (
                      <label
                        key={option.value}
                        className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                          reportReason === option.value
                            ? "border-[#F2B705] bg-amber-50 dark:bg-amber-900/20"
                            : "border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 bg-white dark:bg-slate-700"
                        }`}
                      >
                        <input
                          type="radio"
                          name="reason"
                          value={option.value}
                          checked={reportReason === option.value}
                          onChange={(e) => setReportReason(e.target.value)}
                          className="sr-only"
                        />
                        <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          reportReason === option.value ? "border-[#F2B705]" : "border-slate-300 dark:border-slate-500"
                        }`}>
                          {reportReason === option.value && (
                            <span className="w-2 h-2 rounded-full bg-[#F2B705]" />
                          )}
                        </span>
                        <span className="text-sm text-[#0A2540] dark:text-white">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-[#0A2540] dark:text-white mb-2">Detalles adicionales (opcional)</p>
                  <textarea
                    value={reportDetails}
                    onChange={(e) => setReportDetails(e.target.value)}
                    placeholder="Describe el problema con más detalle..."
                    className="w-full p-3 border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#F2B705]"
                    rows={3}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setReportDialogOpen(false)} className="dark:border-slate-600 dark:text-white dark:hover:bg-slate-700">
                  Cancelar
                </Button>
                <Button
                  onClick={submitReport}
                  disabled={submittingReport || !reportReason}
                  className="bg-[#F2B705] text-[#0A2540] hover:bg-[#F2B705]/90"
                >
                  {submittingReport ? "Enviando..." : "Enviar Reporte"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </>
  );
};

export default Results;
