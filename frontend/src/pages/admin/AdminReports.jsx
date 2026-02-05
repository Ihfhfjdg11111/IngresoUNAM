import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Flag, ArrowLeft, CheckCircle, XCircle, Edit3,
  Clock, Save
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
import { API } from "../../App";
import { toast } from "sonner";

const AdminReports = () => {
  const navigate = useNavigate();

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("pending");
  const [selectedReport, setSelectedReport] = useState(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [saving, setSaving] = useState(false);

  const token = localStorage.getItem("token");
  const headers = { 
    "Authorization": `Bearer ${token}`,
    "Content-Type": "application/json"
  };

  useEffect(() => {
    fetchReports();
    fetchSubjects();
  }, [filter]);

  const fetchSubjects = async () => {
    try {
      const response = await fetch(`${API}/subjects`, { 
        headers: { "Authorization": `Bearer ${token}` }, 
        credentials: "include" 
      });
      if (response.ok) {
        const data = await response.json();
        setSubjects(data);
      }
    } catch (error) {
      // Error silenciado
    }
  };

  const fetchReports = async () => {
    try {
      setLoading(true);
      const url = filter === "all" 
        ? `${API}/admin/reports` 
        : `${API}/admin/reports?status=${filter}`;
      
      const response = await fetch(url, { 
        headers: { "Authorization": `Bearer ${token}` }, 
        credentials: "include" 
      });
      if (response.ok) {
        const data = await response.json();
        setReports(data);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchQuestionDetails = async (questionId) => {
    try {
      const response = await fetch(`${API}/questions?limit=500`, { 
        headers: { "Authorization": `Bearer ${token}` }, 
        credentials: "include" 
      });
      if (response.ok) {
        const questions = await response.json();
        const question = questions.find(q => q.question_id === questionId);
        if (question) {
          setEditingQuestion({
            ...question,
            options: question.options || ["", "", "", ""]
          });
        }
      }
    } catch (error) {
      toast.error("Error al cargar la pregunta");
    }
  };

  const handleEditReport = async (report) => {
    setSelectedReport(report);
    await fetchQuestionDetails(report.question_id);
    setShowEditDialog(true);
  };

  const handleSaveQuestion = async () => {
    if (!editingQuestion) return;
    
    setSaving(true);
    try {
      const response = await fetch(`${API}/admin/questions/${editingQuestion.question_id}`, {
        method: "PUT",
        headers,
        credentials: "include",
        body: JSON.stringify({
          subject_id: editingQuestion.subject_id,
          topic: editingQuestion.topic,
          text: editingQuestion.text,
          options: editingQuestion.options,
          correct_answer: editingQuestion.correct_answer,
          explanation: editingQuestion.explanation,
          reading_text_id: editingQuestion.reading_text_id || null
        })
      });

      if (response.ok) {
        toast.success("Pregunta actualizada correctamente");
        // Mark report as resolved
        await updateReportStatus(selectedReport.report_id, "resolved");
        setShowEditDialog(false);
        setEditingQuestion(null);
        setSelectedReport(null);
        fetchReports();
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

  const updateReportStatus = async (reportId, status) => {
    try {
      const response = await fetch(`${API}/admin/reports/${reportId}?status=${status}`, {
        method: "PUT",
        headers: { "Authorization": `Bearer ${token}` },
        credentials: "include"
      });

      if (response.ok) {
        toast.success("Reporte actualizado");
        fetchReports();
      } else {
        toast.error("Error al actualizar");
      }
    } catch (error) {
      toast.error("Error de conexión");
    }
  };

  const getReasonLabel = (reason) => {
    const labels = {
      "incorrect_answer": "Respuesta incorrecta",
      "unclear_text": "Texto confuso",
      "wrong_subject": "Materia incorrecta",
      "typo": "Error tipográfico",
      "other": "Otro"
    };
    return labels[reason] || reason;
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: "bg-amber-100 text-amber-700",
      reviewed: "bg-blue-100 text-blue-700",
      resolved: "bg-green-100 text-green-700",
      dismissed: "bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300"
    };
    const labels = {
      pending: "Pendiente",
      reviewed: "Revisado",
      resolved: "Resuelto",
      dismissed: "Descartado"
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

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
          <h1 className="text-xl font-bold text-[#0A2540] dark:text-white">Reportes</h1>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-[#0A2540] dark:text-white font-[Poppins] hidden lg:block">
            Reportes de Preguntas
          </h1>
          <p className="text-[#4A5568] dark:text-slate-400 mt-1">
            Revisa y edita las preguntas reportadas por los usuarios.
          </p>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {["pending", "reviewed", "resolved", "dismissed", "all"].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === status
                  ? "bg-[#0A2540] text-white"
                  : "bg-white dark:bg-slate-800 text-[#4A5568] dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
              }`}
            >
              {status === "all" ? "Todos" : 
               status === "pending" ? "Pendientes" :
               status === "reviewed" ? "Revisados" :
               status === "resolved" ? "Resueltos" : "Descartados"}
            </button>
          ))}
        </div>

        {/* Reports List */}
        {reports.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-xl p-8 text-center shadow-sm">
            <Flag className="w-16 h-16 mx-auto text-[#4A5568]/30 dark:text-slate-500 mb-4" />
            <h3 className="text-lg font-medium text-[#0A2540] dark:text-white mb-2">No hay reportes</h3>
            <p className="text-[#4A5568] dark:text-slate-400">
              {filter === "pending" ? "No hay reportes pendientes por revisar." : "No hay reportes con este estado."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {reports.map((report) => (
              <div key={report.report_id} className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      {getStatusBadge(report.status)}
                      <span className="text-sm font-medium text-red-600 bg-red-50 px-2 py-1 rounded-full">
                        {getReasonLabel(report.reason)}
                      </span>
                      <span className="text-xs text-gray-400 font-mono">
                        ID: {report.question_id}
                      </span>
                    </div>
                    <p className="text-[#0A2540] dark:text-white font-medium mb-1">{report.question_text}</p>
                    {report.details && (
                      <p className="text-sm text-[#4A5568] dark:text-slate-400 bg-slate-50 dark:bg-slate-900 p-3 rounded-lg mt-2 border border-slate-100 dark:border-slate-700">
                        "{report.details}"
                      </p>
                    )}
                    <div className="flex items-center gap-4 mt-3 text-xs text-[#4A5568] dark:text-slate-400">
                      <span>Reportado por: {report.reporter_name}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(report.created_at).toLocaleDateString("es-MX")}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    {(report.status === "pending" || report.status === "reviewed") && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditReport(report)}
                          className="text-blue-600 border-blue-300 hover:bg-blue-50"
                        >
                          <Edit3 className="w-4 h-4 mr-1" />
                          Editar
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => updateReportStatus(report.report_id, "resolved")}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Resolver
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => updateReportStatus(report.report_id, "dismissed")}
                          className="text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700"
                        >
                          <XCircle className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                    {(report.status === "resolved" || report.status === "dismissed") && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateReportStatus(report.report_id, "pending")}
                        className="text-amber-600 border-amber-300"
                      >
                        Reabrir
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Edit Question Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-800">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-[#0A2540] dark:text-white">
              Editar Pregunta Reportada
            </DialogTitle>
          </DialogHeader>

          {editingQuestion && (
            <div className="space-y-6 py-4">
              {/* Report Info */}
              {selectedReport && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <p className="text-sm font-medium text-amber-800 mb-1">Motivo del reporte:</p>
                  <p className="text-amber-900">{getReasonLabel(selectedReport.reason)}</p>
                  {selectedReport.details && (
                    <p className="text-sm text-amber-700 mt-2 italic">"{selectedReport.details}"</p>
                  )}
                </div>
              )}

              {/* Question ID */}
              <div className="flex items-center gap-2">
                <span className="text-xs bg-slate-100 px-2 py-1 rounded font-mono">
                  {editingQuestion.question_id}
                </span>
              </div>

              {/* Subject */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700 dark:text-slate-300">Materia</Label>
                <Select 
                  value={editingQuestion.subject_id} 
                  onValueChange={(value) => setEditingQuestion({...editingQuestion, subject_id: value})}
                >
                  <SelectTrigger className="bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-600">
                    <SelectValue placeholder="Selecciona materia" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {subjects.map((s) => (
                      <SelectItem key={s.subject_id} value={s.subject_id}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Topic */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700 dark:text-slate-300">Tema</Label>
                <Input
                  value={editingQuestion.topic || ""}
                  onChange={(e) => setEditingQuestion({...editingQuestion, topic: e.target.value})}
                  className="bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-600"
                  placeholder="Tema de la pregunta"
                />
              </div>

              {/* Question Text */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700 dark:text-slate-300">Texto de la Pregunta</Label>
                <Textarea
                  value={editingQuestion.text || ""}
                  onChange={(e) => setEditingQuestion({...editingQuestion, text: e.target.value})}
                  className="bg-white border-gray-300 min-h-[100px]"
                  placeholder="Escribe la pregunta..."
                />
              </div>

              {/* Options */}
              <div className="space-y-3">
                <Label className="text-sm font-medium text-gray-700 dark:text-slate-300">Opciones de Respuesta</Label>
                {editingQuestion.options?.map((option, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      editingQuestion.correct_answer === idx 
                        ? "bg-green-500 text-white" 
                        : "bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300"
                    }`}>
                      {String.fromCharCode(65 + idx)}
                    </div>
                    <Input
                      value={option}
                      onChange={(e) => {
                        const newOptions = [...editingQuestion.options];
                        newOptions[idx] = e.target.value;
                        setEditingQuestion({...editingQuestion, options: newOptions});
                      }}
                      className="flex-1 bg-white border-gray-300"
                      placeholder={`Opción ${String.fromCharCode(65 + idx)}`}
                    />
                    <Button
                      type="button"
                      variant={editingQuestion.correct_answer === idx ? "default" : "outline"}
                      size="sm"
                      onClick={() => setEditingQuestion({...editingQuestion, correct_answer: idx})}
                      className={editingQuestion.correct_answer === idx ? "bg-green-600" : ""}
                    >
                      {editingQuestion.correct_answer === idx ? "Correcta ✓" : "Marcar"}
                    </Button>
                  </div>
                ))}
              </div>

              {/* Explanation */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700 dark:text-slate-300">Explicación</Label>
                <Textarea
                  value={editingQuestion.explanation || ""}
                  onChange={(e) => setEditingQuestion({...editingQuestion, explanation: e.target.value})}
                  className="bg-white border-gray-300 min-h-[80px]"
                  placeholder="Explicación de la respuesta correcta..."
                />
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSaveQuestion} 
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
                  Guardar y Resolver
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

export default AdminReports;
