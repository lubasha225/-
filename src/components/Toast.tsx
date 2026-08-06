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
      <div className="fixed top-6 inset-x-0 z-[120] flex justify-center items-start pointer-events-none px-4">
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.92 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-md w-full bg-white/10 dark:bg-zinc-900/15 border border-white/40 dark:border-white/20 rounded-2xl shadow-2xl shadow-purple-950/10 p-4 flex items-center gap-3.5 pointer-events-auto select-none text-left"
          style={{
            backdropFilter: 'blur(32px) saturate(200%)',
            WebkitBackdropFilter: 'blur(32px) saturate(200%)',
          }}
        >
          {iconMap[toast.type || 'success']}
          <div className="flex-1 min-w-0">
            <p className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">{toast.title}</p>
            <p className="text-zinc-600 dark:text-zinc-300 text-xs mt-0.5 leading-relaxed">{toast.message}</p>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors p-1.5 rounded-full hover:bg-stone-200/50 dark:hover:bg-zinc-800/50 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
