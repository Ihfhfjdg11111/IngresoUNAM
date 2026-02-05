import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, MessageSquare, CheckCircle, Clock, XCircle, 
  AlertCircle, Bug, Lightbulb, Sparkles, HelpCircle, Filter,
  ChevronDown, ExternalLink, RefreshCw
} from "lucide-react";
import { Button } from "../../components/ui/button";
import Sidebar from "../../components/Sidebar";
import { AuthContext, API } from "../../App";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

const feedbackTypeConfig = {
  bug: { label: "Error/Bug", icon: Bug, color: "text-red-500", bg: "bg-red-50 dark:bg-red-900/20", border: "border-red-200 dark:border-red-800" },
  feature: { label: "Nueva función", icon: Lightbulb, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-900/20", border: "border-amber-200 dark:border-amber-800" },
  improvement: { label: "Mejora", icon: Sparkles, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-900/20", border: "border-blue-200 dark:border-blue-800" },
  other: { label: "Otro", icon: HelpCircle, color: "text-slate-500", bg: "bg-slate-50 dark:bg-slate-700", border: "border-slate-200 dark:border-slate-600" },
};

const statusConfig = {
  pending: { label: "Pendiente", color: "text-yellow-600", bg: "bg-yellow-50 dark:bg-yellow-900/20", icon: Clock },
  in_progress: { label: "En progreso", color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-900/20", icon: AlertCircle },
  resolved: { label: "Resuelto", color: "text-green-600", bg: "bg-green-50 dark:bg-green-900/20", icon: CheckCircle },
  rejected: { label: "Rechazado", color: "text-red-600", bg: "bg-red-50 dark:bg-red-900/20", icon: XCircle },
};

const AdminFeedback = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useContext(AuthContext);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [expandedId, setExpandedId] = useState(null);

  const token = localStorage.getItem("token");
  const headers = { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" };

  const fetchFeedbacks = async () => {
    setLoading(true);
    try {
      let url = `${API}/feedback/admin/all`;
      const params = new URLSearchParams();
      if (statusFilter) params.append("status", statusFilter);
      if (typeFilter) params.append("type", typeFilter);
      if (params.toString()) url += `?${params.toString()}`;

      const response = await fetch(url, { headers, credentials: "include" });
      
      if (response.ok) {
        const data = await response.json();
        setFeedbacks(data);
      } else {
        toast.error("Error al cargar feedbacks");
      }
    } catch (error) {
      toast.error("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, [statusFilter, typeFilter]);

  const updateStatus = async (feedbackId, newStatus) => {
    try {
      const response = await fetch(`${API}/feedback/admin/${feedbackId}/status`, {
        method: "PUT",
        headers,
        credentials: "include",
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        toast.success("Estado actualizado");
        fetchFeedbacks();
      } else {
        toast.error("Error al actualizar");
      }
    } catch (error) {
      toast.error("Error de conexión");
    }
  };

  const stats = {
    total: feedbacks.length,
    pending: feedbacks.filter(f => f.status === "pending").length,
    in_progress: feedbacks.filter(f => f.status === "in_progress").length,
    resolved: feedbacks.filter(f => f.status === "resolved").length,
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
        <div className="w-12 h-12 border-4 border-[#0A2540] border-t-[#F2B705] rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F7FA] dark:bg-slate-900 transition-colors duration-300">
      <Sidebar isAdmin={true} />

      <div className="lg:ml-64 min-h-screen">
        <main className="p-6 md:p-8">
          {/* Mobile Header */}
          <div className="lg:hidden flex items-center gap-4 mb-6">
            <Button variant="ghost" size="icon" onClick={() => navigate("/admin")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-bold text-[#0A2540] dark:text-white">Feedback de Usuarios</h1>
          </div>

          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-[#0A2540] dark:text-white font-[Poppins] hidden lg:block">
                Feedback de Usuarios
              </h1>
              <p className="text-[#4A5568] dark:text-slate-400 mt-1">
                {stats.total} mensajes recibidos
              </p>
            </div>
            <Button variant="outline" onClick={fetchFeedbacks} className="hidden lg:flex gap-2">
              <RefreshCw className="w-4 h-4" />
              Actualizar
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-100 dark:border-slate-700">
              <p className="text-sm text-[#4A5568] dark:text-slate-400">Total</p>
              <p className="text-2xl font-bold text-[#0A2540] dark:text-white">{stats.total}</p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-100 dark:border-slate-700">
              <p className="text-sm text-[#4A5568] dark:text-slate-400">Pendientes</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-100 dark:border-slate-700">
              <p className="text-sm text-[#4A5568] dark:text-slate-400">En Progreso</p>
              <p className="text-2xl font-bold text-blue-600">{stats.in_progress}</p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-100 dark:border-slate-700">
              <p className="text-sm text-[#4A5568] dark:text-slate-400">Resueltos</p>
              <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-100 dark:border-slate-700 mb-6">
            <div className="flex flex-wrap gap-3 items-center">
              <Filter className="w-4 h-4 text-[#4A5568] dark:text-slate-400" />
              
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-1.5 rounded-lg text-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-[#0A2540] dark:text-white"
              >
                <option value="">Todos los estados</option>
                <option value="pending">Pendiente</option>
                <option value="in_progress">En progreso</option>
                <option value="resolved">Resuelto</option>
                <option value="rejected">Rechazado</option>
              </select>

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-1.5 rounded-lg text-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-[#0A2540] dark:text-white"
              >
                <option value="">Todos los tipos</option>
                <option value="bug">Error/Bug</option>
                <option value="feature">Nueva función</option>
                <option value="improvement">Mejora</option>
                <option value="other">Otro</option>
              </select>

              {(statusFilter || typeFilter) && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => { setStatusFilter(""); setTypeFilter(""); }}
                  className="text-sm"
                >
                  Limpiar filtros
                </Button>
              )}
            </div>
          </div>

          {/* Feedback List */}
          <div className="space-y-3">
            {feedbacks.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                <MessageSquare className="w-16 h-16 mx-auto mb-4 text-slate-200 dark:text-slate-700" />
                <p className="text-slate-500 dark:text-slate-400">No hay feedbacks</p>
              </div>
            ) : (
              feedbacks.map((feedback) => {
                const typeConfig = feedbackTypeConfig[feedback.type] || feedbackTypeConfig.other;
                const statusCfg = statusConfig[feedback.status] || statusConfig.pending;
                const TypeIcon = typeConfig.icon;
                const StatusIcon = statusCfg.icon;
                const isExpanded = expandedId === feedback.feedback_id;

                return (
                  <motion.div
                    key={feedback.feedback_id}
                    className={`bg-white dark:bg-slate-800 rounded-xl border transition-all ${
                      isExpanded 
                        ? "border-[#F2B705] shadow-md" 
                        : "border-slate-100 dark:border-slate-700 hover:border-slate-200 dark:hover:border-slate-600"
                    }`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div 
                      className="p-4 cursor-pointer"
                      onClick={() => setExpandedId(isExpanded ? null : feedback.feedback_id)}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${typeConfig.bg}`}>
                            <TypeIcon className={`w-5 h-5 ${typeConfig.color}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-[#0A2540] dark:text-white">
                                {feedback.user_name || "Usuario"}
                              </span>
                              <span className="text-sm text-slate-400">•</span>
                              <span className="text-sm text-slate-500 dark:text-slate-400">
                                {feedback.user_email}
                              </span>
                              <span className={`text-xs px-2 py-0.5 rounded flex items-center gap-1 ${statusCfg.bg} ${statusCfg.color}`}>
                                <StatusIcon className="w-3 h-3" />
                                {statusCfg.label}
                              </span>
                            </div>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                              {formatDate(feedback.created_at)}
                            </p>
                            <p className="text-[#0A2540] dark:text-slate-200 mt-2 line-clamp-2">
                              {feedback.message}
                            </p>
                          </div>
                        </div>
                        <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                      </div>
                    </div>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="border-t border-slate-100 dark:border-slate-700"
                        >
                          <div className="p-4 bg-slate-50 dark:bg-slate-700/30">
                            <p className="text-[#0A2540] dark:text-slate-200 whitespace-pre-wrap mb-4">
                              {feedback.message}
                            </p>
                            
                            {feedback.page && (
                              <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-4">
                                <ExternalLink className="w-4 h-4" />
                                Página: {feedback.page}
                              </div>
                            )}

                            <div className="flex items-center gap-2 pt-3 border-t border-slate-200 dark:border-slate-600">
                              <span className="text-sm text-slate-500 dark:text-slate-400 mr-2">Cambiar estado:</span>
                              {Object.entries(statusConfig).map(([key, cfg]) => (
                                <button
                                  key={key}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    updateStatus(feedback.feedback_id, key);
                                  }}
                                  disabled={feedback.status === key}
                                  className={`text-xs px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 ${cfg.bg} ${cfg.color}`}
                                >
                                  {cfg.label}
                                </button>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminFeedback;
