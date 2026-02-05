import { useState, useEffect, useContext, useRef } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Clock, ChevronLeft, ChevronRight, Flag, AlertTriangle, 
  CheckCircle, LogOut, Save, MessageCircleWarning
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Progress } from "../components/ui/progress";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../components/ui/dialog";
import { AuthContext, API } from "../App";
import { toast } from "sonner";
import { FadeIn, FloatingShape } from "../components";

const Exam = () => {
  const navigate = useNavigate();
  const { simulatorId } = useParams();
  const [searchParams] = useSearchParams();
  const { user } = useContext(AuthContext);
  
  const questionCountParam = parseInt(searchParams.get("questions")) || 120;
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [examData, setExamData] = useState(null);
  const [attemptId, setAttemptId] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [flagged, setFlagged] = useState(new Set());
  const [timeLeft, setTimeLeft] = useState(questionCountParam * 90);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [showTimeWarning, setShowTimeWarning] = useState(false);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [hasRestoredProgress, setHasRestoredProgress] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportDetails, setReportDetails] = useState("");
  const [reportingQuestion, setReportingQuestion] = useState(null);
  const [submittingReport, setSubmittingReport] = useState(false);
  
  const autoSaveInterval = useRef(null);

  const token = localStorage.getItem("token");
  const headers = { "Authorization": `Bearer ${token}` };

  useEffect(() => {
    startExam();
    
    return () => {
      if (autoSaveInterval.current) {
        clearInterval(autoSaveInterval.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [simulatorId]);

  useEffect(() => {
    if (attemptId && !submitting) {
      autoSaveInterval.current = setInterval(() => {
        saveProgress(true);
      }, 30000);
      
      return () => {
        if (autoSaveInterval.current) {
          clearInterval(autoSaveInterval.current);
        }
      };
    }
  }, [attemptId, answers, currentQuestion, timeLeft]);

  useEffect(() => {
    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 300 && prev > 299) {
          setShowTimeWarning(true);
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const startExam = async () => {
    try {
      const attemptRes = await fetch(`${API}/attempts`, {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ 
          simulator_id: simulatorId,
          question_count: questionCountParam
        })
      });

      if (!attemptRes.ok) {
        const error = await attemptRes.json();
        if (attemptRes.status === 403) {
          toast.error(error.detail || "Has alcanzado el límite de simulacros gratuitos");
          navigate("/plans");
          return;
        }
        toast.error("Error al iniciar el examen");
        navigate("/dashboard");
        return;
      }

      const attemptData = await attemptRes.json();
      setAttemptId(attemptData.attempt_id);

      let questionsRes = await fetch(`${API}/attempts/${attemptData.attempt_id}/questions`, {
        headers,
        credentials: "include"
      });

      if (!questionsRes.ok) {
        questionsRes = await fetch(
          `${API}/simulators/${simulatorId}/questions?question_count=${questionCountParam}`, 
          {
            headers,
            credentials: "include"
          }
        );
      }

      if (!questionsRes.ok) {
        toast.error("Error al cargar preguntas");
        return;
      }

      const data = await questionsRes.json();
      setExamData(data);
      
      const duration = data.simulator?.duration_minutes || Math.ceil(data.questions.length * 1.5);
      
      const savedProgress = data.saved_progress;
      if (savedProgress && savedProgress.answers && savedProgress.answers.length > 0) {
        const restoredAnswers = {};
        savedProgress.answers.forEach(a => {
          restoredAnswers[a.question_id] = a.selected_option;
        });
        setAnswers(restoredAnswers);
        setCurrentQuestion(savedProgress.current_question || 0);
        setTimeLeft(savedProgress.time_remaining || duration * 60);
        setHasRestoredProgress(true);
        toast.success("Progreso restaurado");
      } else {
        setTimeLeft(duration * 60);
      }
      
    } catch (error) {
      toast.error("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  const saveProgress = async (silent = false) => {
    if (!attemptId || submitting) return;
    
    if (!silent) setSaving(true);
    
    try {
      const answersArray = Object.entries(answers).map(([questionId, selectedOption]) => ({
        question_id: questionId,
        selected_option: selectedOption
      }));

      await fetch(`${API}/attempts/${attemptId}/save-progress`, {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          answers: answersArray,
          current_question: currentQuestion,
          time_remaining: timeLeft
        })
      });
      
      if (!silent) {
        toast.success("Progreso guardado");
      }
    } catch (error) {
      if (!silent) {
        toast.error("Error al guardar progreso");
      }
    } finally {
      if (!silent) setSaving(false);
    }
  };

  const handleExitWithSave = async () => {
    await saveProgress();
    navigate("/dashboard");
  };

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getTimeClass = () => {
    if (timeLeft <= 300) return "text-red-500 animate-pulse";
    if (timeLeft <= 900) return "text-amber-500";
    return "text-[#0A2540]";
  };

  const handleAnswer = (questionId, optionIndex) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex
    }));
  };

  const toggleFlag = (questionIndex) => {
    setFlagged((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(questionIndex)) {
        newSet.delete(questionIndex);
      } else {
        newSet.add(questionIndex);
      }
      return newSet;
    });
  };

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    // NO cerramos el diálogo aquí - se mantendrá abierto mostrando el estado de carga

    try {
      const answersArray = Object.entries(answers).map(([questionId, selectedOption]) => ({
        question_id: questionId,
        selected_option: selectedOption
      }));

      const response = await fetch(`${API}/attempts/${attemptId}/submit`, {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ answers: answersArray })
      });

      if (response.ok) {
        toast.success("¡Examen enviado!");
        navigate(`/results/${attemptId}`);
      } else {
        const error = await response.json();
        toast.error(error.detail || "Error al enviar el examen");
        setSubmitting(false);
        // En caso de error, cerramos el diálogo para que el usuario pueda ver el mensaje
        // y luego reabrirlo si quiere intentar de nuevo
        setShowSubmitDialog(false);
      }
    } catch (error) {
      toast.error("Error de conexión");
      setSubmitting(false);
      setShowSubmitDialog(false);
    }
  };

  const handleOpenReport = (question) => {
    setReportingQuestion(question);
    setReportReason("");
    setReportDetails("");
    setShowReportDialog(true);
  };

  const handleSubmitReport = async () => {
    if (!reportReason || !reportingQuestion) {
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
          details: reportDetails.trim() || null
        })
      });

      if (response.ok) {
        toast.success("Reporte enviado. ¡Gracias por ayudarnos!");
        setShowReportDialog(false);
      } else {
        const error = await response.json();
        toast.error(error.detail || "Error al enviar reporte");
      }
    } catch (error) {
      toast.error("Error de conexión");
    } finally {
      setSubmittingReport(false);
    }
  };

  const answeredCount = Object.keys(answers).length;
  const totalQuestions = examData?.questions?.length || 0;
  const progressPercentage = (answeredCount / totalQuestions) * 100;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F7FA] dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-[#0A2540] dark:border-slate-600 border-t-[#F2B705] rounded-full mx-auto mb-4"
          />
          <p className="text-[#4A5568] dark:text-slate-400">Cargando examen...</p>
        </div>
      </div>
    );
  }

  const question = examData?.questions?.[currentQuestion];

  return (
    <div className="min-h-screen bg-[#F5F7FA] dark:bg-slate-900 flex flex-col transition-colors duration-300">
      {/* Header */}
      <motion.header 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 sticky top-0 z-40"
      >
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowExitDialog(true)}
              className="text-[#EF4444] hover:bg-[#EF4444]/10"
              data-testid="exit-exam-btn"
            >
              <LogOut className="w-4 h-4 mr-1" />
              Salir
            </Button>
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-[#0A2540] dark:text-white">{examData?.simulator?.name}</p>
              <p className="text-xs text-[#4A5568] dark:text-slate-400">{examData?.simulator?.area_name}</p>
            </div>
          </div>

          <motion.div 
            className={`flex items-center gap-2 px-4 py-2 bg-[#F5F7FA] dark:bg-slate-700 rounded-lg ${getTimeClass()} dark:text-white`}
            animate={timeLeft <= 300 ? { scale: [1, 1.05, 1] } : {}}
            transition={{ duration: 1, repeat: timeLeft <= 300 ? Infinity : 0 }}
          >
            <Clock className="w-5 h-5" />
            <span className="font-mono font-bold text-lg" data-testid="exam-timer">
              {formatTime(timeLeft)}
            </span>
          </motion.div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => saveProgress(false)}
              disabled={saving}
              className="text-[#4A5568] dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
              data-testid="save-progress-btn"
            >
              <Save className={`w-4 h-4 mr-1 ${saving ? 'animate-pulse' : ''}`} />
              {saving ? 'Guardando...' : 'Guardar'}
            </Button>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
              <Button
                onClick={() => setShowSubmitDialog(true)}
                disabled={answeredCount < totalQuestions}
                className={`${answeredCount < totalQuestions 
                  ? 'bg-gray-300 dark:bg-slate-700 text-gray-500 dark:text-slate-400 cursor-not-allowed' 
                  : 'bg-[#F2B705] text-[#0A2540] hover:bg-[#F2B705]/90 shadow-lg shadow-[#F2B705]/20'}`}
                data-testid="submit-exam-btn"
              >
                Finalizar ({answeredCount}/{totalQuestions})
              </Button>
            </motion.div>
          </div>
        </div>

        {/* Progress */}
        <div className="max-w-6xl mx-auto px-4 pb-3">
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-gradient-to-r from-[#0A2540] to-[#F2B705]"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
            <span className="text-sm text-[#4A5568] dark:text-slate-400">
              {answeredCount}/{totalQuestions}
            </span>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-6 md:p-8"
          >
            {/* Question Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-sm text-[#4A5568] dark:text-slate-400">Pregunta {currentQuestion + 1} de {totalQuestions}</p>
                <p className="text-xs text-[#F2B705] font-medium mt-1">{question?.subject_name}</p>
              </div>
              <div className="flex items-center gap-2">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenReport(question)}
                    className="text-red-500 hover:bg-red-50"
                    data-testid="report-question-btn"
                  >
                    <MessageCircleWarning className="w-4 h-4 mr-1" />
                    Reportar
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant={flagged.has(currentQuestion) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleFlag(currentQuestion)}
                    className={flagged.has(currentQuestion) 
                      ? "bg-amber-500 hover:bg-amber-600 text-white" 
                      : "dark:border-slate-500 dark:text-slate-300 dark:hover:bg-slate-700"
                    }
                    data-testid="flag-question-btn"
                  >
                    <Flag className="w-4 h-4 mr-1" />
                    {flagged.has(currentQuestion) ? "Marcada" : "Marcar"}
                  </Button>
                </motion.div>
              </div>
            </div>

            {/* Reading Text */}
            {question?.reading_text && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-[#F8FAFC] dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600"
              >
                <p className="text-xs font-medium text-[#F2B705] mb-2 uppercase tracking-wider">Texto de Lectura</p>
                <p className="text-[#4A5568] dark:text-slate-300 leading-relaxed whitespace-pre-wrap">{question.reading_text}</p>
              </motion.div>
            )}

            {/* Question Text */}
            <div className="mb-8">
              <h2 className="text-lg font-medium text-[#0A2540] dark:text-white leading-relaxed">
                {question?.text}
              </h2>
              {question?.image_url && (
                <motion.img 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  src={question.image_url} 
                  alt="Imagen de la pregunta"
                  className="mt-4 max-w-full h-auto max-h-64 rounded-lg border border-slate-200 dark:border-slate-600"
                />
              )}
            </div>

            {/* Options */}
            <div className="space-y-3">
              {question?.options?.map((option, index) => {
                const isSelected = answers[question.question_id] === index;
                const optionImage = question?.option_images?.[index];
                
                return (
                  <motion.button
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.01, x: 4 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => handleAnswer(question.question_id, index)}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                      isSelected 
                        ? "border-[#0A2540] dark:border-[#F2B705] bg-gradient-to-r from-blue-50 to-transparent dark:from-blue-900/30 dark:to-transparent shadow-md" 
                        : "border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700/50 bg-white dark:bg-slate-700"
                    }`}
                    data-testid={`option-${index}`}
                  >
                    <div className="flex items-start gap-3">
                      <motion.span 
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                          isSelected 
                            ? "bg-[#0A2540] dark:bg-[#F2B705] text-white dark:text-[#0A2540]" 
                            : "bg-slate-100 dark:bg-slate-600 text-[#4A5568] dark:text-slate-300"
                        }`}
                        animate={isSelected ? { scale: [1, 1.1, 1] } : {}}
                      >
                        {String.fromCharCode(65 + index)}
                      </motion.span>
                      <div className="flex-1">
                        <span className={`${isSelected ? "text-[#0A2540] dark:text-white font-medium" : "text-[#4A5568] dark:text-slate-300"}`}>
                          {option}
                        </span>
                        {optionImage && (
                          <img 
                            src={optionImage} 
                            alt={`Opción ${String.fromCharCode(65 + index)}`}
                            className="mt-2 max-w-full h-auto max-h-32 rounded"
                          />
                        )}
                      </div>
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        >
                          <CheckCircle className="w-5 h-5 text-[#0A2540] dark:text-[#F2B705]" />
                        </motion.div>
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {/* Navigation */}
            <div className="flex justify-between mt-8 pt-6 border-t border-slate-200 dark:border-slate-600">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                <Button
                  variant="outline"
                  onClick={() => setCurrentQuestion((prev) => Math.max(0, prev - 1))}
                  disabled={currentQuestion === 0}
                  data-testid="prev-question-btn"
                  className="dark:border-slate-600 dark:text-white dark:hover:bg-slate-700"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Anterior
                </Button>
              </motion.div>

              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                <Button
                  onClick={() => setCurrentQuestion((prev) => Math.min(totalQuestions - 1, prev + 1))}
                  disabled={currentQuestion === totalQuestions - 1}
                  className="bg-[#0A2540] dark:bg-[#F2B705] dark:text-[#0A2540] dark:hover:bg-[#F2B705]/90 hover:bg-[#0A2540]/90"
                  data-testid="next-question-btn"
                >
                  Siguiente
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Question Navigator */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6 bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4"
        >
          <p className="text-sm font-medium text-[#0A2540] dark:text-white mb-3">Navegación de preguntas</p>
          <div className="flex flex-wrap gap-2">
            {examData?.questions?.map((_, index) => {
              const isAnswered = answers[examData.questions[index].question_id] !== undefined;
              const isFlagged = flagged.has(index);
              const isCurrent = currentQuestion === index;
              
              return (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setCurrentQuestion(index)}
                  className={`w-10 h-10 rounded-lg text-sm font-medium transition-all ${
                    isCurrent 
                      ? "bg-[#0A2540] text-white shadow-lg" 
                      : isAnswered 
                        ? "bg-[#10B981] text-white" 
                        : "bg-slate-100 dark:bg-slate-700 text-[#4A5568] dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
                  } ${isFlagged ? "ring-2 ring-amber-500 ring-offset-1" : ""}`}
                  data-testid={`question-nav-${index}`}
                >
                  {index + 1}
                </motion.button>
              );
            })}
          </div>
          <div className="flex gap-4 mt-4 text-xs text-[#4A5568] dark:text-slate-400">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-[#10B981]"></span>
              Respondida
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-slate-100 dark:bg-slate-700"></span>
              Sin responder
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-slate-100 dark:bg-slate-700 ring-2 ring-amber-500"></span>
              Marcada
            </span>
          </div>
        </motion.div>
      </main>

      {/* Submit Dialog */}
      <AlertDialog 
        open={showSubmitDialog} 
        onOpenChange={(open) => {
          // Solo permitir cerrar manualmente si no está enviando
          if (!submitting || !open) {
            setShowSubmitDialog(open);
          }
        }}
      >
        <AlertDialogContent className="bg-white dark:bg-slate-800 border dark:border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 dark:text-white">
              {submitting ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full"
                />
              ) : (
                <AlertTriangle className="w-5 h-5 text-amber-500" />
              )}
              {submitting ? "Enviando examen..." : "¿Enviar examen?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {submitting ? (
                <div className="space-y-3">
                  <p className="text-[#4A5568] dark:text-slate-300">Por favor espera mientras procesamos tus respuestas...</p>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                    <motion.div 
                      className="h-full bg-[#F2B705]"
                      initial={{ width: "0%" }}
                      animate={{ width: ["0%", "50%", "100%"] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    />
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">No cierres esta ventana</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <p>Has respondido <strong>{answeredCount}</strong> de <strong>{totalQuestions}</strong> preguntas.</p>
                  {flagged.size > 0 && (
                    <p className="text-amber-500">
                      Tienes {flagged.size} pregunta(s) marcada(s) para revisión.
                    </p>
                  )}
                  <p className="text-sm text-[#4A5568] dark:text-slate-300">
                    Una vez enviado, no podrás modificar tus respuestas.
                  </p>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {!submitting && (
            <AlertDialogFooter>
              <AlertDialogCancel onClick={(e) => {
                e.preventDefault();
                setShowSubmitDialog(false);
              }} className="dark:border-slate-600 dark:text-white dark:hover:bg-slate-700">
                Revisar respuestas
              </AlertDialogCancel>
              <Button
                onClick={(e) => {
                  e.preventDefault();
                  handleSubmit();
                }}
                className="bg-[#0A2540] dark:bg-[#F2B705] dark:text-[#0A2540] dark:hover:bg-[#F2B705]/90 hover:bg-[#0A2540]/90"
                data-testid="confirm-submit-btn"
              >
                Enviar examen
              </Button>
            </AlertDialogFooter>
          )}
        </AlertDialogContent>
      </AlertDialog>

      {/* Time Warning Dialog */}
      <AlertDialog open={showTimeWarning} onOpenChange={setShowTimeWarning}>
        <AlertDialogContent className="bg-white dark:bg-slate-800 border dark:border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-amber-500">
              <Clock className="w-5 h-5" />
              ¡Quedan 5 minutos!
            </AlertDialogTitle>
            <AlertDialogDescription>
              Te quedan solo 5 minutos para completar el examen. 
              Asegúrate de revisar tus respuestas antes de que el tiempo termine.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction className="bg-[#0A2540]">
              Entendido
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Exit Confirmation Dialog */}
      <AlertDialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <AlertDialogContent className="bg-white dark:bg-slate-800 border dark:border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-[#0A2540] dark:text-white">
              <LogOut className="w-5 h-5" />
              ¿Salir del examen?
            </AlertDialogTitle>
            <AlertDialogDescription className="dark:text-slate-300">
              <div className="space-y-3">
                <p>Tu progreso se guardará automáticamente y podrás continuar después.</p>
                <div className="p-3 bg-[#F5F7FA] dark:bg-slate-700 rounded-lg">
                  <p className="text-[#0A2540] dark:text-white text-sm">
                    <strong>Progreso actual:</strong> {answeredCount} de {totalQuestions} preguntas respondidas
                  </p>
                  <p className="text-[#4A5568] dark:text-slate-300 text-sm mt-1">
                    <strong>Tiempo restante:</strong> {formatTime(timeLeft)}
                  </p>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="dark:border-slate-600 dark:text-white dark:hover:bg-slate-700">Continuar examen</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleExitWithSave}
              className="bg-[#F2B705] text-[#0A2540] hover:bg-[#F2B705]/90"
              data-testid="confirm-exit-btn"
            >
              <Save className="w-4 h-4 mr-1" />
              Guardar y salir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Report Question Dialog */}
      <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
        <DialogContent className="max-w-md bg-white dark:bg-slate-800 border dark:border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-[#0A2540] dark:text-white">
              Reportar Problema
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <p className="text-sm text-gray-600 dark:text-slate-300">
              ¿Qué problema encontraste con esta pregunta?
            </p>

            <div className="space-y-2">
              {[
                { value: "incorrect_answer", label: "La respuesta correcta está mal" },
                { value: "unclear_text", label: "El texto es confuso o tiene errores" },
                { value: "wrong_subject", label: "Está en la materia incorrecta" },
                { value: "typo", label: "Tiene errores de escritura" },
                { value: "other", label: "Otro problema" }
              ].map((option, idx) => (
                <motion.button
                  key={option.value}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => setReportReason(option.value)}
                  className={`w-full flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                    reportReason === option.value
                      ? "border-red-400 bg-red-50 dark:bg-red-900/20"
                      : "border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 bg-white dark:bg-slate-700"
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    reportReason === option.value ? "border-red-500" : "border-slate-300 dark:border-slate-500"
                  }`}>
                    {reportReason === option.value && (
                      <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-2 h-2 rounded-full bg-red-500" 
                      />
                    )}
                  </div>
                  <span className="text-sm text-[#0A2540] dark:text-white">{option.label}</span>
                </motion.button>
              ))}
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700 dark:text-slate-300">
                Detalles adicionales (opcional)
              </Label>
              <Textarea
                value={reportDetails}
                onChange={(e) => setReportDetails(e.target.value)}
                placeholder="Describe el problema con más detalle..."
                className="bg-white dark:bg-slate-700 border-gray-300 dark:border-slate-600 min-h-[80px] dark:text-white"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowReportDialog(false)} className="dark:border-slate-600 dark:text-white dark:hover:bg-slate-700">
              Cancelar
            </Button>
            <Button
              onClick={handleSubmitReport}
              disabled={!reportReason || submittingReport}
              className="bg-red-600 dark:bg-red-500 dark:hover:bg-red-600 hover:bg-red-700"
            >
              {submittingReport ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Enviando...
                </>
              ) : (
                <>
                  <MessageCircleWarning className="w-4 h-4 mr-2" />
                  Enviar Reporte
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Exam;
