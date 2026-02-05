import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { XCircle, ArrowLeft, CreditCard } from "lucide-react";
import { Button } from "../components/ui/button";

const PaymentCancel = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F5F7FA] dark:bg-slate-900 flex items-center justify-center p-4 transition-colors duration-300">
      <motion.div 
        className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8 max-w-md w-full text-center"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
          className="w-20 h-20 bg-gradient-to-br from-red-100 to-red-50 dark:from-red-900/30 dark:to-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <XCircle className="w-10 h-10 text-[#EF4444]" />
        </motion.div>
        
        <motion.h1 
          className="text-2xl font-bold text-[#0A2540] dark:text-white mb-2 font-[Poppins]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Pago Cancelado
        </motion.h1>
        
        <motion.p 
          className="text-[#4A5568] dark:text-slate-400 mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          No te preocupes, no se realizó ningún cargo. Puedes intentarlo de nuevo cuando quieras.
        </motion.p>
        
        <motion.div 
          className="space-y-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              onClick={() => navigate("/plans")}
              className="w-full bg-[#0A2540] dark:bg-[#F2B705] dark:text-[#0A2540] dark:hover:bg-[#F2B705]/90 hover:bg-[#0A2540]/90"
            >
              <CreditCard className="w-4 h-4 mr-2" />
              Ver Planes
            </Button>
          </motion.div>
          
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              variant="outline"
              onClick={() => navigate("/dashboard")}
              className="w-full border-slate-200 dark:border-slate-600 dark:text-white dark:hover:bg-slate-700 hover:bg-slate-50"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al Dashboard
            </Button>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default PaymentCancel;
