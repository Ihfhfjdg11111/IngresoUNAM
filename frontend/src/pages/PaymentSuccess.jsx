import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle, Loader2 } from "lucide-react";

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    if (sessionId) {
      navigate(`/plans?session_id=${sessionId}`, { replace: true });
    } else {
      navigate("/plans", { replace: true });
    }
  }, [navigate, searchParams]);

  return (
    <div className="min-h-screen bg-[#F5F7FA] dark:bg-slate-900 flex items-center justify-center transition-colors duration-300">
      <motion.div 
        className="text-center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-500/30"
        >
          <CheckCircle className="w-10 h-10 text-white" />
        </motion.div>
        <h2 className="text-2xl font-bold text-[#0A2540] dark:text-white mb-2">¡Pago Exitoso!</h2>
        <p className="text-[#4A5568] dark:text-slate-400 mb-4">Redirigiendo...</p>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Loader2 className="w-6 h-6 text-[#F2B705] mx-auto" />
        </motion.div>
      </motion.div>
    </div>
  );
};

export default PaymentSuccess;
