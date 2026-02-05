import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Target, Clock, ChevronRight, ArrowLeft
} from "lucide-react";
import { Button } from "../components/ui/button";
import { AuthContext, API } from "../App";
import Sidebar from "../components/Sidebar";

const Simulators = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [simulators, setSimulators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [examConfig, setExamConfig] = useState(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchSimulators();
  }, []);

  const fetchSimulators = async () => {
    try {
      const [simRes, configRes] = await Promise.all([
        fetch(`${API}/simulators`),
        fetch(`${API}/exam-config`)
      ]);

      if (simRes.ok) {
        const data = await simRes.json();
        setSimulators(data);
      }

      if (configRes.ok) {
        const config = await configRes.json();
        setExamConfig(config);
      }
    } catch (error) {
      // Error silenciado
    } finally {
      setLoading(false);
    }
  };

  const handleStartExam = (simulatorId) => {
    navigate(`/exam/${simulatorId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F7FA] dark:bg-slate-900 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#0A2540] border-t-[#F2B705] rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <>
      <Sidebar />
      <div className="lg:ml-64 min-h-screen">
        <div className="min-h-screen bg-[#F5F7FA] dark:bg-slate-900 transition-colors duration-300">
          {/* Main Content */}
          <main className="lg:ml-64 p-6 md:p-8">
            {/* Mobile Header */}
            <div className="lg:hidden flex items-center gap-4 mb-6">
              <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <h1 className="text-xl font-bold text-[#0A2540]">Simulacros</h1>
            </div>

            {/* Header */}
            <div className="mb-8">
              <h1 className="text-2xl md:text-3xl font-bold text-[#0A2540] font-[Poppins] hidden lg:block">
                Simulacros de Examen
              </h1>
              <p className="text-[#4A5568] dark:text-slate-400 mt-1">
                Selecciona tu área y realiza un simulacro completo del examen UNAM.
              </p>
            </div>

            {/* Exam Info */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm mb-8">
              <h2 className="text-lg font-bold text-[#0A2540] mb-4 font-[Poppins]">Formato del Examen</h2>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-[#F5F7FA] dark:bg-slate-700 rounded-lg">
                  <p className="text-3xl font-bold text-[#0A2540]">120</p>
                  <p className="text-sm text-[#4A5568] dark:text-slate-400">Preguntas</p>
                </div>
                <div className="text-center p-4 bg-[#F5F7FA] dark:bg-slate-700 rounded-lg">
                  <p className="text-3xl font-bold text-[#0A2540]">180</p>
                  <p className="text-sm text-[#4A5568] dark:text-slate-400">Minutos</p>
                </div>
                <div className="text-center p-4 bg-[#F5F7FA] dark:bg-slate-700 rounded-lg">
                  <p className="text-3xl font-bold text-[#0A2540]">4</p>
                  <p className="text-sm text-[#4A5568] dark:text-slate-400">Opciones</p>
                </div>
              </div>
            </div>

            {/* Simulators Grid */}
            <div className="grid md:grid-cols-2 gap-6">
              {simulators.map((sim) => {
                const areaConfig = examConfig?.areas?.[sim.area];
                const subjects = areaConfig?.subjects || {};
                
                return (
                  <div 
                    key={sim.simulator_id}
                    className="bg-white dark:bg-slate-800 rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-all"
                    data-testid={`simulator-card-${sim.area}`}
                  >
                    <div 
                      className="h-3"
                      style={{ backgroundColor: sim.area_color }}
                    ></div>
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div 
                            className="inline-flex items-center justify-center w-12 h-12 rounded-lg text-white font-bold text-lg mb-3"
                            style={{ backgroundColor: sim.area_color }}
                          >
                            {sim.area.replace("area_", "")}
                          </div>
                          <h3 className="text-lg font-bold text-[#0A2540] font-[Poppins]">
                            {sim.area_name}
                          </h3>
                        </div>
                      </div>

                      <p className="text-[#4A5568] dark:text-slate-400 text-sm mb-4">{sim.description}</p>

                      <div className="flex items-center gap-4 text-sm text-[#4A5568] dark:text-slate-400 mb-4">
                        <span className="flex items-center gap-1">
                          <Target className="w-4 h-4" />
                          {sim.total_questions} preguntas
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {sim.duration_minutes} min
                        </span>
                      </div>

                      {/* Subject distribution preview */}
                      <div className="mb-4">
                        <p className="text-xs text-[#4A5568] dark:text-slate-400 mb-2">Distribución de materias:</p>
                        <div className="flex flex-wrap gap-1">
                          {Object.entries(subjects).slice(0, 5).map(([subj, count]) => (
                            <span 
                              key={subj}
                              className="text-xs bg-[#F5F7FA] dark:bg-slate-700 px-2 py-1 rounded"
                            >
                              {examConfig?.subject_names?.[subj] || subj}: {count}
                            </span>
                          ))}
                          {Object.keys(subjects).length > 5 && (
                            <span className="text-xs text-[#4A5568] dark:text-slate-400">+{Object.keys(subjects).length - 5} más</span>
                          )}
                        </div>
                      </div>

                      <Button
                        onClick={() => handleStartExam(sim.simulator_id)}
                        className="w-full bg-[#0A2540] hover:bg-[#0A2540]/90 text-white"
                        data-testid={`start-exam-${sim.area}`}
                      >
                        Iniciar Simulacro
                        <ChevronRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>

            {simulators.length === 0 && (
              <div className="text-center py-12">
                <Target className="w-16 h-16 mx-auto text-[#4A5568]/30 dark:text-slate-600 mb-4" />
                <p className="text-[#4A5568] dark:text-slate-400">No hay simulacros disponibles</p>
              </div>
            )}
          </main>
        </div>
      </div>
    </>
  );
};

export default Simulators;
