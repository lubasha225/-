import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, Info, AlertTriangle, X } from 'lucide-react';

interface ToastProps {
  toast: {
    visible: boolean;
    title: string;
    message: string;
    type?: 'success' | 'info' | 'warn';
  } | null;
  onClose: () => void;
}

export default function Toast({ toast, onClose }: ToastProps) {
  if (!toast || !toast.visible) return null;

  const iconMap = {
    success: <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />,
    info: <Info className="w-5 h-5 text-indigo-500 shrink-0" />,
    warn: <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        className="fixed top-5 right-5 z-50 max-w-sm w-full bg-white/80 dark:bg-zinc-900/90 backdrop-blur-xl border border-white/20 dark:border-zinc-800/50 rounded-2xl shadow-2xl p-4 flex items-start gap-3 pointer-events-auto"
      >
        {iconMap[toast.type || 'success']}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">{toast.title}</p>
          <p className="text-zinc-500 dark:text-zinc-400 text-xs mt-0.5 leading-relaxed">{toast.message}</p>
        </div>
        <button
          onClick={onClose}
          className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors p-1 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800"
        >
          <X className="w-4 h-4" />
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
