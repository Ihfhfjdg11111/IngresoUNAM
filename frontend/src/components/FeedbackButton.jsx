import { useState } from "react";
import { MessageSquare, X, Bug, Lightbulb, Sparkles, HelpCircle, Send, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import { API } from "../App";
import { toast } from "sonner";

const feedbackTypes = [
  { id: "bug", label: "Error/Bug", icon: Bug, color: "text-red-500", bg: "bg-red-50 dark:bg-red-900/20" },
  { id: "feature", label: "Nueva función", icon: Lightbulb, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-900/20" },
  { id: "improvement", label: "Mejora", icon: Sparkles, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-900/20" },
  { id: "other", label: "Otro", icon: HelpCircle, color: "text-slate-500", bg: "bg-slate-50 dark:bg-slate-700" },
];

const FeedbackButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedType, setSelectedType] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedType || !message.trim()) return;

    setIsSubmitting(true);
    
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API}/feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        credentials: "include",
        body: JSON.stringify({
          type: selectedType,
          message: message.trim(),
          page: window.location.pathname
        })
      });

      if (response.ok) {
        setIsSuccess(true);
        toast.success("¡Gracias por tu feedback!");
        setTimeout(() => {
          setIsOpen(false);
          setIsSuccess(false);
          setSelectedType("");
          setMessage("");
        }, 2000);
      } else {
        const error = await response.json();
        toast.error(error.detail || "Error al enviar feedback");
      }
    } catch (error) {
      toast.error("Error de conexión");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setIsOpen(false);
      setSelectedType("");
      setMessage("");
      setIsSuccess(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-[#F2B705] hover:bg-[#F59E0B] text-[#0A2540] rounded-full shadow-lg flex items-center justify-center transition-colors"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        title="Enviar feedback"
      >
        <MessageSquare className="w-6 h-6" />
      </motion.button>

      {/* Dialog */}
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-[#0A2540] dark:text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-[#F2B705]" />
              Enviar Feedback
            </DialogTitle>
            <DialogDescription className="text-slate-500 dark:text-slate-400">
              Ayúdanos a mejorar la plataforma
            </DialogDescription>
          </DialogHeader>

          <AnimatePresence mode="wait">
            {isSuccess ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="py-12 flex flex-col items-center justify-center text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                >
                  <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
                </motion.div>
                <h3 className="text-lg font-semibold text-[#0A2540] dark:text-white mb-2">
                  ¡Gracias!
                </h3>
                <p className="text-slate-500 dark:text-slate-400">
                  Tu feedback nos ayuda a mejorar
                </p>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onSubmit={handleSubmit}
                className="space-y-4 mt-4"
              >
                {/* Feedback Type Selection */}
                <div>
                  <label className="text-sm font-medium text-[#0A2540] dark:text-white mb-2 block">
                    ¿Qué tipo de feedback es?
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {feedbackTypes.map((type) => {
                      const Icon = type.icon;
                      const isSelected = selectedType === type.id;
                      return (
                        <button
                          key={type.id}
                          type="button"
                          onClick={() => setSelectedType(type.id)}
                          className={`flex items-center gap-2 p-3 rounded-lg border transition-all ${
                            isSelected
                              ? `border-[#F2B705] bg-[#F2B705]/10 dark:bg-[#F2B705]/20`
                              : `border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 ${type.bg}`
                          }`}
                        >
                          <Icon className={`w-4 h-4 ${type.color}`} />
                          <span className={`text-sm font-medium ${isSelected ? 'text-[#0A2540] dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>
                            {type.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Message Input */}
                <div>
                  <label className="text-sm font-medium text-[#0A2540] dark:text-white mb-2 block">
                    Tu mensaje
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Describe tu sugerencia, reporta un error o comparte tus ideas..."
                    className="w-full min-h-[120px] p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-[#0A2540] dark:text-white placeholder:text-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-[#F2B705]/50"
                    required
                    minLength={5}
                  />
                  <p className="text-xs text-slate-400 mt-1">
                    Mínimo 5 caracteres
                  </p>
                </div>

                {/* Submit Button */}
                <div className="flex gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleClose}
                    className="flex-1 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700"
                    disabled={isSubmitting}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-[#0A2540] hover:bg-[#0A2540]/90 text-white"
                    disabled={!selectedType || !message.trim() || message.length < 5 || isSubmitting}
                  >
                    {isSubmitting ? (
                      <motion.div
                        className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Enviar
                      </>
                    )}
                  </Button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default FeedbackButton;
