import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  BookOpen, Crown, CreditCard, Calendar, CheckCircle, 
  ArrowLeft, Zap, Sparkles, Award, MessageSquare
} from "lucide-react";
import { Button } from "../components/ui/button";
import { AuthContext, API } from "../App";
import { toast } from "sonner";
import Sidebar from "../components/Sidebar";
import { FadeIn, GradientText } from "../components";

const Subscription = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [subscription, setSubscription] = useState(null);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);

  const token = localStorage.getItem("token");
  const headers = { "Authorization": `Bearer ${token}` };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [subRes, plansRes] = await Promise.all([
        fetch(`${API}/payments/subscription`, { headers, credentials: "include" }),
        fetch(`${API}/payments/plans`, { headers, credentials: "include" })
      ]);

      if (subRes.ok) setSubscription(await subRes.json());
      if (plansRes.ok) {
        const data = await plansRes.json();
        setPlans(data.plans || []);
      }
    } catch (error) {
      // Error silenciado
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (planId) => {
    setUpgrading(true);
    try {
      const response = await fetch(`${API}/payments/checkout`, {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          plan_id: planId,
          origin_url: window.location.origin
        })
      });

      if (response.ok) {
        const data = await response.json();
        window.location.href = data.checkout_url;
      } else {
        toast.error("Error al procesar. Intenta de nuevo.");
      }
    } catch (error) {
      toast.error("Error de conexión");
    } finally {
      setUpgrading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("es-MX", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F7FA] dark:bg-slate-900 flex items-center justify-center">
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
      <Sidebar />
      <div className="lg:ml-64 min-h-screen">
        <div className="py-8 px-4 max-w-3xl mx-auto">
          {/* Back Button */}
          <FadeIn>
            <Button
              variant="ghost"
              onClick={() => navigate("/dashboard")}
              className="mb-6 text-[#4A5568] dark:text-slate-400 hover:text-[#0A2540] dark:hover:text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al Dashboard
            </Button>
          </FadeIn>

          {/* Header */}
          <FadeIn delay={0.05}>
            <div className="flex items-center gap-3 mb-8">
              <motion.div 
                className="w-12 h-12 bg-gradient-to-br from-[#0A2540] to-[#1a3a5c] rounded-xl flex items-center justify-center shadow-lg"
                whileHover={{ rotate: 10, scale: 1.05 }}
              >
                <BookOpen className="w-7 h-7 text-[#F2B705]" />
              </motion.div>
              <div>
                <h1 className="text-2xl font-bold text-[#0A2540] dark:text-white font-[Poppins]">Mi Suscripción</h1>
                <p className="text-[#4A5568] dark:text-slate-400 text-sm">Gestiona tu plan de IngresoUNAM</p>
              </div>
            </div>
          </FadeIn>

          {/* Current Plan Card */}
          <FadeIn delay={0.1}>
            <motion.div 
              className={`rounded-2xl p-6 mb-8 relative overflow-hidden ${
                subscription?.is_premium 
                  ? "bg-gradient-to-r from-[#10B981] to-[#059669] text-white" 
                  : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              }`}
              whileHover={{ scale: 1.01 }}
              transition={{ duration: 0.3 }}
            >
              {subscription?.is_premium && (
                <div className="absolute inset-0 opacity-10">
                  <motion.div
                    className="absolute inset-0"
                    style={{
                      backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
                      backgroundSize: "20px 20px"
                    }}
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  />
                </div>
              )}
              
              <div className="relative z-10">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <motion.div
                        animate={subscription?.is_premium ? { rotate: [0, 10, -10, 0] } : {}}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <Crown className={`w-6 h-6 ${subscription?.is_premium ? "text-white" : "text-[#F2B705]"}`} />
                      </motion.div>
                      <span className={`text-sm font-medium ${subscription?.is_premium ? "text-white/80" : "text-[#4A5568] dark:text-slate-400"}`}>
                        Plan Actual
                      </span>
                    </div>
                    <h2 className={`text-2xl font-bold mb-1 font-[Poppins] ${
                      subscription?.is_premium ? "text-white" : "text-[#0A2540] dark:text-white"
                    }`}>
                      {subscription?.is_premium ? subscription.plan_name : "Plan Gratuito"}
                    </h2>
                    {subscription?.is_premium ? (
                      <p className="text-white/80 text-sm">
                        Acceso ilimitado a todos los simulacros
                      </p>
                    ) : (
                      <p className="text-[#4A5568] dark:text-slate-400 text-sm">
                        {subscription?.simulators_limit || 3} simulacros gratuitos por área
                      </p>
                    )}
                  </div>
                  {subscription?.is_premium && (
                    <div className="text-right">
                      <p className="text-white/80 text-sm">Válido hasta</p>
                      <p className="text-white font-medium">{formatDate(subscription.expires_at)}</p>
                    </div>
                  )}
                </div>

                {/* Usage Stats for Free Plan */}
                {!subscription?.is_premium && (
                  <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                    <p className="text-sm font-medium text-[#0A2540] dark:text-white mb-3">Uso por área:</p>
                    <div className="grid grid-cols-2 gap-3">
                      {["area_1", "area_2", "area_3", "area_4"].map((area, idx) => {
                        const used = subscription?.simulators_used?.[area] || 0;
                        const limit = subscription?.simulators_limit || 3;
                        const remaining = limit - used;
                        return (
                          <motion.div 
                            key={area} 
                            className="flex items-center justify-between p-3 bg-[#F5F7FA] dark:bg-slate-800 rounded-lg"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                          >
                            <span className="text-sm text-[#4A5568] dark:text-slate-400">Área {idx + 1}</span>
                            <span className={`text-sm font-medium ${remaining > 0 ? "text-[#10B981]" : "text-[#EF4444]"}`}>
                              {remaining}/{limit}
                            </span>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </FadeIn>

          {/* Upgrade Options */}
          {!subscription?.is_premium && (
            <FadeIn delay={0.2}>
              <div>
                <h3 className="text-lg font-bold text-[#0A2540] dark:text-white mb-4 font-[Poppins] flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#F2B705]" />
                  Actualizar a Premium
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {plans.map((plan, index) => (
                    <motion.div
                      key={plan.id}
                      className="bg-white dark:bg-slate-800 rounded-xl p-6 border-2 border-slate-200 dark:border-slate-700 hover:border-[#F2B705] transition-all"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      whileHover={{ y: -4, boxShadow: "0 20px 40px -10px rgba(242, 183, 5, 0.2)" }}
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <Zap className="w-5 h-5 text-[#F2B705]" />
                        <span className="font-bold text-[#0A2540] dark:text-white">{plan.name}</span>
                      </div>
                      <p className="text-3xl font-bold text-[#0A2540] dark:text-white mb-1">
                        ${plan.price} <span className="text-sm font-normal text-[#4A5568] dark:text-slate-400">MXN</span>
                      </p>
                      <p className="text-sm text-[#4A5568] dark:text-slate-400 mb-4">{plan.description}</p>
                      <ul className="space-y-2 mb-6">
                        {[
                          "Simulacros ilimitados",
                          "Todas las áreas",
                          "Estadísticas completas"
                        ].map((feature, idx) => (
                          <li key={idx} className="flex items-center gap-2 text-sm text-[#4A5568] dark:text-slate-400">
                            <CheckCircle className="w-4 h-4 text-[#10B981]" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                          onClick={() => handleUpgrade(plan.id)}
                          disabled={upgrading}
                          className="w-full bg-[#F2B705] text-[#0A2540] hover:bg-[#F2B705]/90 shadow-lg shadow-[#F2B705]/20"
                        >
                          {upgrading ? "Procesando..." : "Suscribirse"}
                        </Button>
                      </motion.div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </FadeIn>
          )}

          {/* Premium Benefits Reminder */}
          {subscription?.is_premium && (
            <FadeIn delay={0.2}>
              <motion.div 
                className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700"
                whileHover={{ y: -2 }}
              >
                <h3 className="font-bold text-[#0A2540] dark:text-white mb-4 font-[Poppins] flex items-center gap-2">
                  <Award className="w-5 h-5 text-[#F2B705]" />
                  Tus beneficios Premium
                </h3>
                <div className="space-y-3">
                  {[
                    "Simulacros ilimitados en todas las áreas",
                    "Estadísticas detalladas de rendimiento",
                    "Acceso a todas las preguntas y explicaciones"
                  ].map((benefit, idx) => (
                    <motion.div 
                      key={idx}
                      className="flex items-center gap-3"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + idx * 0.1 }}
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.4 + idx * 0.1, type: "spring" }}
                      >
                        <CheckCircle className="w-5 h-5 text-[#10B981]" />
                      </motion.div>
                      <span className="text-[#4A5568] dark:text-slate-400">{benefit}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </FadeIn>
          )}

          {/* Feedback Section */}
          <FadeIn delay={0.3}>
            <motion.div 
              className="mt-8 p-6 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-700"
              whileHover={{ scale: 1.01 }}
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#F2B705]/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="w-6 h-6 text-[#F2B705]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#0A2540] dark:text-white font-[Poppins]">
                      ¿Tienes sugerencias sobre los planes?
                    </h3>
                    <p className="text-sm text-[#4A5568] dark:text-slate-400 mt-1">
                      Estamos constantemente mejorando. Cuéntanos qué te gustaría ver en la plataforma.
                    </p>
                  </div>
                </div>
                <motion.button
                  onClick={() => document.querySelector('[title="Enviar feedback"]')?.click()}
                  className="px-5 py-2.5 bg-[#0A2540] hover:bg-[#0A2540]/90 text-white font-medium rounded-xl transition-colors flex items-center gap-2 flex-shrink-0"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <MessageSquare className="w-4 h-4" />
                  Enviar feedback
                </motion.button>
              </div>
            </motion.div>
          </FadeIn>
        </div>
      </div>
    </div>
  );
};

export default Subscription;
