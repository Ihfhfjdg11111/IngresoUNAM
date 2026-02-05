import { useState, useEffect, useContext } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, Pencil, Trash2, Search, ArrowLeft, X, Image,
  Upload, FileText, Download, CheckSquare, Square, AlertTriangle
} from "lucide-react";
import { Button } from "../../components/ui/button";
import Sidebar from "../../components/Sidebar";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../components/ui/alert-dialog";
import { AuthContext, API } from "../../App";
import { toast } from "sonner";
import { FadeIn } from "../../components";

const AdminQuestions = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [questions, setQuestions] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterSubject, setFilterSubject] = useState("");
  
  const [dialogOpen, setDialogOpen] = useState(searchParams.get("new") === "true");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bulkImportOpen, setBulkImportOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [questionToDelete, setQuestionToDelete] = useState(null);
  const [selectedQuestions, setSelectedQuestions] = useState(new Set());
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [quickDeleteMode, setQuickDeleteMode] = useState(false);
  const [importData, setImportData] = useState("");
  const [importFormat, setImportFormat] = useState("json");
  const [importing, setImporting] = useState(false);
  const [readingTexts, setReadingTexts] = useState([]);
  
  const [formData, setFormData] = useState({
    subject_id: "",
    topic: "",
    text: "",
    options: ["", "", "", ""],
    correct_answer: 0,
    explanation: "",
    image_url: "",
    option_images: ["", "", "", ""],
    reading_text_id: ""
  });

  const token = localStorage.getItem("token");
  const headers = { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [questionsRes, subjectsRes, textsRes] = await Promise.all([
        fetch(`${API}/questions?limit=500`, { headers, credentials: "include" }),
        fetch(`${API}/subjects`, { headers, credentials: "include" }),
        fetch(`${API}/admin/reading-texts`, { headers, credentials: "include" })
      ]);

      if (questionsRes.ok) setQuestions(await questionsRes.json());
      if (subjectsRes.ok) setSubjects(await subjectsRes.json());
      if (textsRes.ok) setReadingTexts(await textsRes.json());
    } catch (error) {
      // Error silenciado
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch(`${API}/auth/logout`, { method: "POST", credentials: "include" });
    } catch (error) {
      console.error("Logout error:", error);
    }
    localStorage.clear();
    navigate("/");
  };

  const resetForm = () => {
    setFormData({
      subject_id: "",
      topic: "",
      text: "",
      options: ["", "", "", ""],
      correct_answer: 0,
      explanation: "",
      image_url: "",
      option_images: ["", "", "", ""],
      reading_text_id: ""
    });
    setEditingQuestion(null);
  };

  const openNewDialog = () => {
    resetForm();
    setDialogOpen(true);
  };

  const openEditDialog = (question) => {
    setEditingQuestion(question);
    setFormData({
      subject_id: question.subject_id,
      topic: question.topic,
      text: question.text,
      options: [...question.options],
      correct_answer: question.correct_answer,
      explanation: question.explanation || "",
      image_url: question.image_url || "",
      option_images: question.option_images || ["", "", "", ""],
      reading_text_id: question.reading_text_id || ""
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.options.some(opt => !opt.trim())) {
      toast.error("Todas las opciones son requeridas");
      return;
    }

    // Prepare data - only include non-empty image URLs
    const submitData = {
      ...formData,
      image_url: formData.image_url?.trim() || null,
      option_images: formData.option_images.map(img => img?.trim() || null),
      reading_text_id: formData.reading_text_id || null
    };

    try {
      const url = editingQuestion 
        ? `${API}/admin/questions/${editingQuestion.question_id}`
        : `${API}/admin/questions`;
      
      const method = editingQuestion ? "PUT" : "POST";
      
      const response = await fetch(url, {
        method,
        headers,
        credentials: "include",
        body: JSON.stringify(submitData)
      });

      if (response.ok) {
        toast.success(editingQuestion ? "Pregunta actualizada" : "Pregunta creada");
        setDialogOpen(false);
        resetForm();
        fetchData();
      } else {
        const error = await response.json();
        toast.error(error.detail || "Error al guardar");
      }
    } catch (error) {
      toast.error("Error de conexión");
    }
  };

  const handleDelete = async () => {
    if (!questionToDelete) return;
    
    try {
      const response = await fetch(`${API}/admin/questions/${questionToDelete.question_id}`, {
        method: "DELETE",
        headers,
        credentials: "include"
      });

      if (response.ok) {
        toast.success("Pregunta eliminada");
        setDeleteDialogOpen(false);
        setQuestionToDelete(null);
        fetchData();
      } else {
        toast.error("Error al eliminar");
      }
    } catch (error) {
      toast.error("Error de conexión");
    }
  };

  const handleQuickDelete = async (question, e) => {
    if (e.shiftKey || quickDeleteMode) {
      // Delete immediately without confirmation
      try {
        const response = await fetch(`${API}/admin/questions/${question.question_id}`, {
          method: "DELETE",
          headers,
          credentials: "include"
        });

        if (response.ok) {
          toast.success(`Pregunta eliminada rápidamente`);
          fetchData();
        } else {
          toast.error("Error al eliminar");
        }
      } catch (error) {
        toast.error("Error de conexión");
      }
    } else {
      setQuestionToDelete(question);
      setDeleteDialogOpen(true);
    }
  };

  const toggleQuestionSelection = (questionId) => {
    setSelectedQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  };

  const selectAllQuestions = () => {
    if (selectedQuestions.size === filteredQuestions.length) {
      setSelectedQuestions(new Set());
    } else {
      setSelectedQuestions(new Set(filteredQuestions.map(q => q.question_id)));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedQuestions.size === 0) return;
    
    let deleted = 0;
    let failed = 0;
    
    for (const questionId of selectedQuestions) {
      try {
        const response = await fetch(`${API}/admin/questions/${questionId}`, {
          method: "DELETE",
          headers,
          credentials: "include"
        });

        if (response.ok) {
          deleted++;
        } else {
          failed++;
        }
      } catch (error) {
        failed++;
      }
    }
    
    if (deleted > 0) {
      toast.success(`${deleted} preguntas eliminadas`);
    }
    if (failed > 0) {
      toast.error(`${failed} preguntas no se pudieron eliminar`);
    }
    
    setSelectedQuestions(new Set());
    setBulkDeleteDialogOpen(false);
    fetchData();
  };

  const parseCSV = (csvText) => {
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) throw new Error("CSV debe tener encabezados y al menos una fila");
    
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const requiredHeaders = ['subject_id', 'topic', 'text', 'option_a', 'option_b', 'option_c', 'option_d', 'correct_answer', 'explanation'];
    
    for (const req of requiredHeaders) {
      if (!headers.includes(req)) {
        throw new Error(`Falta columna requerida: ${req}`);
      }
    }
    
    const questions = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      if (values.length < headers.length) continue;
      
      const row = {};
      headers.forEach((h, idx) => row[h] = values[idx]);
      
      questions.push({
        subject_id: row.subject_id,
        topic: row.topic,
        text: row.text,
        options: [row.option_a, row.option_b, row.option_c, row.option_d],
        correct_answer: parseInt(row.correct_answer),
        explanation: row.explanation,
        image_url: row.image_url || null
      });
    }
    
    return questions;
  };

  const handleBulkImport = async () => {
    if (!importData.trim()) {
      toast.error("Ingresa los datos a importar");
      return;
    }
    
    setImporting(true);
    try {
      let questions;
      
      if (importFormat === "json") {
        const parsed = JSON.parse(importData);
        questions = Array.isArray(parsed) ? parsed : parsed.questions;
      } else {
        questions = parseCSV(importData);
      }
      
      if (!questions || questions.length === 0) {
        toast.error("No se encontraron preguntas válidas");
        setImporting(false);
        return;
      }
      
      const response = await fetch(`${API}/admin/questions/bulk`, {
        method: "POST",
        headers,
        credentials: "include",
        body: JSON.stringify({ questions })
      });
      
      const result = await response.json();
      
      if (response.ok) {
        toast.success(`${result.imported} preguntas importadas`);
        if (result.errors?.length > 0) {
          toast.warning(`${result.errors.length} errores encontrados`);
        }
        setBulkImportOpen(false);
        setImportData("");
        fetchData();
      } else {
        toast.error(result.detail || "Error en importación");
      }
    } catch (error) {
      toast.error(`Error de formato: ${error.message}`);
    } finally {
      setImporting(false);
    }
  };

  const downloadTemplate = (format) => {
    let content, filename, type;
    
    if (format === "json") {
      content = JSON.stringify({
        questions: [
          {
            subject_id: "subj_matematicas",
            topic: "Álgebra",
            text: "¿Cuál es el resultado de 2+2?",
            options: ["3", "4", "5", "6"],
            correct_answer: 1,
            explanation: "2+2=4",
            image_url: null
          }
        ]
      }, null, 2);
      filename = "plantilla_preguntas.json";
      type = "application/json";
    } else {
      content = "subject_id,topic,text,option_a,option_b,option_c,option_d,correct_answer,explanation,image_url\nsubj_matematicas,Álgebra,¿Cuál es el resultado de 2+2?,3,4,5,6,1,2+2=4,";
      filename = "plantilla_preguntas.csv";
      type = "text/csv";
    }
    
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredQuestions = questions.filter(q => {
    const matchesSearch = q.text.toLowerCase().includes(search.toLowerCase()) ||
                         q.topic.toLowerCase().includes(search.toLowerCase());
    const matchesSubject = !filterSubject || filterSubject === "all" || q.subject_id === filterSubject;
    return matchesSearch && matchesSubject;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F7FA] dark:bg-slate-900 flex items-center justify-center transition-colors duration-300">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-[#0A2540] border-t-[#F2B705] rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F7FA] dark:bg-slate-900 transition-colors duration-300">
      <Sidebar isAdmin={true} />

      {/* Main Content */}
      <div className="lg:ml-64 min-h-screen">
      <main className="p-6 md:p-8">
        {/* Mobile Header */}
        <FadeIn>
          <div className="lg:hidden flex items-center gap-4 mb-6">
            <Button variant="ghost" size="icon" onClick={() => navigate("/admin")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-bold text-[#0A2540] dark:text-white">Preguntas</h1>
          </div>
        </FadeIn>

        {/* Header */}
        <FadeIn delay={0.05}>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-[#0A2540] dark:text-white font-[Poppins] hidden lg:block">
                Banco de Preguntas
              </h1>
              <p className="text-[#4A5568] dark:text-slate-400 mt-1">
                {filteredQuestions.length} preguntas encontradas
              </p>
            </div>
            <div className="flex gap-2">
              <div>
                <Button
                  onClick={() => setBulkImportOpen(true)}
                  variant="outline"
                  className="border-[#0A2540] text-[#0A2540]"
                  data-testid="bulk-import-btn"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Importar
                </Button>
              </div>
              <div>
                <Button
                  onClick={openNewDialog}
                  className="bg-[#F2B705] text-[#0A2540] hover:bg-[#F2B705]/90 shadow-lg shadow-[#F2B705]/20"
                  data-testid="add-question-btn"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Nueva Pregunta
                </Button>
              </div>
            </div>
          </div>
        </FadeIn>

        {/* Filters & Bulk Actions */}
        <FadeIn delay={0.1}>
          <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm mb-6 flex flex-col md:flex-row gap-4 border border-slate-100 dark:border-slate-700">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4A5568] dark:text-slate-400" />
              <Input
                placeholder="Buscar por texto o tema..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
                data-testid="search-questions"
              />
            </div>
            <Select value={filterSubject} onValueChange={setFilterSubject}>
              <SelectTrigger className="w-full md:w-[200px] bg-white dark:bg-slate-800" data-testid="filter-subject">
                <SelectValue placeholder="Filtrar por materia" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-slate-800">
                <SelectItem value="all">Todas las materias</SelectItem>
                {subjects.map((s) => (
                  <SelectItem key={s.subject_id} value={s.subject_id}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Selection Bar */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <button
                onClick={selectAllQuestions}
                className="flex items-center gap-2 text-sm text-[#0A2540] dark:text-white hover:text-[#F2B705] transition-colors"
              >
                {selectedQuestions.size === filteredQuestions.length && filteredQuestions.length > 0 ? (
                  <CheckSquare className="w-5 h-5" />
                ) : (
                  <Square className="w-5 h-5" />
                )}
                {selectedQuestions.size > 0 
                  ? `${selectedQuestions.size} seleccionadas` 
                  : "Seleccionar todas"}
              </button>
              
              {selectedQuestions.size > 0 && (
                <button
                  onClick={() => setBulkDeleteDialogOpen(true)}
                  className="flex items-center gap-2 text-sm text-red-500 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Eliminar seleccionadas
                </button>
              )}
            </div>
            
            <button
              onClick={() => setQuickDeleteMode(!quickDeleteMode)}
              className={`flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg transition-colors ${
                quickDeleteMode 
                  ? "bg-red-100 text-red-600" 
                  : "text-[#4A5568] dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
              }`}
              title="Haz Shift+Click en el botón de basura para eliminar sin confirmar"
            >
              <AlertTriangle className="w-4 h-4" />
              {quickDeleteMode ? "Modo rápido activo" : "Eliminar rápido (Shift+Click)"}
            </button>
          </div>
        </FadeIn>

        {/* Questions List */}
        <div className="space-y-4">
          {filteredQuestions.map((question, index) => {
            const displayId = `P-${question.question_id.replace(/\D/g, '').slice(-4).padStart(4, '0')}`;
            const isSelected = selectedQuestions.has(question.question_id);
            
            return (
              <FadeIn key={question.question_id} delay={0.1 + index * 0.03}>
              <motion.div 
                className={`bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm hover:shadow-md transition-all border dark:border-slate-700 ${
                  isSelected ? "border-[#F2B705] ring-2 ring-[#F2B705]/20" : "border-slate-100"
                }`}
                data-testid={`question-${question.question_id}`}
                whileHover={{ x: 4 }}
              >
                <div className="flex items-start gap-4">
                  {/* Checkbox */}
                  <button
                    onClick={() => toggleQuestionSelection(question.question_id)}
                    className="mt-1 text-[#0A2540] dark:text-white hover:text-[#F2B705] transition-colors"
                  >
                    {isSelected ? (
                      <CheckSquare className="w-5 h-5" />
                    ) : (
                      <Square className="w-5 h-5" />
                    )}
                  </button>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="text-xs font-mono bg-purple-100 text-purple-700 px-2 py-1 rounded font-bold">
                        {displayId}
                      </span>
                      <span className="text-xs px-2 py-1 bg-amber-100 text-[#0A2540] dark:bg-amber-900 dark:text-amber-100 rounded font-medium">
                        {question.subject_name}
                      </span>
                      <span className="text-xs text-[#4A5568] dark:text-slate-400">{question.topic}</span>
                      {question.reading_text_id && (
                        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                          📖 Texto vinculado
                        </span>
                      )}
                    </div>
                    <p className="text-[#0A2540] dark:text-white font-medium line-clamp-2">{question.text}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditDialog(question)}
                      data-testid={`edit-${question.question_id}`}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => handleQuickDelete(question, e)}
                      className={`${
                        quickDeleteMode 
                          ? "text-red-600 bg-red-50" 
                          : "text-red-500 hover:text-red-600"
                      }`}
                      title={quickDeleteMode ? "Click para eliminar sin confirmar" : "Shift+Click para eliminar rápido"}
                      data-testid={`delete-${question.question_id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
              </FadeIn>
            );
          })}
        </div>

        {filteredQuestions.length === 0 && (
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
                <FileQuestion className="w-16 h-16 mx-auto text-[#4A5568]/30 dark:text-slate-500 mb-4" />
              </motion.div>
              <p className="text-[#4A5568] dark:text-slate-400">No se encontraron preguntas</p>
            </motion.div>
          </FadeIn>
        )}
      </main>

      {/* Question Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-800">
          <DialogHeader className="bg-[#0A2540] -mx-6 -mt-6 px-6 py-4 rounded-t-lg">
            <DialogTitle className="font-[Poppins] text-white">
              {editingQuestion ? "Editar Pregunta" : "Nueva Pregunta"}
            </DialogTitle>
            <DialogDescription className="text-white/70">
              Completa todos los campos para {editingQuestion ? "actualizar" : "crear"} la pregunta.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[#0A2540] dark:text-white font-medium">Materia</Label>
                <Select 
                  value={formData.subject_id} 
                  onValueChange={(v) => setFormData({...formData, subject_id: v})}
                >
                  <SelectTrigger className="bg-white dark:bg-slate-800 border-[#0A2540]/20 dark:border-slate-600 focus:border-[#F2B705] focus:ring-[#F2B705]/20" data-testid="question-subject">
                    <SelectValue placeholder="Seleccionar materia" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {subjects.map((s) => (
                      <SelectItem key={s.subject_id} value={s.subject_id}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-[#0A2540] dark:text-white font-medium">Tema</Label>
                <Input
                  value={formData.topic}
                  onChange={(e) => setFormData({...formData, topic: e.target.value})}
                  placeholder="Ej: Álgebra"
                  className="bg-white dark:bg-slate-800 border-[#0A2540]/20 dark:border-slate-600 focus:border-[#F2B705] focus:ring-[#F2B705]/20"
                  data-testid="question-topic"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[#0A2540] dark:text-white font-medium">Pregunta</Label>
              <Textarea
                value={formData.text}
                onChange={(e) => setFormData({...formData, text: e.target.value})}
                placeholder="Escribe la pregunta..."
                rows={3}
                className="bg-white dark:bg-slate-800 border-[#0A2540]/20 dark:border-slate-600 focus:border-[#F2B705] focus:ring-[#F2B705]/20"
                data-testid="question-text"
                required
              />
            </div>

            <div className="space-y-3">
              <Label className="text-[#0A2540] dark:text-white font-medium">Opciones (marca la correcta)</Label>
              {formData.options.map((opt, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="correct_answer"
                    checked={formData.correct_answer === index}
                    onChange={() => setFormData({...formData, correct_answer: index})}
                    className="w-5 h-5 accent-[#F2B705]"
                  />
                  <Input
                    value={opt}
                    onChange={(e) => {
                      const newOptions = [...formData.options];
                      newOptions[index] = e.target.value;
                      setFormData({...formData, options: newOptions});
                    }}
                    placeholder={`Opción ${String.fromCharCode(65 + index)}`}
                    className="bg-white dark:bg-slate-800 border-[#0A2540]/20 dark:border-slate-600 focus:border-[#F2B705] focus:ring-[#F2B705]/20"
                    data-testid={`question-option-${index}`}
                    required
                  />
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <Label className="text-[#0A2540] dark:text-white font-medium">Explicación</Label>
              <Textarea
                value={formData.explanation}
                onChange={(e) => setFormData({...formData, explanation: e.target.value})}
                placeholder="Explicación de la respuesta correcta..."
                rows={2}
                className="bg-white dark:bg-slate-800 border-[#0A2540]/20 dark:border-slate-600 focus:border-[#F2B705] focus:ring-[#F2B705]/20"
                data-testid="question-explanation"
                required
              />
            </div>

            {/* Reading Text Selector */}
            <div className="space-y-2 border-t border-[#0A2540]/10 pt-4 mt-4">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4 text-blue-500" />
                <Label className="text-[#0A2540] dark:text-white font-medium">Texto de Lectura (Opcional)</Label>
              </div>
              <Select 
                value={formData.reading_text_id || "none"} 
                onValueChange={(v) => setFormData({...formData, reading_text_id: v === "none" ? "" : v})}
              >
                <SelectTrigger className="bg-white dark:bg-slate-800 border-[#0A2540]/20 dark:border-slate-600">
                  <SelectValue placeholder="Seleccionar texto de lectura" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-slate-800 max-h-[200px]">
                  <SelectItem value="none">Sin texto de lectura</SelectItem>
                  {readingTexts.map((rt) => {
                    const displayId = `TXT-${rt.reading_text_id.replace(/\D/g, '').slice(-3).padStart(3, '0')}`;
                    return (
                      <SelectItem key={rt.reading_text_id} value={rt.reading_text_id}>
                        <span className="font-mono text-xs text-blue-600 mr-2">{displayId}</span>
                        {rt.title.substring(0, 40)}{rt.title.length > 40 ? '...' : ''}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 dark:text-slate-400">
                Vincula esta pregunta a un texto de lectura compartido. 
                <button 
                  type="button"
                  onClick={() => navigate("/admin/reading-texts")}
                  className="text-blue-600 hover:underline ml-1"
                >
                  Gestionar textos →
                </button>
              </p>
            </div>

            {/* Image URL Section */}
            <div className="border-t border-[#0A2540]/10 pt-4 mt-4">
              <div className="flex items-center gap-2 mb-3">
                <Image className="w-4 h-4 text-[#F2B705]" />
                <Label className="text-sm font-medium text-[#0A2540] dark:text-white">Imágenes (Opcional)</Label>
              </div>
              
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label className="text-xs text-[#4A5568] dark:text-slate-400">Imagen de la pregunta</Label>
                  <Input
                    value={formData.image_url}
                    onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                    placeholder="https://ejemplo.com/imagen.jpg"
                    className="bg-white dark:bg-slate-800 border-[#0A2540]/20 dark:border-slate-600 focus:border-[#F2B705] focus:ring-[#F2B705]/20"
                    data-testid="question-image-url"
                  />
                  {formData.image_url && (
                    <img 
                      src={formData.image_url} 
                      alt="Preview" 
                      className="w-32 h-20 object-cover rounded border"
                      onError={(e) => e.target.style.display = 'none'}
                    />
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-[#4A5568] dark:text-slate-400">Imágenes de opciones (una URL por opción)</Label>
                  {formData.option_images.map((img, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <span className="text-xs text-[#4A5568] dark:text-slate-400 w-6">{String.fromCharCode(65 + index)}:</span>
                      <Input
                        value={img || ""}
                        onChange={(e) => {
                          const newImages = [...formData.option_images];
                          newImages[index] = e.target.value;
                          setFormData({...formData, option_images: newImages});
                        }}
                        placeholder={`URL imagen opción ${String.fromCharCode(65 + index)} (opcional)`}
                        className="flex-1 bg-white border-[#0A2540]/20 focus:border-[#F2B705] focus:ring-[#F2B705]/20"
                        data-testid={`option-image-${index}`}
                      />
                      {img && (
                        <img 
                          src={img} 
                          alt={`Opción ${String.fromCharCode(65 + index)}`}
                          className="w-10 h-10 object-cover rounded border"
                          onError={(e) => e.target.style.display = 'none'}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <DialogFooter className="bg-white dark:bg-slate-800 -mx-6 -mb-6 px-6 py-4 mt-6 rounded-b-lg border-t border-[#0A2540]/10 dark:border-slate-700">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="border-[#0A2540]/20">
                Cancelar
              </Button>
              <Button type="submit" className="bg-[#F2B705] text-[#0A2540] hover:bg-[#F2B705]/90" data-testid="save-question-btn">
                {editingQuestion ? "Actualizar" : "Crear"} Pregunta
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar pregunta?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. La pregunta será eliminada permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600"
              data-testid="confirm-delete-btn"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete Confirmation */}
      <AlertDialog open={bulkDeleteDialogOpen} onOpenChange={setBulkDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              ¿Eliminar {selectedQuestions.size} preguntas?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Las {selectedQuestions.size} preguntas seleccionadas serán eliminadas permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setBulkDeleteDialogOpen(false)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              className="bg-red-500 hover:bg-red-600"
            >
              Eliminar {selectedQuestions.size} preguntas
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Import Dialog */}
      <Dialog open={bulkImportOpen} onOpenChange={setBulkImportOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-800">
          <DialogHeader>
            <DialogTitle className="font-[Poppins]">Importar Preguntas</DialogTitle>
            <DialogDescription>
              Importa múltiples preguntas desde JSON o CSV. Ver formato en /app/example_import_format.json
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Format Selection */}
            <div className="space-y-2">
              <Label>Formato</Label>
              <Select value={importFormat} onValueChange={setImportFormat}>
                <SelectTrigger data-testid="import-format-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="json">JSON</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Download Template */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => downloadTemplate("json")}
                data-testid="download-json-template"
              >
                <Download className="w-4 h-4 mr-2" />
                Plantilla JSON
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => downloadTemplate("csv")}
                data-testid="download-csv-template"
              >
                <Download className="w-4 h-4 mr-2" />
                Plantilla CSV
              </Button>
            </div>

            {/* Data Input */}
            <div className="space-y-2">
              <Label>Datos ({importFormat.toUpperCase()})</Label>
              <Textarea
                value={importData}
                onChange={(e) => setImportData(e.target.value)}
                placeholder={importFormat === "json" 
                  ? '{\n  "questions": [\n    {\n      "subject_id": "subj_matematicas",\n      "topic": "Álgebra",\n      "text": "Pregunta...",\n      "options": ["A", "B", "C", "D"],\n      "correct_answer": 0,\n      "explanation": "Explicación..."\n    }\n  ]\n}'
                  : 'subject_id,topic,text,option_a,option_b,option_c,option_d,correct_answer,explanation,image_url'
                }
                rows={12}
                className="font-mono text-sm"
                data-testid="import-data-input"
              />
            </div>

            {/* Subject IDs Reference */}
            <div className="p-3 bg-[#F5F7FA] dark:bg-slate-900 rounded-lg">
              <p className="text-xs font-medium text-[#0A2540] dark:text-white mb-2">IDs de materias disponibles:</p>
              <div className="flex flex-wrap gap-1">
                {subjects.map(s => (
                  <span key={s.subject_id} className="text-xs bg-white dark:bg-slate-700 dark:text-white px-2 py-1 rounded border dark:border-slate-600">
                    {s.subject_id}: {s.name}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkImportOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleBulkImport}
              disabled={importing}
              className="bg-[#0A2540]"
              data-testid="execute-import-btn"
            >
              {importing ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              ) : (
                <Upload className="w-4 h-4 mr-2" />
              )}
              Importar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
    </div>
  );
};

export default AdminQuestions;
