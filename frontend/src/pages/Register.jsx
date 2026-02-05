import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpen, Mail, Lock, User, Eye, EyeOff, ArrowRight, Sparkles, CheckCircle } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { toast } from "sonner";
import { API } from "../App";
import { FadeIn, GradientText, AnimatedCounter } from "../components/animations";

const Register = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: ""
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres");
      return;
    }
    
    setLoading(true);

    try {
      const response = await fetch(`${API}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.access_token);
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("isAuthenticated", "true");
        toast.success("¡Cuenta creada exitosamente!");
        navigate("/dashboard");
      } else {
        toast.error(data.detail || "Error al crear la cuenta");
      }
    } catch (error) {
      toast.error("Error de conexión. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const benefits = [
    "3 simulacros gratis por área",
    "Retroalimentación instantánea",
    "Seguimiento de progreso"
  ];

  return (
    <div className="min-h-screen bg-[#F5F7FA] dark:bg-slate-900 flex transition-colors duration-300">
      {/* Left Side - Image */}
      <motion.div 
        className="hidden lg:flex flex-1 bg-[#0A2540] items-center justify-center p-12 relative overflow-hidden"
        initial={{ opacity: 0, x: -100 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Animated background */}
        <div className="absolute inset-0">
          <motion.div 
            className="absolute top-20 right-20 w-64 h-64 bg-[#F2B705]/20 rounded-full blur-3xl"
            animate={{ 
              scale: [1, 1.3, 1],
              x: [0, -30, 0],
              y: [0, -20, 0]
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div 
            className="absolute bottom-20 left-20 w-96 h-96 bg-[#F2B705]/10 rounded-full blur-3xl"
            animate={{ 
              scale: [1, 1.2, 1],
              x: [0, 30, 0],
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
              Comienza tu preparación
            </div>
          </motion.div>

          <motion.h2 
            className="text-4xl font-bold text-white mb-6 font-[Poppins] leading-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            Tu camino al{" "}
            <span className="text-[#F2B705]">éxito</span>
            <br />
            comienza aquí
          </motion.h2>

          <motion.p 
            className="text-white/70 text-lg mb-10"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            Únete a miles de estudiantes que se preparan para el examen de admisión más importante de México.
          </motion.p>

          <motion.div 
            className="space-y-3"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            {benefits.map((benefit, idx) => (
              <motion.div
                key={idx}
                className="flex items-center gap-3 bg-white/10 backdrop-blur rounded-xl p-4 border border-white/10"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + idx * 0.1 }}
                whileHover={{ x: 5, backgroundColor: "rgba(255,255,255,0.15)" }}
              >
                <div className="w-8 h-8 bg-[#F2B705] rounded-lg flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-5 h-5 text-[#0A2540]" />
                </div>
                <span className="text-white font-medium">{benefit}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 relative">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div 
            className="absolute bottom-20 right-10 w-72 h-72 bg-[#F2B705]/10 rounded-full blur-3xl"
            animate={{ scale: [1, 1.2, 1], x: [0, -20, 0] }}
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
            <Link to="/" className="flex items-center gap-2 mb-8">
              <motion.div 
                className="w-10 h-10 bg-[#0A2540] rounded-lg flex items-center justify-center shadow-lg"
                whileHover={{ rotate: 5, scale: 1.05 }}
              >
                <BookOpen className="w-6 h-6 text-[#F2B705]" />
              </motion.div>
              <span className="text-xl font-bold text-[#0A2540] dark:text-white font-[Poppins]">IngresoUNAM</span>
            </Link>
          </motion.div>

          <FadeIn delay={0.1}>
            <h1 className="text-3xl font-bold text-[#0A2540] dark:text-white mb-2 font-[Poppins]">
              Crear <GradientText>cuenta</GradientText>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mb-8">Comienza tu preparación para el examen UNAM</p>
          </FadeIn>

          {/* Google Signup */}
          <FadeIn delay={0.2}>
            <motion.button
              type="button"
              className="w-full mb-6 py-4 px-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-300 dark:hover:border-slate-500 transition-all flex items-center justify-center gap-3 shadow-sm"
              whileHover={{ scale: 1.01, y: -2 }}
              whileTap={{ scale: 0.99 }}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Registrarse con Google
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
                <Label htmlFor="name" className="text-[#0A2540] dark:text-white font-medium">Nombre completo</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Tu nombre"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="pl-10 py-6 border-slate-200 dark:border-slate-600 dark:bg-slate-800 dark:text-white rounded-xl focus:border-[#F2B705] focus:ring-[#F2B705]/20 transition-all"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-[#0A2540] dark:text-white font-medium">Email</Label>
                <div className="relative">
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
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-[#0A2540] dark:text-white font-medium">Contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Mínimo 6 caracteres"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="pl-10 pr-10 py-6 border-slate-200 dark:border-slate-600 dark:bg-slate-800 dark:text-white rounded-xl focus:border-[#F2B705] focus:ring-[#F2B705]/20 transition-all"
                    required
                    minLength={6}
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
                  className="w-full py-6 bg-[#F2B705] hover:bg-[#F2B705]/90 text-[#0A2540] font-semibold text-lg rounded-xl shadow-lg shadow-[#F2B705]/20"
                >
                  {loading ? (
                    <motion.div 
                      className="w-6 h-6 border-2 border-[#0A2540] border-t-transparent rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                  ) : (
                    <span className="flex items-center gap-2">
                      Crear Cuenta
                      <ArrowRight className="w-5 h-5" />
                    </span>
                  )}
                </Button>
              </motion.div>
            </form>
          </FadeIn>

          <FadeIn delay={0.4}>
            <p className="text-center mt-8 text-slate-500 dark:text-slate-400">
              ¿Ya tienes cuenta?{" "}
              <Link to="/login" className="text-[#0A2540] dark:text-white hover:text-[#F2B705] font-semibold transition-colors">
                Inicia sesión
              </Link>
            </p>
          </FadeIn>
        </div>
      </div>
    </div>
  );
};

export default Register;
