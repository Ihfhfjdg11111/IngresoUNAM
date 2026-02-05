import { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpen, Mail, Lock, Eye, EyeOff, Chrome, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { AnimatedButton } from "../components/ui/AnimatedButton";
import { toast } from "sonner";
import { API } from "../App";
import { FadeIn, GradientText, AnimatedCounter } from "../components/animations";

const Login = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  useEffect(() => {
    const code = searchParams.get("code");
    if (code) {
      handleGoogleCallback(code);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const handleGoogleCallback = async (code) => {
    setLoading(true);
    try {
      const response = await fetch(`${API}/auth/google/callback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ code })
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.access_token);
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("isAuthenticated", "true");
        toast.success("¡Bienvenido!");
        navigate("/dashboard");
      } else {
        toast.error(data.detail || "Error al iniciar sesión con Google");
      }
    } catch (error) {
      toast.error("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.access_token);
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("isAuthenticated", "true");
        toast.success("¡Bienvenido de vuelta!");
        navigate("/dashboard");
      } else {
        toast.error(data.detail || "Error al iniciar sesión");
      }
    } catch (error) {
      toast.error("Error de conexión. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const response = await fetch(`${API}/auth/google/url`);
      const data = await response.json();
      
      if (response.ok && data.auth_url) {
        window.location.href = data.auth_url;
      } else {
        toast.error("Error al iniciar sesión con Google");
      }
    } catch (error) {
      toast.error("Error de conexión");
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] dark:bg-slate-900 flex transition-colors duration-300">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 relative">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div 
            className="absolute top-20 left-10 w-72 h-72 bg-[#F2B705]/10 rounded-full blur-3xl"
            animate={{ scale: [1, 1.2, 1], x: [0, 20, 0] }}
            transition={{ duration: 8, repeat: Infinity }}
          />
        </div>

        <div className="w-full max-w-md relative z-10">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link to="/" className="flex items-center gap-3 mb-8">
              <motion.div 
                className="w-12 h-12 bg-[#0A2540] rounded-xl flex items-center justify-center shadow-lg"
                whileHover={{ rotate: 5, scale: 1.05 }}
              >
                <BookOpen className="w-7 h-7 text-[#F2B705]" />
              </motion.div>
              <div>
                <span className="text-2xl font-bold text-[#0A2540] dark:text-white font-[Poppins] block">IngresoUNAM</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">Tu camino al examen UNAM</span>
              </div>
            </Link>
          </motion.div>

          <FadeIn delay={0.1}>
            <h1 className="text-3xl font-bold text-[#0A2540] dark:text-white mb-2 font-[Poppins]">
              Bienvenido de <GradientText>vuelta</GradientText>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mb-8">Continúa tu preparación para el examen UNAM</p>
          </FadeIn>

          {/* Google Login */}
          <FadeIn delay={0.2}>
            <motion.button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full mb-6 py-4 px-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-300 dark:hover:border-slate-500 transition-all flex items-center justify-center gap-3 shadow-sm"
              whileHover={{ scale: 1.01, y: -2 }}
              whileTap={{ scale: 0.99 }}
            >
              <Chrome className="w-5 h-5 text-blue-500" />
              {loading ? "Procesando..." : "Continuar con Google"}
            </motion.button>
          </FadeIn>

          <FadeIn delay={0.25}>
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-slate-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-[#F5F7FA] dark:bg-slate-900 text-slate-400">o con email</span>
              </div>
            </div>
          </FadeIn>

          {/* Email Form */}
          <FadeIn delay={0.3}>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-[#0A2540] dark:text-white font-medium">Email</Label>
                <motion.div 
                  className="relative"
                  whileFocus={{ scale: 1.01 }}
                >
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="pl-10 py-6 border-slate-200 dark:border-slate-600 dark:bg-slate-800 dark:text-white rounded-xl focus:border-[#F2B705] focus:ring-[#F2B705]/20 transition-all"
                    required
                  />
                </motion.div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-[#0A2540] dark:text-white font-medium">Contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="pl-10 pr-10 py-6 border-slate-200 dark:border-slate-600 dark:bg-slate-800 dark:text-white rounded-xl focus:border-[#F2B705] focus:ring-[#F2B705]/20 transition-all"
                    required
                  />
                  <motion.button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#0A2540] dark:hover:text-white transition-colors"
                    whileTap={{ scale: 0.9 }}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </motion.button>
                </div>
              </div>

              <motion.div
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full py-6 bg-[#0A2540] hover:bg-[#0A2540]/90 text-white rounded-xl font-semibold text-lg shadow-lg shadow-[#0A2540]/20"
                >
                  {loading ? (
                    <motion.div 
                      className="w-6 h-6 border-2 border-white border-t-transparent rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                  ) : (
                    <span className="flex items-center gap-2">
                      Iniciar Sesión
                      <ArrowRight className="w-5 h-5" />
                    </span>
                  )}
                </Button>
              </motion.div>
            </form>
          </FadeIn>

          <FadeIn delay={0.4}>
            <p className="text-center mt-8 text-slate-500 dark:text-slate-400">
              ¿No tienes cuenta?{" "}
              <Link to="/register" className="text-[#F2B705] hover:text-[#F2B705]/80 font-semibold transition-colors">
                Regístrate gratis
              </Link>
            </p>
          </FadeIn>
        </div>
      </div>

      {/* Right Side - Image */}
      <motion.div 
        className="hidden lg:flex flex-1 bg-[#0A2540] items-center justify-center p-12 relative overflow-hidden"
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Animated background */}
        <div className="absolute inset-0">
          <motion.div 
            className="absolute top-20 left-20 w-64 h-64 bg-[#F2B705]/20 rounded-full blur-3xl"
            animate={{ 
              scale: [1, 1.3, 1],
              x: [0, 30, 0],
              y: [0, -20, 0]
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div 
            className="absolute bottom-20 right-20 w-96 h-96 bg-[#F2B705]/10 rounded-full blur-3xl"
            animate={{ 
              scale: [1, 1.2, 1],
              x: [0, -30, 0],
              y: [0, 30, 0]
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

        <div className="relative text-center max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 bg-white/10 text-white px-4 py-2 rounded-full text-sm mb-6 backdrop-blur-sm border border-white/10">
              <Sparkles className="w-4 h-4 text-[#F2B705]" />
              Prepárate para el éxito
            </div>
          </motion.div>

          <motion.h2 
            className="text-4xl font-bold text-white mb-6 font-[Poppins] leading-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            Tu futuro en la{" "}
            <span className="text-[#F2B705]">UNAM</span>
            <br />
            comienza aquí
          </motion.h2>

          <motion.p 
            className="text-white/70 text-lg mb-10"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            Simulacros diseñados para maximizar tu preparación y aumentar tus posibilidades de éxito.
          </motion.p>

          <motion.div 
            className="grid grid-cols-2 gap-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            <motion.div 
              className="bg-white/10 backdrop-blur rounded-2xl p-5 border border-white/10"
              whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.15)" }}
            >
              <p className="text-4xl font-bold text-[#F2B705]">
                <AnimatedCounter value={120} duration={2} />
              </p>
              <p className="text-white/70 text-sm mt-1">Preguntas por examen</p>
            </motion.div>
            <motion.div 
              className="bg-white/10 backdrop-blur rounded-2xl p-5 border border-white/10"
              whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.15)" }}
            >
              <p className="text-4xl font-bold text-[#F2B705]">
                <AnimatedCounter value={180} duration={2} />
              </p>
              <p className="text-white/70 text-sm mt-1">Minutos de práctica</p>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
