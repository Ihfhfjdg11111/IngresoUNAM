import { useState, useEffect, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, CheckCircle, XCircle, ChevronLeft, ChevronRight, 
  Lightbulb, BookOpen, Play, Filter, Clock
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { AuthContext, API } from "../App";
import { toast } from "sonner";
import Sidebar from "../components/Sidebar";

const SubjectPractice = () => {
  const navigate = useNavigate();
  const { subjectId } = useParams();
  const { user } = useContext(AuthContext);
  
  // Setup phase
  const [setupPhase, setSetupPhase] = useState(true);
  const [questionCount, setQuestionCount] = useState(10);
  const [availableCount, setAvailableCount] = useState(0);
  
  // Practice phase
  const [practiceId, setPracticeId] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [answered, setAnswered] = useState(false);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [subjectName, setSubjectName] = useState("");
  
  // Results phase
  const [resultsPhase, setResultsPhase] = useState(false);
  const [results, setResults] = useState(null);
  const [resultFilter, setResultFilter] = useState("all");

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchSubjectInfo();
  }, [subjectId]);

  const fetchSubjectInfo = async () => {
    try {
      const response = await fetch(`${API}/subjects`, {
        headers: { "Authorization": `Bearer ${token}` },
        credentials: "include"
      });

      if (response.ok) {
        const subjects = await response.json();
        const subject = subjects.find(s => s.subject_id === subjectId);
        if (subject) {
          setSubjectName(subject.name);
          setAvailableCount(subject.question_count);
          setQuestionCount(Math.min(10, subject.question_count));
        }
      }
    } catch (error) {
      // Error silenciado
    } finally {
      setLoading(false);
    }
  };

  const startPractice = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API}/practice/start`, {
        method: "POST",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({
          subject_id: subjectId,
          question_count: questionCount
        })
      });

      if (response.ok) {
        const data = await response.json();
        setPracticeId(data.practice_id);
        setQuestions(data.questions);
        setSetupPhase(false);
        toast.success(`Práctica iniciada con ${data.questions.length} preguntas`);
      } else {
        const error = await response.json();
        toast.error(error.detail || "Error al iniciar práctica");
      }
    } catch (error) {
      toast.error("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  const submitPractice = async () => {
    setLoading(true);
    try {
      const answersArray = Object.entries(answers).map(([questionId, selectedOption]) => ({
        question_id: questionId,
        selected_option: selectedOption
      }));

      const response = await fetch(`${API}/practice/${practiceId}/submit`, {
        method: "POST",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({ answers: answersArray })
      });

      if (response.ok) {
        const data = await response.json();
        setResults(data);
        setResultsPhase(true);
        toast.success("Práctica completada");
      } else {
        toast.error("Error al enviar práctica");
      }
    } catch (error) {
      toast.error("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (optionIndex) => {
    const question = questions[currentIndex];
    setSelectedAnswer(optionIndex);
    setAnswered(true);
    
    // Store answer (allows changing answers)
    setAnswers(prev => ({
      ...prev,
      [question.question_id]: optionIndex
    }));
  };

  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedAnswer(answers[questions[currentIndex + 1]?.question_id] ?? null);
      setShowExplanation(false);
      setAnswered(answers[questions[currentIndex + 1]?.question_id] !== undefined);
    }
  };

  const prevQuestion = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setSelectedAnswer(answers[questions[currentIndex - 1]?.question_id] ?? null);
      setShowExplanation(false);
      setAnswered(answers[questions[currentIndex - 1]?.question_id] !== undefined);
    }
  };

  const getFilteredResults = () => {
    if (!results?.results) return [];
    switch (resultFilter) {
      case "correct":
        return results.results.filter(r => r.is_correct);
      case "incorrect":
        return results.results.filter(r => !r.is_correct);
      default:
        return results.results;
    }
  };

  if (loading) {
    return (
      <>
        <Sidebar />
        <div className="lg:ml-64 min-h-screen">
          <div className="min-h-screen bg-[#F5F7FA] dark:bg-slate-900 flex items-center justify-center">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-12 h-12 border-4 border-[#0A2540] dark:border-slate-600 border-t-[#F2B705] rounded-full"
            />
          </div>
        </div>
      </>
    );
  }

  // Setup Phase - Select number of questions
  if (setupPhase) {
    return (
      <>
        <Sidebar />
        <div className="lg:ml-64 min-h-screen">
          <div className="min-h-screen bg-[#F5F7FA] dark:bg-slate-900 transition-colors duration-300">
            <motion.header 
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-40"
            >
              <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                  <Button variant="ghost" size="icon" onClick={() => navigate("/subjects")}>
                    <ArrowLeft className="w-5 h-5 dark:text-white" />
                  </Button>
                </motion.div>
                <div>
                  <h1 className="font-bold text-[#0A2540] dark:text-white">Práctica: {subjectName}</h1>
                  <p className="text-xs text-[#4A5568] dark:text-slate-400">{availableCount} preguntas disponibles</p>
                </div>
              </div>
            </motion.header>

            <main className="max-w-md mx-auto px-4 py-12">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-8 text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                >
                  <BookOpen className="w-16 h-16 mx-auto text-[#F2B705] mb-4" />
                </motion.div>
                <h2 className="text-xl font-bold text-[#0A2540] dark:text-white mb-2">Configurar Práctica</h2>
                <p className="text-[#4A5568] dark:text-slate-400 mb-6">Selecciona cuántas preguntas quieres practicar</p>
                
                <div className="space-y-4 mb-8">
                  <Label className="text-left block dark:text-white">Número de preguntas</Label>
                  <Select 
                    value={questionCount.toString()} 
                    onValueChange={(v) => setQuestionCount(parseInt(v))}
                  >
                    <SelectTrigger data-testid="question-count-select" className="dark:bg-slate-700 dark:border-slate-600 dark:text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-slate-800 dark:border-slate-700">
                      {[5, 10, 15, 20, 25, 30].filter(n => n <= availableCount).map(n => (
                        <SelectItem key={n} value={n.toString()}>{n} preguntas</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    onClick={startPractice}
                    className="w-full bg-[#0A2540] dark:bg-[#F2B705] dark:text-[#0A2540] dark:hover:bg-[#F2B705]/90 hover:bg-[#0A2540]/90"
                    data-testid="start-practice-btn"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Comenzar Práctica
                  </Button>
                </motion.div>
              </motion.div>
            </main>
          </div>
        </div>
      </>
    );
  }

  // Results Phase - Show detailed results with filters
  if (resultsPhase && results) {
    const filteredResults = getFilteredResults();
    
    return (
      <>
        <Sidebar />
        <div className="lg:ml-64 min-h-screen">
          <div className="min-h-screen bg-[#F5F7FA] dark:bg-slate-900 transition-colors duration-300">
            <motion.header 
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-40"
            >
              <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                    <Button variant="ghost" size="icon" onClick={() => navigate("/subjects")}>
                      <ArrowLeft className="w-5 h-5 dark:text-white" />
                    </Button>
                  </motion.div>
                  <div>
                    <h1 className="font-bold text-[#0A2540] dark:text-white">Resultados: {results.subject_name}</h1>
                    <p className="text-xs text-[#4A5568] dark:text-slate-400">{results.score}/{results.total} correctas</p>
                  </div>
                </div>
              </div>
            </motion.header>

            <main className="max-w-4xl mx-auto px-4 py-8">
              {/* Score Summary */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 mb-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-[#0A2540] dark:text-white">Resumen</h2>
                  <motion.span 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200 }}
                    className={`text-2xl font-bold ${results.percentage >= 60 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}
                  >
                    {results.percentage}%
                  </motion.span>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-center p-3 bg-slate-100 dark:bg-slate-700 rounded-lg"
                  >
                    <p className="text-2xl font-bold text-[#0A2540] dark:text-white">{results.total}</p>
                    <p className="text-xs text-[#4A5568] dark:text-slate-400">Total</p>
                  </motion.div>
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-center p-3 bg-green-100 dark:bg-green-900/30 rounded-lg"
                  >
                    <p className="text-2xl font-bold text-[#10B981]">{results.score}</p>
                    <p className="text-xs text-[#4A5568] dark:text-slate-400">Correctas</p>
                  </motion.div>
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-center p-3 bg-red-100 dark:bg-red-900/30 rounded-lg"
                  >
                    <p className="text-2xl font-bold text-[#EF4444]">{results.total - results.score}</p>
                    <p className="text-xs text-[#4A5568] dark:text-slate-400">Incorrectas</p>
                  </motion.div>
                </div>
              </motion.div>

              {/* Filter */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 mb-6"
              >
                <div className="flex items-center gap-4">
                  <Filter className="w-4 h-4 text-[#4A5568] dark:text-slate-400" />
                  <div className="flex gap-2">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button 
                        size="sm" 
                        variant={resultFilter === "all" ? "default" : "outline"}
                        onClick={() => setResultFilter("all")}
                        data-testid="filter-all"
                        className={resultFilter !== "all" ? "dark:border-slate-600 dark:text-white dark:hover:bg-slate-700" : ""}
                      >
                        Todas ({results.results.length})
                      </Button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button 
                        size="sm" 
                        variant={resultFilter === "correct" ? "default" : "outline"}
                        onClick={() => setResultFilter("correct")}
                        className={resultFilter === "correct" ? "bg-[#10B981]" : "dark:border-slate-600 dark:text-white dark:hover:bg-slate-700"}
                        data-testid="filter-correct"
                      >
                        Correctas ({results.results.filter(r => r.is_correct).length})
                      </Button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button 
                        size="sm" 
                        variant={resultFilter === "incorrect" ? "default" : "outline"}
                        onClick={() => setResultFilter("incorrect")}
                        className={resultFilter === "incorrect" ? "bg-[#EF4444]" : "dark:border-slate-600 dark:text-white dark:hover:bg-slate-700"}
                        data-testid="filter-incorrect"
                      >
                        Incorrectas ({results.results.filter(r => !r.is_correct).length})
                      </Button>
                    </motion.div>
                  </div>
                </div>
              </motion.div>

              {/* Questions Review */}
              <div className="space-y-4">
                <AnimatePresence mode="wait">
                  {filteredResults.map((result, index) => (
                    <motion.div 
                      key={result.question_id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.05 }}
                      className={`bg-white dark:bg-slate-800 rounded-xl shadow-sm p-5 border-l-4 ${
                        result.is_correct ? 'border-[#10B981]' : 'border-[#EF4444]'
                      }`}
                      data-testid={`result-${result.question_id}`}
                    >
                      <div className="flex items-start gap-3 mb-4">
                        {result.is_correct ? (
                          <CheckCircle className="w-5 h-5 text-[#10B981] flex-shrink-0 mt-1" />
                        ) : (
                          <XCircle className="w-5 h-5 text-[#EF4444] flex-shrink-0 mt-1" />
                        )}
                        <div>
                          <p className="text-xs text-[#F2B705] font-medium mb-1">{result.topic}</p>
                          <p className="text-[#0A2540] dark:text-white font-medium">{result.question_text}</p>
                        </div>
                      </div>

                      <div className="ml-8 space-y-2 mb-4">
                        {result.options.map((opt, optIndex) => {
                          const isCorrect = optIndex === result.correct_answer;
                          const isSelected = optIndex === result.selected_option;
                          let className = "p-2 rounded text-sm ";
                          
                          if (isCorrect) {
                            className += "bg-green-100 dark:bg-green-900/30 text-[#10B981] font-medium";
                          } else if (isSelected && !isCorrect) {
                            className += "bg-red-100 dark:bg-red-900/30 text-[#EF4444] line-through";
                          } else {
                            className += "bg-slate-50 dark:bg-slate-700 text-[#4A5568] dark:text-slate-400";
                          }
                          
                          return (
                            <motion.div 
                              key={optIndex} 
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: optIndex * 0.05 }}
                              className={className}
                            >
                              <span className="font-medium mr-2">{String.fromCharCode(65 + optIndex)}.</span>
                              {opt}
                              {isCorrect && " ✓"}
                              {isSelected && !isCorrect && " (tu respuesta)"}
                            </motion.div>
                          );
                        })}
                      </div>

                      {result.explanation && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          className="ml-8 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800/50"
                        >
                          <p className="text-xs font-medium text-[#0A2540] dark:text-amber-200 mb-1">Explicación:</p>
                          <p className="text-sm text-[#4A5568] dark:text-slate-400">{result.explanation}</p>
                        </motion.div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Actions */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-8 flex gap-4"
              >
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
                  <Button
                    onClick={() => navigate("/subjects")}
                    variant="outline"
                    className="w-full dark:border-slate-600 dark:text-white dark:hover:bg-slate-700"
                  >
                    Volver a Materias
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
                  <Button
                    onClick={() => {
                      setSetupPhase(true);
                      setResultsPhase(false);
                      setAnswers({});
                      // Reset practice state
                      setCurrentIndex(0);
                    }}
                    className="w-full bg-[#0A2540] hover:bg-[#0A2540]/90"
                    data-testid="retry-practice-btn"
                  >
                    Nueva Práctica
                  </Button>
                </motion.div>
              </motion.div>
            </main>
          </div>
        </div>
      </>
    );
  }

  if (questions.length === 0) {
    return (
      <>
        <Sidebar />
        <div className="lg:ml-64 min-h-screen">
          <div className="min-h-screen bg-[#F5F7FA] dark:bg-slate-900 flex items-center justify-center">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <BookOpen className="w-16 h-16 mx-auto text-[#4A5568]/30 dark:text-slate-600 mb-4" />
              </motion.div>
              <p className="text-[#4A5568] dark:text-slate-400 mb-4">No hay preguntas disponibles para esta materia.</p>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button onClick={() => navigate("/subjects")} className="dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600">Volver a Materias</Button>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </>
    );
  }

  const question = questions[currentIndex];
  const answeredCount = Object.keys(answers).length;
  const allAnswered = answeredCount === questions.length;
  const progressPercentage = (answeredCount / questions.length) * 100;

  // Practice Phase - Answer questions
  return (
    <>
      <Sidebar />
      <div className="lg:ml-64 min-h-screen">
        <div className="min-h-screen bg-[#F5F7FA] dark:bg-slate-900 flex flex-col transition-colors duration-300">
          {/* Header */}
          <motion.header 
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 sticky top-0 z-40"
          >
            <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate("/subjects")}
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </Button>
                </motion.div>
                <div>
                  <h1 className="font-bold text-[#0A2540] dark:text-white">{subjectName}</h1>
                  <p className="text-xs text-[#4A5568] dark:text-slate-400">
                    Pregunta {currentIndex + 1} de {questions.length}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-[#4A5568] dark:text-slate-400">{answeredCount}/{questions.length}</span>
                </div>
                {allAnswered && (
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      onClick={submitPractice}
                      className="bg-[#F2B705] text-[#0A2540] hover:bg-[#F2B705]/90"
                      data-testid="submit-practice-btn"
                    >
                      Ver Resultados
                    </Button>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Progress */}
            <div className="max-w-4xl mx-auto px-4 pb-3">
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
                  {answeredCount}/{questions.length}
                </span>
              </div>
            </div>
          </motion.header>

          {/* Main Content */}
          <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-6 md:p-8"
              >
                {/* Question Header */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-sm text-[#4A5568] dark:text-slate-400">Pregunta {currentIndex + 1} de {questions.length}</p>
                    <p className="text-xs text-[#F2B705] font-medium mt-1">{question?.subject_name}</p>
                  </div>
                </div>

                {/* Topic */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4"
                >
                  <p className="text-sm text-[#F2B705] font-medium">{question.topic}</p>
                </motion.div>
                
                {/* Question */}
                <div className="mb-8">
                  <h2 className="text-lg font-medium text-[#0A2540] dark:text-white leading-relaxed">
                    {question.text}
                  </h2>
                  {question.image_url && (
                    <motion.img 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      src={question.image_url} 
                      alt="Imagen de la pregunta"
                      className="mt-4 max-w-full h-auto max-h-64 rounded-lg border border-slate-200 dark:border-slate-600"
                    />
                  )}
                </div>

                {/* Reading Text */}
                {question.reading_text && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <BookOpen className="w-4 h-4 text-[#0A2540] dark:text-[#F2B705]" />
                      <span className="text-xs font-medium text-[#0A2540] dark:text-[#F2B705]">Texto de lectura</span>
                    </div>
                    <p className="text-sm text-[#4A5568] dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                      {question.reading_text}
                    </p>
                  </motion.div>
                )}

                {/* Options */}
                <div className="space-y-3">
                  {question.options.map((option, index) => {
                    const isSelected = answers[question.question_id] === index;
                    
                    return (
                      <motion.button
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ scale: 1.01, x: 4 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => handleAnswer(index)}
                        className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                          isSelected 
                            ? "border-[#0A2540] dark:border-[#F2B705] bg-gradient-to-r from-blue-50 to-transparent dark:from-blue-900/30 dark:to-transparent shadow-md" 
                            : "border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700 bg-white dark:bg-slate-800"
                        }`}
                        data-testid={`practice-option-${index}`}
                      >
                        <div className="flex items-start gap-3">
                          <motion.span 
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                              isSelected 
                                ? "bg-[#0A2540] text-white" 
                                : "bg-slate-100 dark:bg-slate-700 text-[#4A5568] dark:text-slate-400"
                            }`}
                            animate={isSelected ? { scale: [1, 1.1, 1] } : {}}
                          >
                            {String.fromCharCode(65 + index)}
                          </motion.span>
                          <div className="flex-1">
                            <span className={`${isSelected ? "text-[#0A2540] dark:text-white font-medium" : "text-[#4A5568] dark:text-slate-400"}`}>
                              {option}
                            </span>
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
                <div className="flex justify-between mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      variant="outline"
                      onClick={prevQuestion}
                      disabled={currentIndex === 0}
                      className="dark:border-slate-600 dark:text-white dark:hover:bg-slate-700"
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      Anterior
                    </Button>
                  </motion.div>

                  <div className="flex gap-2">
                    {currentIndex < questions.length - 1 ? (
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                        <Button
                          onClick={nextQuestion}
                          className="bg-[#0A2540] dark:bg-[#1e3a5f] dark:hover:bg-[#2a4a6f] hover:bg-[#0A2540]/90"
                          data-testid="next-practice-btn"
                        >
                          Siguiente
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                      </motion.div>
                    ) : allAnswered ? (
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                        <Button
                          onClick={submitPractice}
                          className="bg-[#F2B705] text-[#0A2540] hover:bg-[#F2B705]/90"
                          data-testid="finish-practice-btn"
                        >
                          Finalizar Práctica
                        </Button>
                      </motion.div>
                    ) : (
                      <p className="text-sm text-[#4A5568] dark:text-slate-400 py-2">
                        Responde todas las preguntas para ver resultados
                      </p>
                    )}
                  </div>
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
              <p className="text-sm font-medium text-[#0A2540] dark:text-white mb-3">Navegación rápida</p>
              <div className="flex flex-wrap gap-2">
                {questions.map((q, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setCurrentIndex(index);
                      setSelectedAnswer(answers[q.question_id] ?? null);
                      setAnswered(answers[q.question_id] !== undefined);
                    }}
                    className={`w-10 h-10 rounded-lg text-sm font-medium transition-all ${
                      index === currentIndex 
                        ? "bg-[#0A2540] text-white shadow-lg" 
                        : answers[q.question_id] !== undefined 
                          ? "bg-[#10B981] text-white" 
                          : "bg-slate-100 dark:bg-slate-700 text-[#4A5568] dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600"
                    }`}
                    data-testid={`nav-${index}`}
                  >
                    {index + 1}
                  </motion.button>
                ))}
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
              </div>
            </motion.div>
          </main>
        </div>
      </div>
    </>
  );
};

export default SubjectPractice;
