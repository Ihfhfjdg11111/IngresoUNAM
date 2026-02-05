import { useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { 
  BookOpen, Target, TrendingUp, CheckCircle, 
  Zap, Brain, Award, Sparkles, Play, Star, ArrowRight,
  Monitor, AlertTriangle, TrendingUp as TrendUp, Clock
} from "lucide-react";
import { AnimatedButton, GlowButton } from "../components/ui/AnimatedButton";
import { ModernCard, StatCard } from "../components/ui/ModernCard";
import { 
  FadeIn, FadeInStagger, FadeInStaggerChild,
  FloatingElement, GradientText, AnimatedCounter 
} from "../components/animations";

const Landing = () => {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });
  
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  const benefits = [
    {
      icon: Brain,
      title: "Familiarízate con el formato",
      description: "Conoce exactamente cómo será tu examen: 120 preguntas, 180 minutos, mismo orden de materias."
    },
    {
      icon: Zap,
      title: "Identifica tus debilidades",
      description: "Descubre qué materias necesitas reforzar antes del examen real."
    },
    {
      icon: TrendingUp,
      title: "Mejora tu velocidad",
      description: "Practica gestionar tu tiempo: tienes solo 1.5 minutos por pregunta."
    },
    {
      icon: Award,
      title: "Aumenta tu confianza",
      description: "Llega al examen real sin nervios, sabiendo exactamente qué esperar."
    }
  ];

  const features = [
    { icon: Target, text: "Simulacros idénticos al examen UNAM" },
    { icon: Star, text: "Retroalimentación detallada por materia" },
    { icon: CheckCircle, text: "3 simulacros gratuitos por área" }
  ];

  return (
    <div ref={containerRef} className="min-h-screen bg-[#F5F7FA] dark:bg-slate-900 overflow-x-hidden transition-colors duration-300">
      {/* Navigation */}
      <motion.nav 
        className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-700/50"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <motion.div 
            className="flex items-center gap-2"
            whileHover={{ scale: 1.02 }}
          >
            <motion.div 
              className="w-10 h-10 bg-[#0A2540] rounded-xl flex items-center justify-center shadow-lg"
              whileHover={{ rotate: 5 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <BookOpen className="w-6 h-6 text-[#F2B705]" />
            </motion.div>
            <span className="text-xl font-bold text-[#0A2540] dark:text-white font-[Poppins]">IngresoUNAM</span>
          </motion.div>
          
          <div className="flex items-center gap-3">
            <motion.button
              onClick={() => navigate("/login")}
              className="px-4 py-2 text-[#0A2540] dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg font-medium transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Iniciar Sesión
            </motion.button>
            <AnimatedButton
              onClick={() => navigate("/register")}
              variant="secondary"
              size="sm"
            >
              Registrarse
            </AnimatedButton>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 min-h-[90vh] flex items-center">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div 
            className="absolute top-20 left-10 w-72 h-72 bg-[#F2B705]/20 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              x: [0, 30, 0],
              y: [0, -20, 0]
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div 
            className="absolute bottom-20 right-10 w-96 h-96 bg-[#0A2540]/10 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.1, 1],
              x: [0, -20, 0],
              y: [0, 30, 0]
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-[#F2B705]/5 to-transparent rounded-full blur-3xl"
            style={{ y }}
          />
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <FadeIn delay={0.1}>
            <motion.div 
              className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-100 to-amber-50 text-[#0A2540] px-5 py-2.5 rounded-full text-sm font-medium mb-8 border border-amber-200/50 shadow-sm"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="w-4 h-4 text-[#F2B705]" />
              </motion.div>
              Simulacros estilo UNAM 2025
            </motion.div>
          </FadeIn>
          
          <FadeIn delay={0.2}>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-[#0A2540] dark:text-white mb-6 leading-tight font-[Poppins]">
              Prepárate para tu{" "}
              <GradientText className="font-bold">examen UNAM</GradientText>
            </h1>
          </FadeIn>
          
          <FadeIn delay={0.3}>
            <p className="text-xl text-slate-600 dark:text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed">
              Practica con simulacros idénticos al examen real. 
              <span className="text-[#0A2540] font-semibold"> 120 preguntas</span>, 
              <span className="text-[#0A2540] font-semibold"> 180 minutos</span>, 
              las mismas materias.
            </p>
          </FadeIn>
          
          <FadeIn delay={0.4}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <GlowButton
                onClick={() => navigate("/register")}
                className="text-lg px-10 py-4"
              >
                <span className="flex items-center gap-2">
                  Comenzar Gratis
                  <motion.span
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <ArrowRight className="w-5 h-5" />
                  </motion.span>
                </span>
              </GlowButton>
              
              <motion.button
                onClick={() => navigate("/login")}
                className="px-8 py-4 bg-white text-[#0A2540] rounded-xl font-semibold border-2 border-[#0A2540]/10 hover:border-[#0A2540]/30 hover:shadow-lg transition-all flex items-center justify-center gap-2"
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <Play className="w-5 h-5" />
                Ya tengo cuenta
              </motion.button>
            </div>
          </FadeIn>

          {/* Feature pills */}
          <FadeIn delay={0.5}>
            <div className="flex flex-wrap justify-center gap-3">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  className="flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-full text-sm text-slate-600 dark:text-slate-300 shadow-sm border border-slate-200/50 dark:border-slate-600/50"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -2 }}
                >
                  <feature.icon className="w-4 h-4 text-[#F2B705]" />
                  {feature.text}
                </motion.div>
              ))}
            </div>
          </FadeIn>
        </div>

        {/* Scroll indicator */}
        <motion.div 
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          style={{ opacity }}
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-6 h-10 border-2 border-slate-300 rounded-full flex justify-center pt-2"
          >
            <motion.div 
              className="w-1.5 h-3 bg-slate-400 rounded-full"
              animate={{ y: [0, 12, 0], opacity: [1, 0.3, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </motion.div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <FadeInStagger className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FadeInStaggerChild>
              <StatCard
                title="Preguntas por examen"
                value={<AnimatedCounter value={120} duration={2} />}
                subtitle="Mismo formato que la UNAM"
                icon={BookOpen}
                color="yellow"
              />
            </FadeInStaggerChild>
            <FadeInStaggerChild>
              <StatCard
                title="Materias evaluadas"
                value={<AnimatedCounter value={10} duration={2} />}
                subtitle="Todas las áreas del conocimiento"
                icon={Target}
                color="blue"
              />
            </FadeInStaggerChild>
            <FadeInStaggerChild>
              <StatCard
                title="Minutos para resolver"
                value={<AnimatedCounter value={180} duration={2} />}
                subtitle="1.5 minutos por pregunta"
                icon={Zap}
                color="green"
              />
            </FadeInStaggerChild>
          </FadeInStagger>
        </div>
      </section>

      {/* Examen 2026 - Modalidad Online Alert */}
      <section className="py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <FadeIn>
            <motion.div 
              className="relative overflow-hidden rounded-3xl p-8 md:p-10 bg-gradient-to-br from-[#0A2540] via-[#0A2540] to-[#1a3a5c] text-white"
              whileHover={{ scale: 1.01 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              {/* Background decoration */}
              <div className="absolute top-0 right-0 w-96 h-96 bg-[#F2B705]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
              
              <div className="relative z-10">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-6">
                  <motion.div 
                    className="w-16 h-16 bg-[#F2B705] rounded-2xl flex items-center justify-center flex-shrink-0"
                    animate={{ 
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, -5, 0]
                    }}
                    transition={{ duration: 4, repeat: Infinity }}
                  >
                    <Monitor className="w-8 h-8 text-[#0A2540]" />
                  </motion.div>
                  <div>
                    <motion.span 
                      className="inline-block px-3 py-1 bg-[#F2B705] text-[#0A2540] rounded-full text-xs font-bold mb-2"
                      whileHover={{ scale: 1.05 }}
                    >
                      IMPORTANTE 2026
                    </motion.span>
                    <h2 className="text-2xl md:text-3xl font-bold font-[Poppins]">
                      El examen UNAM será <span className="text-[#F2B705]">100% en línea</span>
                    </h2>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                        <AlertTriangle className="w-5 h-5 text-red-400" />
                      </div>
                      <h3 className="font-bold text-lg">Mayor dificultad esperada</h3>
                    </div>
                    <p className="text-white/80 text-sm leading-relaxed">
                      La nueva modalidad <strong>100% digital</strong> probablemente eleve los aciertos mínimos requeridos. La práctica en plataforma en línea será esencial para adaptarte al formato.
                    </p>
                  </div>

                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-[#F2B705]/20 rounded-lg flex items-center justify-center">
                        <TrendUp className="w-5 h-5 text-[#F2B705]" />
                      </div>
                      <h3 className="font-bold text-lg">Competencia extrema</h3>
                    </div>
                    <p className="text-white/80 text-sm leading-relaxed">
                      Con <strong>150,000+ aspirantes</strong> por solo <strong>15,000 lugares</strong>, solo el 10% será aceptado. La preparación decidida será la diferencia.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <motion.div 
                    className="flex items-center gap-4 bg-white/10 rounded-xl px-5 py-3 border border-white/20"
                    whileHover={{ scale: 1.02 }}
                  >
                    <Clock className="w-5 h-5 text-[#F2B705]" />
                    <span className="text-sm">Tiempo limitado para prepararte</span>
                  </motion.div>
                  
                  <AnimatedButton
                    onClick={() => navigate("/register")}
                    variant="primary"
                    className="bg-[#F2B705] text-[#0A2540] hover:bg-[#F2B705]/90"
                  >
                    Comienza a prepararte ahora
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </AnimatedButton>
                </div>
              </div>
            </motion.div>
          </FadeIn>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 bg-white dark:bg-slate-800 relative overflow-hidden transition-colors duration-300">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-[#F2B705]/5 to-transparent" />
        
        <div className="max-w-6xl mx-auto relative z-10">
          <FadeIn>
            <div className="text-center mb-16">
              <motion.span 
                className="inline-block px-4 py-1.5 bg-[#0A2540]/5 dark:bg-slate-700 text-[#0A2540] dark:text-white rounded-full text-sm font-medium mb-4"
                whileHover={{ scale: 1.05 }}
              >
                ¿Por qué usar simulacros?
              </motion.span>
              <h2 className="text-3xl md:text-4xl font-bold text-[#0A2540] mb-4 font-[Poppins]">
                Los estudiantes que practican
                <br />
                <GradientText>tienen mayor probabilidad de ingresar</GradientText>
              </h2>
            </div>
          </FadeIn>

          <div className="grid md:grid-cols-2 gap-6">
            {benefits.map((benefit, index) => (
              <FadeIn key={index} delay={index * 0.1} direction="up">
                <motion.div
                  className="group relative bg-slate-50 dark:bg-slate-700 rounded-2xl p-6 border border-slate-100 dark:border-slate-600 hover:border-[#F2B705]/30 transition-colors"
                  whileHover={{ y: -4 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <div className="flex gap-5">
                    <motion.div 
                      className="w-14 h-14 bg-gradient-to-br from-[#F2B705] to-[#FFD54F] rounded-xl flex items-center justify-center text-[#0A2540] flex-shrink-0 shadow-lg"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      <benefit.icon className="w-7 h-7" />
                    </motion.div>
                    <div>
                      <h3 className="font-bold text-[#0A2540] dark:text-white mb-2 text-lg font-[Poppins] group-hover:text-[#F2B705] transition-colors">
                        {benefit.title}
                      </h3>
                      <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                        {benefit.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 bg-[#0A2540] relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0">
          <motion.div 
            className="absolute top-0 left-1/4 w-96 h-96 bg-[#F2B705]/10 rounded-full blur-3xl"
            animate={{
              x: [0, 50, 0],
              y: [0, 30, 0],
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div 
            className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#F2B705]/5 rounded-full blur-3xl"
            animate={{
              x: [0, -30, 0],
              y: [0, -50, 0],
            }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          />
          {/* Grid pattern */}
          <div className="absolute inset-0 opacity-5" style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }} />
        </div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <FadeIn>
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 bg-white/10 text-white px-5 py-2 rounded-full text-sm font-medium mb-6 backdrop-blur-sm border border-white/20"
            >
              <Star className="w-4 h-4 text-[#F2B705]" />
              Comienza hoy mismo
            </motion.div>
          </FadeIn>
          
          <FadeIn delay={0.1}>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 font-[Poppins] leading-tight">
              Empieza tu preparación
              <br />
              <span className="text-[#F2B705]">sin costo</span>
            </h2>
          </FadeIn>
          
          <FadeIn delay={0.2}>
            <p className="text-white/70 text-lg mb-10 max-w-xl mx-auto">
              3 simulacros gratis por área. Sin tarjeta de crédito. 
              Sin compromisos. Solo resultados.
            </p>
          </FadeIn>
          
          <FadeIn delay={0.3}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <GlowButton
                onClick={() => navigate("/register")}
                className="text-lg px-12 py-5"
              >
                <span className="flex items-center gap-2">
                  Crear Cuenta Gratis
                  <ArrowRight className="w-5 h-5" />
                </span>
              </GlowButton>
            </div>
          </FadeIn>
          
          <FadeIn delay={0.4}>
            <div className="mt-12 flex flex-wrap justify-center gap-8 text-white/50 text-sm">
              <motion.span 
                className="flex items-center gap-2"
                whileHover={{ color: "#F2B705", scale: 1.05 }}
              >
                <CheckCircle className="w-4 h-4" />
                Sin tarjeta de crédito
              </motion.span>
              <motion.span 
                className="flex items-center gap-2"
                whileHover={{ color: "#F2B705", scale: 1.05 }}
              >
                <CheckCircle className="w-4 h-4" />
                Cancela cuando quieras
              </motion.span>
              <motion.span 
                className="flex items-center gap-2"
                whileHover={{ color: "#F2B705", scale: 1.05 }}
              >
                <CheckCircle className="w-4 h-4" />
                Soporte 24/7
              </motion.span>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-4 bg-[#0A2540] border-t border-white/10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <motion.div 
            className="flex items-center gap-2"
            whileHover={{ scale: 1.02 }}
          >
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-[#F2B705]" />
            </div>
            <span className="text-white font-bold text-lg">IngresoUNAM</span>
          </motion.div>
          <p className="text-white/40 text-sm">
            © 2025 IngresoUNAM. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
