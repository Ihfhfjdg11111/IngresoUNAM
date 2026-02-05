import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FileText, ArrowLeft, Plus, Edit3, Trash2, Search,
  Save, X, Link2, ChevronDown, ChevronUp, Upload
} from "lucide-react";
import { Button } from "../../components/ui/button";
import Sidebar from "../../components/Sidebar";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { Label } from "../../components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
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
import { API } from "../../App";
import { toast } from "sonner";

const AdminReadingTexts = () => {
  const navigate = useNavigate();

  const [readingTexts, setReadingTexts] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDialog, setShowDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [editingText, setEditingText] = useState(null);
  const [textToDelete, setTextToDelete] = useState(null);
  const [selectedTextForLink, setSelectedTextForLink] = useState(null);
  const [expandedText, setExpandedText] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [importData, setImportData] = useState("");
  const [importing, setImporting] = useState(false);

  const token = localStorage.getItem("token");
  const headers = { 
    "Authorization": `Bearer ${token}`,
    "Content-Type": "application/json"
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [textsRes, questionsRes, subjectsRes] = await Promise.all([
        fetch(`${API}/admin/reading-texts`, { headers: { "Authorization": `Bearer ${token}` }, credentials: "include" }),
        fetch(`${API}/questions?limit=1000`, { headers: { "Authorization": `Bearer ${token}` }, credentials: "include" }),
        fetch(`${API}/subjects`, { headers: { "Authorization": `Bearer ${token}` }, credentials: "include" })
      ]);

      if (textsRes.ok) {
        const data = await textsRes.json();
        setReadingTexts(data);
      }
      if (questionsRes.ok) {
        const data = await questionsRes.json();
        setQuestions(data);
      }
      if (subjectsRes.ok) {
        const data = await subjectsRes.json();
        setSubjects(data);
      }
    } catch (error) {
      // Error silenciado
    } finally {
      setLoading(false);
    }
  };

  const getLinkedQuestions = (textId) => {
    return questions.filter(q => q.reading_text_id === textId);
  };

  const getUnlinkedQuestions = () => {
    return questions.filter(q => !q.reading_text_id);
  };

  const formatTextId = (id) => {
    // Extract numeric part and format as TXT-001
    const num = id.replace(/\D/g, '').slice(-3).padStart(3, '0');
    return `TXT-${num}`;
  };

  const formatQuestionId = (id) => {
    // Extract numeric part and format as P-0001
    const num = id.replace(/\D/g, '').slice(-4).padStart(4, '0');
    return `P-${num}`;
  };

  const handleCreateNew = () => {
    setEditingText({
      title: "",
      content: "",
      subject_id: ""
    });
    setShowDialog(true);
  };

  const handleEdit = (text) => {
    setEditingText({ ...text });
    setShowDialog(true);
  };

  const handleSave = async () => {
    if (!editingText.title || !editingText.content) {
      toast.error("Título y contenido son requeridos");
      return;
    }

    setSaving(true);
    try {
      const isNew = !editingText.reading_text_id;
      const url = isNew 
        ? `${API}/admin/reading-texts`
        : `${API}/admin/reading-texts/${editingText.reading_text_id}`;
      
      const response = await fetch(url, {
        method: isNew ? "POST" : "PUT",
        headers,
        credentials: "include",
        body: JSON.stringify({
          title: editingText.title,
          content: editingText.content,
          subject_id: editingText.subject_id || null
        })
      });

      if (response.ok) {
        toast.success(isNew ? "Texto creado" : "Texto actualizado");
        setShowDialog(false);
        setEditingText(null);
        fetchData();
      } else {
        const error = await response.json();
        toast.error(error.detail || "Error al guardar");
      }
    } catch (error) {
      toast.error("Error de conexión");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!textToDelete) return;
    
    try {
      const response = await fetch(`${API}/admin/reading-texts/${textToDelete.reading_text_id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` },
        credentials: "include"
      });

      if (response.ok) {
        toast.success("Texto eliminado");
        setShowDeleteDialog(false);
        setTextToDelete(null);
        fetchData();
      } else {
        toast.error("Error al eliminar");
      }
    } catch (error) {
      toast.error("Error de conexión");
    }
  };

  const handleImport = async () => {
    if (!importData.trim()) {
      toast.error("Pega el JSON de los textos a importar");
      return;
    }

    let parsedData;
    try {
      parsedData = JSON.parse(importData);
    } catch (e) {
      toast.error("JSON inválido. Verifica el formato.");
      return;
    }

    // Accept array or object with reading_texts array
    const textsToImport = Array.isArray(parsedData) 
      ? parsedData 
      : parsedData.reading_texts || [];

    if (textsToImport.length === 0) {
      toast.error("No se encontraron textos para importar");
      return;
    }

    setImporting(true);
    let successCount = 0;
    let errorCount = 0;

    for (const text of textsToImport) {
      try {
        const response = await fetch(`${API}/admin/reading-texts`, {
          method: "POST",
          headers,
          credentials: "include",
          body: JSON.stringify({
            title: text.title || text.titulo || `Texto ${successCount + 1}`,
            content: text.content || text.contenido || text.texto || "",
            subject_id: text.subject_id || text.materia_id || null
          })
        });

        if (response.ok) {
          successCount++;
        } else {
          errorCount++;
        }
      } catch (error) {
        errorCount++;
      }
    }

    setImporting(false);
    setShowImportDialog(false);
    setImportData("");
    
    if (successCount > 0) {
      toast.success(`${successCount} texto(s) importado(s) correctamente`);
      fetchData();
    }
    if (errorCount > 0) {
      toast.error(`${errorCount} texto(s) fallaron al importar`);
    }
  };

  const getImportExample = () => {
    return JSON.stringify([
      {
        "title": "Fragmento de El Quijote - Capítulo 1",
        "content": "En un lugar de la Mancha, de cuyo nombre no quiero acordarme, no ha mucho tiempo que vivía un hidalgo de los de lanza en astillero, adarga antigua, rocín flaco y galgo corredor...",
        "subject_id": "subj_literatura"
      },
      {
        "title": "Artículo científico sobre fotosíntesis",
        "content": "La fotosíntesis es un proceso mediante el cual las plantas convierten la luz solar en energía química...",
        "subject_id": "subj_biologia"
      }
    ], null, 2);
  };

  const handleLinkQuestion = async (questionId) => {
    if (!selectedTextForLink) return;
    
    try {
      const response = await fetch(`${API}/admin/questions/${questionId}`, {
        method: "PUT",
        headers,
        credentials: "include",
        body: JSON.stringify({
          reading_text_id: selectedTextForLink.reading_text_id
        })
      });

      if (response.ok) {
        toast.success("Pregunta vinculada");
        fetchData();
      } else {
        toast.error("Error al vincular");
      }
    } catch (error) {
      toast.error("Error de conexión");
    }
  };

  const handleUnlinkQuestion = async (questionId) => {
    try {
      const response = await fetch(`${API}/admin/questions/${questionId}`, {
        method: "PUT",
        headers,
        credentials: "include",
        body: JSON.stringify({
          reading_text_id: null
        })
      });

      if (response.ok) {
        toast.success("Pregunta desvinculada");
        fetchData();
      } else {
        toast.error("Error al desvincular");
      }
    } catch (error) {
      toast.error("Error de conexión");
    }
  };

  const filteredTexts = readingTexts.filter(text => 
    text.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    text.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F7FA] dark:bg-slate-900 flex items-center justify-center transition-colors duration-300">
        <div className="w-12 h-12 border-4 border-[#0A2540] border-t-[#F2B705] rounded-full animate-spin"></div>
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
        <div className="lg:hidden flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate("/admin")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold text-[#0A2540] dark:text-white">Textos de Lectura</h1>
        </div>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#0A2540] dark:text-white font-[Poppins] hidden lg:block">
              Textos de Lectura
            </h1>
            <p className="text-[#4A5568] dark:text-slate-400 mt-1">
              Gestiona los textos y vincula preguntas relacionadas.
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => setShowImportDialog(true)}
              className="border-blue-300 text-blue-600 hover:bg-blue-50"
            >
              <Upload className="w-4 h-4 mr-2" />
              Importar JSON
            </Button>
            <Button onClick={handleCreateNew} className="bg-[#0A2540] hover:bg-[#0A2540]/90">
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Texto
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            placeholder="Buscar textos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-600"
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm">
            <p className="text-2xl font-bold text-[#0A2540] dark:text-white">{readingTexts.length}</p>
            <p className="text-sm text-gray-500 dark:text-slate-400">Textos totales</p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm">
            <p className="text-2xl font-bold text-[#0A2540] dark:text-white">
              {questions.filter(q => q.reading_text_id).length}
            </p>
            <p className="text-sm text-gray-500 dark:text-slate-400">Preguntas vinculadas</p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm">
            <p className="text-2xl font-bold text-[#0A2540] dark:text-white">
              {questions.filter(q => !q.reading_text_id).length}
            </p>
            <p className="text-sm text-gray-500 dark:text-slate-400">Preguntas sin texto</p>
          </div>
        </div>

        {/* Texts List */}
        {filteredTexts.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-xl p-8 text-center shadow-sm">
            <FileText className="w-16 h-16 mx-auto text-gray-300 dark:text-slate-500 mb-4" />
            <h3 className="text-lg font-medium text-[#0A2540] dark:text-white mb-2">
              {searchTerm ? "No se encontraron textos" : "No hay textos"}
            </h3>
            <p className="text-gray-500 dark:text-slate-400 mb-4">
              {searchTerm ? "Intenta con otra búsqueda" : "Crea tu primer texto de lectura"}
            </p>
            {!searchTerm && (
              <Button onClick={handleCreateNew} className="bg-[#0A2540]">
                <Plus className="w-4 h-4 mr-2" />
                Crear Texto
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTexts.map((text) => {
              const linkedQuestions = getLinkedQuestions(text.reading_text_id);
              const isExpanded = expandedText === text.reading_text_id;
              const subject = subjects.find(s => s.subject_id === text.subject_id);
              
              return (
                <div key={text.reading_text_id} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm overflow-hidden">
                  {/* Header */}
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <span className="text-xs font-mono bg-blue-100 text-blue-700 px-2 py-1 rounded font-bold">
                            {formatTextId(text.reading_text_id)}
                          </span>
                          {subject && (
                            <span className="text-xs bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 px-2 py-1 rounded">
                              {subject.name}
                            </span>
                          )}
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                            {linkedQuestions.length} preguntas
                          </span>
                        </div>
                        <h3 className="font-bold text-[#0A2540] dark:text-white text-lg mb-2">{text.title}</h3>
                        <p className="text-gray-600 dark:text-slate-300 text-sm line-clamp-2">{text.content}</p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedTextForLink(text);
                            setShowLinkDialog(true);
                          }}
                          className="text-blue-600 border-blue-300"
                        >
                          <Link2 className="w-4 h-4 mr-1" />
                          Vincular
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(text)}
                        >
                          <Edit3 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setTextToDelete(text);
                            setShowDeleteDialog(true);
                          }}
                          className="text-red-500 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Expandable Questions Section */}
                  {linkedQuestions.length > 0 && (
                    <>
                      <button
                        onClick={() => setExpandedText(isExpanded ? null : text.reading_text_id)}
                        className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between text-sm text-gray-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <span>Ver {linkedQuestions.length} preguntas vinculadas</span>
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                      
                      {isExpanded && (
                        <div className="p-5 pt-3 border-t border-slate-100 dark:border-slate-700 space-y-3">
                          {linkedQuestions.map((q) => (
                            <div key={q.question_id} className="flex items-start justify-between gap-3 p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-xs font-mono bg-purple-100 text-purple-700 px-2 py-0.5 rounded font-bold">
                                    {formatQuestionId(q.question_id)}
                                  </span>
                                  <span className="text-xs text-gray-500 dark:text-slate-400">{q.subject_name}</span>
                                </div>
                                <p className="text-sm text-gray-700 dark:text-slate-200 line-clamp-2">{q.text}</p>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleUnlinkQuestion(q.question_id)}
                                className="text-red-500 hover:bg-red-50 shrink-0"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Create/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-800">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-[#0A2540] dark:text-white">
              {editingText?.reading_text_id ? "Editar Texto" : "Nuevo Texto de Lectura"}
            </DialogTitle>
          </DialogHeader>

          {editingText && (
            <div className="space-y-6 py-4">
              {/* Subject */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700 dark:text-slate-300">Materia (opcional)</Label>
                <Select 
                  value={editingText.subject_id || "none"} 
                  onValueChange={(value) => setEditingText({...editingText, subject_id: value === "none" ? "" : value})}
                >
                  <SelectTrigger className="bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-600">
                    <SelectValue placeholder="Selecciona materia" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="none">Sin materia específica</SelectItem>
                    {subjects.map((s) => (
                      <SelectItem key={s.subject_id} value={s.subject_id}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Title */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700 dark:text-slate-300">Título / Identificador *</Label>
                <Input
                  value={editingText.title || ""}
                  onChange={(e) => setEditingText({...editingText, title: e.target.value})}
                  className="bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-600"
                  placeholder="Ej: Fragmento de Don Quijote - Cap 1"
                />
              </div>

              {/* Content */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700 dark:text-slate-300">Contenido del Texto *</Label>
                <Textarea
                  value={editingText.content || ""}
                  onChange={(e) => setEditingText({...editingText, content: e.target.value})}
                  className="bg-white border-gray-300 min-h-[300px]"
                  placeholder="Pega o escribe el texto de lectura aquí..."
                />
                <p className="text-xs text-gray-500 dark:text-slate-400">
                  {editingText.content?.length || 0} caracteres
                </p>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={saving}
              className="bg-[#0A2540] hover:bg-[#0A2540]/90"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Guardar
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Link Questions Dialog */}
      <Dialog open={showLinkDialog} onOpenChange={setShowLinkDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-800">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-[#0A2540] dark:text-white">
              Vincular Preguntas
            </DialogTitle>
          </DialogHeader>

          {selectedTextForLink && (
            <div className="py-4">
              <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg p-4 mb-4">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>Texto seleccionado:</strong> {selectedTextForLink.title}
                </p>
              </div>

              <p className="text-sm text-gray-600 dark:text-slate-300 mb-4">
                Selecciona las preguntas que quieres vincular a este texto ({getUnlinkedQuestions().length} disponibles)
              </p>

              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {getUnlinkedQuestions().length === 0 ? (
                  <p className="text-center text-gray-500 dark:text-slate-400 py-8">
                    Todas las preguntas ya están vinculadas a algún texto
                  </p>
                ) : (
                  getUnlinkedQuestions().map((q) => (
                    <div key={q.question_id} className="flex items-start justify-between gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-mono bg-purple-100 text-purple-700 px-2 py-0.5 rounded font-bold">
                            {formatQuestionId(q.question_id)}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-slate-400">{q.subject_name}</span>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-slate-200 line-clamp-2">{q.text}</p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleLinkQuestion(q.question_id)}
                        className="bg-blue-600 hover:bg-blue-700 shrink-0"
                      >
                        <Link2 className="w-4 h-4 mr-1" />
                        Vincular
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLinkDialog(false)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar texto?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Las preguntas vinculadas quedarán sin texto asociado.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Import Dialog */}
      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-[#0A2540] dark:text-white">
              Importar Textos de Lectura
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800 mb-2">
                <strong>Formato JSON esperado:</strong>
              </p>
              <p className="text-xs text-blue-700 mb-2">
                Puedes importar un array de textos o un objeto con la propiedad "reading_texts".
                Cada texto debe tener <code className="bg-blue-100 px-1 rounded">title</code> y <code className="bg-blue-100 px-1 rounded">content</code>.
              </p>
              <p className="text-xs text-blue-600">
                Subject IDs válidos: subj_espanol, subj_matematicas, subj_fisica, subj_quimica, subj_biologia, 
                subj_historia_universal, subj_historia_mexico, subj_literatura, subj_geografia, subj_filosofia
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium text-gray-700 dark:text-slate-300">JSON de Textos</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setImportData(getImportExample())}
                  className="text-blue-600 hover:bg-blue-50"
                >
                  <Download className="w-4 h-4 mr-1" />
                  Ver ejemplo
                </Button>
              </div>
              <Textarea
                value={importData}
                onChange={(e) => setImportData(e.target.value)}
                className="bg-white border-gray-300 min-h-[300px] font-mono text-sm"
                placeholder={`[
  {
    "title": "Título del texto",
    "content": "Contenido completo del texto de lectura...",
    "subject_id": "subj_espanol"
  }
]`}
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowImportDialog(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleImport} 
              disabled={importing}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {importing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Importando...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Importar Textos
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
    </div>
  );
};

export default AdminReadingTexts;
