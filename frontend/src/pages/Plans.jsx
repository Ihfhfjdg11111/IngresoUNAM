import { useState, useEffect, useContext } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Check, Crown, Zap, Shield, ArrowLeft, Loader2, Star,
  AlertTriangle, TrendingUp, Users, Clock, Target, Award, CheckCircle2,
  BookOpen
} from "lucide-react";
import { Button } from "../components/ui/button";
import { AuthContext, API } from "../App";
import { toast } from "sonner";
import { FadeIn, GradientText, GlowButton, FloatingShape } from "../components";

const Plans = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useContext(AuthContext);
  const [plans, setPlans] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkingPayment, setCheckingPayment] = useState(false);
  const [processingPlan, setProcessingPlan] = useState(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchData();
    const sessionId = searchParams.get("session_id");
    if (sessionId) {
      checkPaymentStatus(sessionId);
    }
  }, []);

  const fetchData = async () => {
    try {
      const headers = { "Authorization": `Bearer ${token}` };
      
      const [plansRes, subRes] = await Promise.all([
        fetch(`${API}/payments/plans`, { headers, credentials: "include" }),
        fetch(`${API}/payments/subscription`, { headers, credentials: "include" })
      ]);

      if (plansRes.ok) {
        const data = await plansRes.json();
        setPlans(data.plans);
      }

      if (subRes.ok) {
        const data = await subRes.json();
        setSubscription(data);
      }
    } catch (error) {
      // Error silenciado
    } finally {
      setLoading(false);
    }
  };

  const checkPaymentStatus = async (sessionId) => {
    setCheckingPayment(true);
    let attempts = 0;
    const maxAttempts = 5;

    const poll = async () => {
      try {
        const response = await fetch(`${API}/payments/checkout/status/${sessionId}`, {
          headers: { "Authorization": `Bearer ${token}` },
          credentials: "include"
        });

        if (response.ok) {
          const data = await response.json();
          
          if (data.payment_status === "paid") {
            toast.success("¡Pago exitoso! Tu suscripción está activa");
            window.history.replaceState({}, "", "/plans");
            fetchData();
            setCheckingPayment(false);
            return;
          } else if (data.status === "expired") {
            toast.error("La sesión de pago expiró");
            setCheckingPayment(false);
            return;
          }
        }

        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(poll, 2000);
        } else {
          toast.info("Verificando pago... Esto puede tomar unos minutos");
          setCheckingPayment(false);
        }
      } catch (error) {
        setCheckingPayment(false);
      }
    };

    poll();
  };

  const handleSubscribe = async (planId) => {
    setProcessingPlan(planId);
    try {
      const response = await fetch(`${API}/payments/checkout`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({
          plan_id: planId,
          origin_url: window.location.origin
        })
      });

      if (response.ok) {
        const data = await response.json();
        window.location.href = data.url;
      } else {
        const error = await response.json();
        toast.error(error.detail || "Error al procesar el pago");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error de conexión");
    } finally {
      setProcessingPlan(null);
    }
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

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("es-MX", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  };

  const getRemainingSimulators = (area) => {
    const used = subscription?.simulators_used?.[area] || 0;
    return Math.max(0, (subscription?.simulators_limit || 5) - used);
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] dark:bg-slate-900 relative overflow-hidden transition-colors duration-300">
      {/* Floating Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <FloatingShape color="rgba(242, 183, 5, 0.1)" size={300} top="-10%" left="-5%" delay={0} />
        <FloatingShape color="rgba(10, 37, 64, 0.05)" size={200} top="20%" right="-5%" delay={1} />
        <FloatingShape color="rgba(242, 183, 5, 0.08)" size={150} bottom="10%" left="10%" delay={2} />
      </div>

      {/* Header */}
      <motion.header 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-[#0A2540] text-white relative overflow-hidden"
      >
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0 bg-gradient-to-br from-[#F2B705]/20 to-transparent" />
        </div>
        <div className="max-w-5xl mx-auto px-4 py-6 relative z-10">
          <div className="flex items-center gap-4">
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/dashboard")}
                className="text-white hover:bg-white/10"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </motion.div>
            <div className="flex items-center gap-3">
              <motion.div 
                className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center"
                whileHover={{ rotate: 10 }}
              >
                <BookOpen className="w-6 h-6 text-[#F2B705]" />
              </motion.div>
              <span className="text-xl font-bold font-[Poppins]">IngresoUNAM</span>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Payment checking overlay */}
      {checkingPayment && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm"
        >
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-slate-800 rounded-xl p-8 max-w-sm mx-4 text-center shadow-2xl"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <Loader2 className="w-12 h-12 mx-auto text-[#F2B705] mb-4" />
            </motion.div>
            <h3 className="text-lg font-bold text-[#0A2540] dark:text-white mb-2">Verificando pago...</h3>
            <p className="text-[#4A5568] dark:text-slate-400">Espera mientras confirmamos tu pago</p>
          </motion.div>
        </motion.div>
      )}

      <main className="max-w-5xl mx-auto px-4 py-12 relative z-10">
        {/* Current subscription status */}
        {subscription?.is_premium ? (
          <FadeIn>
            <motion.div 
              className="bg-gradient-to-r from-[#F2B705] to-[#F59E0B] rounded-2xl p-8 mb-12 text-white shadow-2xl shadow-[#F2B705]/20 relative overflow-hidden"
              whileHover={{ scale: 1.01 }}
            >
              <div className="absolute inset-0 opacity-20">
                <motion.div 
                  className="absolute inset-0"
                  style={{
                    background: "radial-gradient(circle at 80% 20%, white 0%, transparent 50%)"
                  }}
                  animate={{ 
                    background: [
                      "radial-gradient(circle at 20% 80%, white 0%, transparent 50%)",
                      "radial-gradient(circle at 80% 20%, white 0%, transparent 50%)",
                      "radial-gradient(circle at 20% 80%, white 0%, transparent 50%)"
                    ]
                  }}
                  transition={{ duration: 5, repeat: Infinity }}
                />
              </div>
              <div className="relative z-10">
                <motion.div 
                  className="flex items-center gap-3 mb-2"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Crown className="w-8 h-8" />
                  </motion.div>
                  <h2 className="text-2xl font-bold font-[Poppins]">¡Eres Premium!</h2>
                </motion.div>
                <p className="text-white/90">
                  Tu plan <strong>{subscription.plan_name}</strong> está activo hasta el {formatDate(subscription.expires_at)}
                </p>
                <p className="mt-2 text-white/80">Tienes acceso ilimitado a todos los simulacros</p>
              </div>
            </motion.div>
          </FadeIn>
        ) : (
          <>
            {/* Free tier info */}
            <FadeIn>
              <div className="text-center mb-12">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  className="inline-block"
                >
                  <div className="w-20 h-20 bg-gradient-to-br from-[#F2B705] to-[#F59E0B] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-[#F2B705]/30">
                    <Star className="w-10 h-10 text-white" />
                  </div>
                </motion.div>
                <h1 className="text-3xl md:text-4xl font-bold text-[#0A2540] dark:text-white font-[Poppins] mb-4">
                  <GradientText>Desbloquea tu Potencial</GradientText>
                </h1>
                <p className="text-lg text-[#4A5568] dark:text-slate-400 max-w-2xl mx-auto">
                  Como usuario gratuito tienes <strong>{subscription?.simulators_limit || 5} simulacros por área</strong>. 
                  Suscríbete para acceso ilimitado y maximiza tu preparación.
                </p>
              </div>
            </FadeIn>

            {/* Usage stats */}
            <FadeIn delay={0.1}>
              <motion.div 
                className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm mb-12 border border-slate-100 dark:border-slate-700"
                whileHover={{ y: -2 }}
              >
                <h3 className="font-bold text-[#0A2540] dark:text-white mb-4">Tu uso actual (Plan Gratuito)</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {["area_1", "area_2", "area_3", "area_4"].map((area, idx) => {
                    const remaining = getRemainingSimulators(area);
                    return (
                      <motion.div 
                        key={area} 
                        className="p-4 bg-[#F5F7FA] dark:bg-slate-700 rounded-lg text-center"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.1 }}
                        whileHover={{ scale: 1.05 }}
                      >
                        <p className="text-sm text-[#4A5568] dark:text-slate-400 mb-1">Área {idx + 1}</p>
                        <p className={`text-2xl font-bold ${remaining === 0 ? 'text-[#EF4444]' : 'text-[#0A2540] dark:text-white'}`}>
                          {remaining}
                        </p>
                        <p className="text-xs text-[#4A5568] dark:text-slate-400">restantes</p>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            </FadeIn>
          </>
        )}

        {/* Why Upgrade - Exam 2025 Info */}
        {!subscription?.is_premium && (
          <>
            <FadeIn delay={0.15}>
              <motion.div 
                className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-2xl p-6 mb-8 border border-red-200 dark:border-red-800/50"
                whileHover={{ scale: 1.01 }}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-red-900 dark:text-red-200 mb-3">
                      🎓 Examen UNAM 2025: Todo ha cambiado
                    </h2>
                    <div className="grid md:grid-cols-3 gap-4 text-sm">
                      <div className="bg-white/50 dark:bg-slate-800/50 p-3 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <Clock className="w-4 h-4 text-red-600" />
                          <span className="font-semibold text-red-800 dark:text-red-200">Modalidad 100% Digital</span>
                        </div>
                        <p className="text-red-700/80 dark:text-red-300/80">Por primera vez el examen será en línea. Necesitas practicar en plataforma digital.</p>
                      </div>
                      <div className="bg-white/50 p-3 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <TrendingUp className="w-4 h-4 text-red-600" />
                          <span className="font-semibold text-red-800 dark:text-red-200">Más Competitivo</span>
                        </div>
                        <p className="text-red-700/80 dark:text-red-300/80">Aumentaron los aciertos mínimos. Solo los mejor preparados pasarán.</p>
                      </div>
                      <div className="bg-white/50 p-3 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <Users className="w-4 h-4 text-red-600" />
                          <span className="font-semibold text-red-800 dark:text-red-200">150,000 vs 15,000</span>
                        </div>
                        <p className="text-red-700/80 dark:text-red-300/80">Solo 10% de los aspirantes serán aceptados. ¿Estás listo para competir?</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </FadeIn>

            {/* Stats & Social Proof */}
            <FadeIn delay={0.2}>
              <div className="grid md:grid-cols-3 gap-4 mb-10">
                <motion.div 
                  className="bg-white dark:bg-slate-800 rounded-xl p-5 text-center shadow-sm border border-slate-100 dark:border-slate-700"
                  whileHover={{ y: -4 }}
                >
                  <div className="text-3xl font-bold text-[#10B981] mb-1">78%</div>
                  <p className="text-sm text-slate-600 dark:text-slate-300">de aceptados usaron simulacros ilimitados</p>
                </motion.div>
                <motion.div 
                  className="bg-white dark:bg-slate-800 rounded-xl p-5 text-center shadow-sm border border-slate-100 dark:border-slate-700"
                  whileHover={{ y: -4 }}
                >
                  <div className="text-3xl font-bold text-[#F2B705] mb-1">2.5x</div>
                  <p className="text-sm text-slate-600 dark:text-slate-300">más probabilidades de pasar siendo Premium</p>
                </motion.div>
                <motion.div 
                  className="bg-white dark:bg-slate-800 rounded-xl p-5 text-center shadow-sm border border-slate-100 dark:border-slate-700"
                  whileHover={{ y: -4 }}
                >
                  <div className="text-3xl font-bold text-[#0A2540] dark:text-white mb-1">3x</div>
                  <p className="text-sm text-slate-600 dark:text-slate-300">más práctica que usuarios gratuitos</p>
                </motion.div>
              </div>
            </FadeIn>

            {/* Feature Comparison */}
            <FadeIn delay={0.25}>
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg overflow-hidden mb-10 border border-slate-200 dark:border-slate-700">
                <div className="bg-[#0A2540] text-white p-4">
                  <h3 className="font-bold text-lg flex items-center gap-2">
                    <Target className="w-5 h-5 text-[#F2B705]" />
                    ¿Por qué suscribirte ahora?
                  </h3>
                </div>
                <div className="p-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-slate-400 mb-3 flex items-center gap-2">
                        Plan Gratuito
                      </h4>
                      <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                        <li className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center text-red-500 text-xs">✕</span>
                          Solo 3 simulacros por área
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center text-red-500 text-xs">✕</span>
                          Práctica limitada (5 sesiones/día)
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center text-red-500 text-xs">✕</span>
                          Sin análisis detallado de errores
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-[#F2B705] mb-3 flex items-center gap-2">
                        <Crown className="w-4 h-4" />
                        Plan Premium
                      </h4>
                      <ul className="space-y-2 text-sm text-slate-700">
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="w-5 h-5 text-[#10B981]" />
                          <strong>Simulacros ilimitados</strong> en todas las áreas
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="w-5 h-5 text-[#10B981]" />
                          <strong>Práctica ilimitada</strong> por materia
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="w-5 h-5 text-[#10B981]" />
                          <strong>Análisis por tema</strong> y seguimiento de progreso
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="w-5 h-5 text-[#10B981]" />
                          <strong>Proyección de resultados</strong> basada en tu desempeño
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </FadeIn>
          </>
        )}

        {/* Plans */}
        {!subscription?.is_premium && (
          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {plans.map((plan, index) => (
              <FadeIn key={plan.id} delay={0.2 + index * 0.1}>
                <motion.div 
                  className={`bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden border-2 ${
                    plan.id === "quarterly" ? "border-[#F2B705]" : "border-transparent"
                  }`}
                  whileHover={{ y: -8, scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                >
                  {plan.id === "quarterly" && (
                    <motion.div 
                      className="bg-gradient-to-r from-[#F2B705] to-[#F59E0B] text-[#0A2540] text-center py-2 text-sm font-bold"
                      initial={{ x: -100 }}
                      animate={{ x: 0 }}
                      transition={{ delay: 0.5 }}
                    >
                      ¡MÁS POPULAR! Ahorra 50%
                    </motion.div>
                  )}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-[#0A2540] dark:text-white font-[Poppins]">{plan.name}</h3>
                    <p className="text-[#4A5568] dark:text-slate-400 text-sm mb-4">{plan.description}</p>
                    
                    <div className="mb-6">
                      <span className="text-4xl font-bold text-[#0A2540] dark:text-white">${plan.price}</span>
                      <span className="text-[#4A5568] dark:text-slate-400 ml-1">MXN</span>
                    </div>

                    <ul className="space-y-3 mb-6">
                      {[
                        "✅ Simulacros ilimitados (40, 80, 120 preguntas)",
                        "✅ Práctica por materia sin límites",
                        "✅ Análisis de debilidades por tema",
                        "✅ Proyección de probabilidad de pasar",
                        "✅ Descarga de resultados en PDF",
                        "✅ Soporte prioritario"
                      ].map((feature, idx) => (
                        <motion.li 
                          key={idx}
                          className="flex items-center gap-2 text-sm text-[#4A5568] dark:text-slate-400"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.3 + idx * 0.1 }}
                        >
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.4 + idx * 0.1, type: "spring" }}
                          >
                            <Check className="w-5 h-5 text-[#10B981]" />
                          </motion.div>
                          {feature.replace('✅ ', '')}
                        </motion.li>
                      ))}
                    </ul>

                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button
                        onClick={() => handleSubscribe(plan.id)}
                        disabled={processingPlan !== null}
                        className={`w-full ${
                          plan.id === "quarterly" 
                            ? "bg-[#F2B705] text-[#0A2540] hover:bg-[#F2B705]/90 shadow-lg shadow-[#F2B705]/20" 
                            : "bg-[#0A2540] dark:bg-[#F2B705] dark:text-[#0A2540] dark:hover:bg-[#F2B705]/90 hover:bg-[#0A2540]/90"
                        }`}
                        data-testid={`subscribe-${plan.id}`}
                      >
                        {processingPlan === plan.id ? (
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : (
                          <Zap className="w-4 h-4 mr-2" />
                        )}
                        Suscribirse
                      </Button>
                    </motion.div>
                  </div>
                </motion.div>
              </FadeIn>
            ))}
          </div>
        )}

        {/* Trust badges */}
        <FadeIn delay={0.4}>
          <div className="mt-12 text-center">
            <div className="flex items-center justify-center gap-6 text-[#4A5568] dark:text-slate-400">
              <motion.div 
                className="flex items-center gap-2"
                whileHover={{ scale: 1.05 }}
              >
                <Shield className="w-5 h-5 text-[#10B981]" />
                <span className="text-sm">Pago seguro</span>
              </motion.div>
              <motion.div 
                className="flex items-center gap-2"
                whileHover={{ scale: 1.05 }}
              >
                <Check className="w-5 h-5 text-[#10B981]" />
                <span className="text-sm">Cancela cuando quieras</span>
              </motion.div>
            </div>
          </div>
        </FadeIn>
      </main>
    </div>
  );
};

export default Plans;
