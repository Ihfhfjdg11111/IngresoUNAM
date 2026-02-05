import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  BookOpen, BookMarked, ArrowLeft, ChevronRight,
  Sparkles, Target, GraduationCap, Calculator, Atom, 
  Languages, Library, Globe, Dna, FlaskConical, Landmark,
  Flag, BrainCircuit
} from "lucide-react";
import { Button } from "../components/ui/button";
import { AuthContext, API } from "../App";
import Sidebar from "../components/Sidebar";
import { FadeIn, FadeInStagger, FadeInStaggerChild, GradientText } from "../components/animations";

const Subjects = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchSubjects();
  }, []);

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
    } finally {
      setLoading(false);
    }
  };

  const subjectIcons = {
    "Matemáticas": Calculator,
    "Matematicas": Calculator,
    "Física": Atom,
    "Fisica": Atom,
    "Español": Languages,
    "Espanol": Languages,
    "Literatura": Library,
    "Geografía": Globe,
    "Geografia": Globe,
    "Biología": Dna,
    "Biologia": Dna,
    "Química": FlaskConical,
    "Quimica": FlaskConical,
    "Historia Universal": Landmark,
    "Historia de México": Flag,
    "Historia de Mexico": Flag,
    "Filosofía": BrainCircuit,
    "Filosofia": BrainCircuit
  };

  const subjectColors = {
    "Matemáticas": "from-blue-500 to-blue-600",
    "Matematicas": "from-blue-500 to-blue-600",
    "Física": "from-purple-500 to-purple-600",
    "Fisica": "from-purple-500 to-purple-600",
    "Español": "from-red-500 to-red-600",
    "Espanol": "from-red-500 to-red-600",
    "Literatura": "from-pink-500 to-pink-600",
    "Geografía": "from-green-500 to-green-600",
    "Geografia": "from-green-500 to-green-600",
    "Biología": "from-emerald-500 to-emerald-600",
    "Biologia": "from-emerald-500 to-emerald-600",
    "Química": "from-cyan-500 to-cyan-600",
    "Quimica": "from-cyan-500 to-cyan-600",
    "Historia Universal": "from-amber-500 to-amber-600",
    "Historia de México": "from-orange-500 to-orange-600",
    "Historia de Mexico": "from-orange-500 to-orange-600",
    "Filosofía": "from-indigo-500 to-indigo-600",
    "Filosofia": "from-indigo-500 to-indigo-600"
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F7FA] dark:bg-slate-900 flex items-center justify-center">
        <motion.div 
          className="w-16 h-16 border-4 border-[#0A2540] dark:border-slate-600 border-t-[#F2B705] rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
    );
  }

  const totalQuestions = subjects.reduce((acc, s) => acc + (s.question_count || 0), 0);

  return (
    <>
      <Sidebar />
      <div className="lg:ml-64 min-h-screen bg-[#F5F7FA] dark:bg-slate-900 transition-colors duration-300">
        <div className="min-h-screen">
          <main className="p-6 md:p-8">
            {/* Mobile Header */}
            <motion.div 
              className="lg:hidden flex items-center gap-4 mb-6"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <h1 className="text-xl font-bold text-[#0A2540] dark:text-white">Materias</h1>
            </motion.div>

            {/* Header */}
            <FadeIn>
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#F2B705] to-[#F59E0B] rounded-xl flex items-center justify-center">
                    <GraduationCap className="w-5 h-5 text-white" />
                  </div>
                  <h1 className="text-3xl font-bold text-[#0A2540] dark:text-white font-[Poppins] hidden lg:block">
                    Práctica por <GradientText>Materia</GradientText>
                  </h1>
                </div>
                <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-2xl">
                  Selecciona una materia para practicar preguntas específicas.
                  Tenemos <span className="font-semibold text-[#0A2540] dark:text-white">{totalQuestions} preguntas</span> disponibles.
                </p>
              </div>
            </FadeIn>

            {/* Subjects Grid */}
            <FadeInStagger className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {subjects.map((subject, index) => (
                <FadeInStaggerChild key={subject.subject_id}>
                  <motion.button
                    onClick={() => navigate(`/subjects/${subject.subject_id}`)}
                    className="w-full bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 text-left group relative overflow-hidden"
                    whileHover={{ 
                      y: -6, 
                      boxShadow: "0 20px 40px rgba(10, 37, 64, 0.12)" 
                    }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  >
                    {/* Background gradient on hover */}
                    <motion.div
                      className={`absolute inset-0 bg-gradient-to-br ${subjectColors[subject.name] || "from-slate-500 to-slate-600"} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
                    />
                    
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-5">
                        <motion.div 
                          className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${subjectColors[subject.name] || "from-slate-500 to-slate-600"} flex items-center justify-center shadow-lg`}
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          transition={{ type: "spring", stiffness: 400 }}
                        >
                          {(() => {
                            const IconComponent = subjectIcons[subject.name] || BookOpen;
                            return <IconComponent className="w-7 h-7 text-white" />;
                          })()}
                        </motion.div>
                        <motion.div
                          initial={{ opacity: 0, x: -10 }}
                          whileHover={{ opacity: 1, x: 0 }}
                          className="text-slate-400 group-hover:text-[#0A2540] dark:group-hover:text-white transition-colors"
                        >
                          <ChevronRight className="w-6 h-6" />
                        </motion.div>
                      </div>
                      
                      <h3 className="font-bold text-[#0A2540] dark:text-white text-lg mb-2 font-[Poppins] group-hover:text-[#0A2540] dark:group-hover:text-white">
                        {subject.name === "Espanol" ? "Español" : subject.name}
                      </h3>
                      
                      {subject.question_count > 0 && (
                        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                          {subject.question_count} preguntas disponibles
                        </p>
                      )}
                    </div>
                  </motion.button>
                </FadeInStaggerChild>
              ))}
            </FadeInStagger>

            {subjects.length === 0 && (
              <motion.div 
                className="text-center py-16"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <BookMarked className="w-20 h-20 mx-auto mb-6 text-slate-200 dark:text-slate-700" />
                </motion.div>
                <p className="text-slate-500 dark:text-slate-400 text-lg">No hay materias disponibles</p>
                <p className="text-slate-400 dark:text-slate-500 text-sm mt-2">Vuelve más tarde</p>
              </motion.div>
            )}
          </main>
        </div>
      </div>
    </>
  );
};

export default Subjects;
