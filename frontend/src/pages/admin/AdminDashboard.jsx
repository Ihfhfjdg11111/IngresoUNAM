import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Users, FileQuestion, Target, 
  BarChart3, Flag, Crown,
  Plus, Calculator, FlaskConical, Globe, Brain
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { API } from "../../App";
import Sidebar from "../../components/Sidebar";
import { FadeIn } from "../../components";
import { useAdminData } from "../../contexts/AdminDataContext";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { getCachedData, setCachedData, isStale } = useAdminData();
  
  // Use cached data if available and not stale
  const cachedStats = getCachedData('stats');
  const [stats, setStats] = useState(cachedStats);
  const [loading, setLoading] = useState(!cachedStats || isStale('stats', 30000));

  const token = localStorage.getItem("token");
  const headers = { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" };
  const [generating, setGenerating] = useState(false);

  const generateQuestions = async (area) => {
    setGenerating(true);
    try {
      const response = await fetch(`${API}/admin/generate-fill-questions/${area}?count=100`, {
        method: "POST",
        headers,
        credentials: "include"
      });
      
      if (response.ok) {
        const data = await response.json();
        alert(`Preguntas generadas para ${area}:\n` + 
          data.results.map(r => `${r.subject}: +${r.generated} preguntas (total: ${r.new_total})`).join('\n')
        );
        fetchStats(true);
      } else {
        alert("Error al generar preguntas");
      }
    } catch (error) {
      alert("Error de conexión");
    } finally {
      setGenerating(false);
    }
  };

  const fetchStats = useCallback(async (force = false) => {
    // Use cache if available and not stale (30 seconds)
    if (!force && cachedStats && !isStale('stats', 30000)) {
      setStats(cachedStats);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API}/admin/stats`, {
        headers: { "Authorization": `Bearer ${token}` },
        credentials: "include"
      });

      if (response.ok) {
        const data = await response.json();
        setCachedData('stats', data);
        setStats(data);
      }
    } catch (error) {
      // Use cached data on error
      if (cachedStats) setStats(cachedStats);
    } finally {
      setLoading(false);
    }
  }, [token, cachedStats, isStale, setCachedData]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

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

  const statCards = [
    { icon: Users, label: "Usuarios", value: stats?.total_users || 0, color: "bg-blue-100", iconColor: "text-[#0A2540]" },
    { icon: Crown, label: "Premium", value: stats?.premium_users || 0, color: "bg-amber-100", iconColor: "text-[#F2B705]" },
    { icon: FileQuestion, label: "Preguntas", value: stats?.total_questions || 0, color: "bg-blue-100", iconColor: "text-[#3B82F6]" },
    { icon: BarChart3, label: "Intentos", value: stats?.total_attempts || 0, color: "bg-green-100", iconColor: "text-[#10B981]" },
    { icon: Target, label: "Completados", value: stats?.completed_attempts || 0, color: "bg-purple-100", iconColor: "text-[#8B5CF6]" },
    { icon: Flag, label: "Reportes", value: stats?.pending_reports || 0, color: stats?.pending_reports > 0 ? "bg-red-100" : "bg-slate-100", iconColor: "text-[#EF4444]", alert: stats?.pending_reports > 0 },
  ];

  const quickActions = [
    { icon: FileQuestion, label: "Preguntas", desc: "Gestionar banco de preguntas", color: "text-[#3B82F6]", path: "/admin/questions" },
    { icon: Target, label: "Simulacros", desc: "Administrar simulacros", color: "text-[#10B981]", path: "/admin/simulators" },
    { icon: Users, label: "Usuarios", desc: "Gestionar usuarios", color: "text-[#F2B705]", path: "/admin/users" },
    { icon: Flag, label: "Reportes", desc: "Revisar preguntas reportadas", color: "text-[#EF4444]", path: "/admin/reports", alert: stats?.pending_reports > 0, alertCount: stats?.pending_reports },
  ];

  return (
    <div className="min-h-screen bg-[#F5F7FA] dark:bg-slate-900 transition-colors duration-300">
      <Sidebar isAdmin={true} />

      <div className="lg:ml-64 min-h-screen">
        <main className="p-6 md:p-8">
          {/* Header */}
          <FadeIn>
            <div className="mb-8">
              <h1 className="text-2xl md:text-3xl font-bold text-[#0A2540] dark:text-white font-[Poppins]">
                Panel de Administración
              </h1>
              <p className="text-[#4A5568] dark:text-slate-400 mt-1">
                Gestiona preguntas, simulacros y usuarios de IngresoUNAM.
              </p>
            </div>
          </FadeIn>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            {statCards.map((stat, index) => (
              <div key={stat.label} className={`bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-100 dark:border-slate-700 ${stat.alert ? 'ring-2 ring-red-200' : ''}`} data-testid={`admin-stat-${stat.label.toLowerCase()}`}>
                <div className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center mb-3`}>
                  <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
                </div>
                <p className="text-2xl font-bold text-[#0A2540] dark:text-white">{stat.value}</p>
                <p className="text-sm text-[#4A5568] dark:text-slate-400">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {quickActions.map((action, index) => (
                <button
                  key={action.label}
                  onClick={() => navigate(action.path)}
                  className={`bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm hover:shadow-md transition-all text-left border border-slate-100 dark:border-slate-700 ${action.alert ? 'ring-2 ring-red-200' : ''}`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <action.icon className={`w-8 h-8 ${action.color}`} />
                    {action.alert && action.alertCount > 0 && (
                      <span className="bg-[#EF4444] text-white text-xs px-2 py-1 rounded-full">
                        {action.alertCount} pendientes
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-[#0A2540] dark:text-white mb-1">{action.label}</h3>
                  <p className="text-sm text-[#4A5568] dark:text-slate-400">{action.desc}</p>
                </button>
              ))}
            </div>

          {/* Generate Questions Section */}
          <FadeIn delay={0.2}>
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
              <h2 className="text-lg font-bold text-[#0A2540] dark:text-white mb-2 flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Generar Preguntas de Relleno
              </h2>
              <p className="text-sm text-[#4A5568] dark:text-slate-400 mb-4">
                Genera preguntas adicionales para completar simulacros de 40 y 80 preguntas.
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Button
                  onClick={() => generateQuestions("area_1")}
                  disabled={generating}
                  variant="outline"
                  className="flex flex-col items-center py-4 h-auto dark:border-slate-600 dark:text-white dark:hover:bg-slate-700"
                >
                  <Calculator className="w-6 h-6 mb-2 text-blue-500" />
                  <span className="text-xs font-medium">Área 1</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">Matemáticas y Física</span>
                </Button>
                
                <Button
                  onClick={() => generateQuestions("area_2")}
                  disabled={generating}
                  variant="outline"
                  className="flex flex-col items-center py-4 h-auto dark:border-slate-600 dark:text-white dark:hover:bg-slate-700"
                >
                  <FlaskConical className="w-6 h-6 mb-2 text-green-500" />
                  <span className="text-xs font-medium">Área 2</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">Química y Biología</span>
                </Button>
                
                <Button
                  onClick={() => generateQuestions("area_3")}
                  disabled={generating}
                  variant="outline"
                  className="flex flex-col items-center py-4 h-auto dark:border-slate-600 dark:text-white dark:hover:bg-slate-700"
                >
                  <Globe className="w-6 h-6 mb-2 text-amber-500" />
                  <span className="text-xs font-medium">Área 3</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">Historia UNAM y México</span>
                </Button>
                
                <Button
                  onClick={() => generateQuestions("area_4")}
                  disabled={generating}
                  variant="outline"
                  className="flex flex-col items-center py-4 h-auto dark:border-slate-600 dark:text-white dark:hover:bg-slate-700"
                >
                  <Brain className="w-6 h-6 mb-2 text-purple-500" />
                  <span className="text-xs font-medium">Área 4</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">Filosofía</span>
                </Button>
              </div>
            </div>
          </FadeIn>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
