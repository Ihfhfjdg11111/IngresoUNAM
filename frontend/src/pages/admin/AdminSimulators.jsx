import { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Plus, Trash2, ArrowLeft, Clock, Target
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
import { API } from "../../App";
import { toast } from "sonner";
import { FadeIn } from "../../components";
import { useAdminData } from "../../contexts/AdminDataContext";

const AdminSimulators = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { getCachedData, setCachedData, isStale, invalidateCache } = useAdminData();
  
  // Use cached data if available
  const cachedSimulators = getCachedData('simulators');
  const [simulators, setSimulators] = useState(cachedSimulators || []);
  const [examConfig, setExamConfig] = useState(null);
  const [loading, setLoading] = useState(!cachedSimulators || isStale('simulators', 60000));
  
  const [dialogOpen, setDialogOpen] = useState(searchParams.get("new") === "true");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [simulatorToDelete, setSimulatorToDelete] = useState(null);
  
  const [formData, setFormData] = useState({
    name: "",
    area: "",
    description: ""
  });

  const token = localStorage.getItem("token");
  const headers = { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" };

  const fetchData = useCallback(async (force = false) => {
    // Use cache if available and not stale
    if (!force && cachedSimulators && !isStale('simulators', 60000)) {
      setSimulators(cachedSimulators);
      // Still fetch exam config in background
      fetchExamConfig();
      setLoading(false);
      return;
    }

    try {
      const [simRes, configRes] = await Promise.all([
        fetch(`${API}/simulators`),
        fetch(`${API}/exam-config`)
      ]);

      if (simRes.ok) {
        const simData = await simRes.json();
        setCachedData('simulators', simData);
        setSimulators(simData);
      }
      if (configRes.ok) setExamConfig(await configRes.json());
    } catch (error) {
      // Use cached data on error
      if (cachedSimulators) setSimulators(cachedSimulators);
    } finally {
      setLoading(false);
    }
  }, [cachedSimulators, isStale, setCachedData]);

  const fetchExamConfig = async () => {
    try {
      const res = await fetch(`${API}/exam-config`);
      if (res.ok) setExamConfig(await res.json());
    } catch (e) {}
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const resetForm = () => {
    setFormData({ name: "", area: "", description: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch(`${API}/admin/simulators`, {
        method: "POST",
        headers,
        credentials: "include",
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        toast.success("Simulacro creado");
        setDialogOpen(false);
        resetForm();
        // Invalidate cache and refetch
        invalidateCache('simulators');
        invalidateCache('stats');
        fetchData(true);
      } else {
        const error = await response.json();
        toast.error(error.detail || "Error al crear");
      }
    } catch (error) {
      toast.error("Error de conexión");
    }
  };

  const handleDelete = async () => {
    if (!simulatorToDelete) return;
    
    try {
      const response = await fetch(`${API}/admin/simulators/${simulatorToDelete.simulator_id}`, {
        method: "DELETE",
        headers,
        credentials: "include"
      });

      if (response.ok) {
        toast.success("Simulacro eliminado");
        // Invalidate cache
        invalidateCache('simulators');
        invalidateCache('stats');
        setDeleteDialogOpen(false);
        setSimulatorToDelete(null);
        fetchData();
      } else {
        toast.error("Error al eliminar");
      }
    } catch (error) {
      toast.error("Error de conexión");
    }
  };

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

      <div className="lg:ml-64 min-h-screen">
        <main className="p-6 md:p-8">
          {/* Mobile Header */}
          <FadeIn>
            <div className="lg:hidden flex items-center gap-4 mb-6">
              <Button variant="ghost" size="icon" onClick={() => navigate("/admin")}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <h1 className="text-xl font-bold text-[#0A2540] dark:text-white">Simulacros</h1>
            </div>
          </FadeIn>

          {/* Header */}
          <FadeIn delay={0.05}>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-[#0A2540] dark:text-white font-[Poppins] hidden lg:block">
                  Gestión de Simulacros
                </h1>
                <p className="text-[#4A5568] dark:text-slate-400 mt-1">
                  {simulators.length} simulacros disponibles
                </p>
              </div>
              <div>
                <Button
                  onClick={() => {
                    resetForm();
                    setDialogOpen(true);
                  }}
                  className="bg-[#F2B705] text-[#0A2540] hover:bg-[#F2B705]/90 shadow-lg shadow-[#F2B705]/20"
                  data-testid="add-simulator-btn"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Nuevo Simulacro
                </Button>
              </div>
            </div>
          </FadeIn>

          {/* Simulators Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {simulators.map((sim, index) => (
              <FadeIn key={sim.simulator_id} delay={0.1 + index * 0.05}>
                <div 
                  className="bg-white dark:bg-slate-800 rounded-xl shadow-sm overflow-hidden border border-slate-100 dark:border-slate-700"
                  data-testid={`simulator-admin-${sim.simulator_id}`}
                >
                  <div 
                    className="h-2"
                    style={{ backgroundColor: sim.area_color }}
                  />
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div 
                          className="inline-flex items-center justify-center w-10 h-10 rounded-lg text-white font-bold text-sm mb-3"
                          style={{ backgroundColor: sim.area_color }}
                        >
                          {sim.area.replace("area_", "")}
                        </div>
                        <h3 className="text-lg font-bold text-[#0A2540] dark:text-white font-[Poppins]">
                          {sim.name}
                        </h3>
                        <p className="text-sm text-[#4A5568] dark:text-slate-400">{sim.area_name}</p>
                      </div>
                      <div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSimulatorToDelete(sim);
                            setDeleteDialogOpen(true);
                          }}
                          className="text-red-500 hover:text-red-600 hover:bg-red-50"
                          data-testid={`delete-sim-${sim.simulator_id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {sim.description && (
                      <p className="text-[#4A5568] dark:text-slate-400 text-sm mb-4">{sim.description}</p>
                    )}

                    <div className="flex items-center gap-4 text-sm text-[#4A5568] dark:text-slate-400">
                      <span className="flex items-center gap-1">
                        <Target className="w-4 h-4" />
                        {sim.total_questions} preguntas
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {sim.duration_minutes} min
                      </span>
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>

          {simulators.length === 0 && (
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
                  <Target className="w-16 h-16 mx-auto text-[#4A5568]/30 dark:text-slate-500 mb-4" />
                </motion.div>
                <p className="text-[#4A5568] dark:text-slate-400">No hay simulacros creados</p>
              </motion.div>
            </FadeIn>
          )}
        </main>

        {/* New Simulator Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="bg-white dark:bg-slate-800">
            <DialogHeader>
              <DialogTitle className="font-[Poppins] text-[#0A2540] dark:text-white">Nuevo Simulacro</DialogTitle>
              <DialogDescription>
                Crea un nuevo simulacro para un área específica.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Nombre del Simulacro</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Ej: Simulacro Área 1 - Febrero"
                  data-testid="simulator-name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Área</Label>
                <Select 
                  value={formData.area} 
                  onValueChange={(v) => setFormData({...formData, area: v})}
                >
                  <SelectTrigger className="bg-white dark:bg-slate-800" data-testid="simulator-area">
                    <SelectValue placeholder="Seleccionar área" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-slate-800">
                    {examConfig?.areas && Object.entries(examConfig.areas).map(([key, area]) => (
                      <SelectItem key={key} value={key}>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: area.color }}
                          ></div>
                          {area.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Descripción (opcional)</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Descripción del simulacro..."
                  rows={2}
                  data-testid="simulator-description"
                />
              </div>

              {formData.area && examConfig?.areas?.[formData.area] && (
                <motion.div 
                  className="p-4 bg-[#F5F7FA] dark:bg-slate-900 rounded-lg"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                >
                  <p className="text-sm font-medium text-[#0A2540] dark:text-white mb-2">Distribución de preguntas:</p>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(examConfig.areas[formData.area].subjects).map(([subj, count]) => (
                      <motion.span 
                        key={subj}
                        className="text-xs bg-white dark:bg-slate-700 dark:text-white px-2 py-1 rounded border dark:border-slate-600"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      >
                        {examConfig.subject_names?.[subj] || subj}: {count}
                      </motion.span>
                    ))}
                  </div>
                </motion.div>
              )}

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" className="bg-[#0A2540]" data-testid="save-simulator-btn">
                  Crear Simulacro
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Eliminar simulacro?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción no se puede deshacer. El simulacro "{simulatorToDelete?.name}" será eliminado permanentemente.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-red-500 hover:bg-red-600"
                data-testid="confirm-delete-sim-btn"
              >
                Eliminar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default AdminSimulators;
