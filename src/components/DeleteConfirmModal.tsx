import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trash2, AlertTriangle, X } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  title?: string;
  itemName?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  isDangerous?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DeleteConfirmModal({
  isOpen,
  title = 'Подтверждение удаления',
  itemName,
  description,
  confirmText = 'Удалить',
  cancelText = 'Отмена',
  isDangerous = true,
  onConfirm,
  onCancel
}: DeleteConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/45 backdrop-blur-sm animate-fadeIn">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="bg-white/92 dark:bg-zinc-900/95 rounded-3xl max-w-sm sm:max-w-md w-full p-6 shadow-2xl shadow-purple-950/20 border border-white/80 dark:border-white/10 text-left relative overflow-hidden"
          style={{
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
          }}
        >
          {/* Header icon & close button */}
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className={`p-3 rounded-2xl ${isDangerous ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20' : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'}`}>
              {isDangerous ? <Trash2 className="w-6 h-6 shrink-0" /> : <AlertTriangle className="w-6 h-6 shrink-0" />}
            </div>
            <button
              type="button"
              onClick={onCancel}
              className="p-1.5 rounded-full hover:bg-white/30 dark:hover:bg-zinc-800/50 text-zinc-600 dark:text-zinc-300 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Title & Description */}
          <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-2">
            {title}
          </h3>
          <p className="text-xs sm:text-sm text-zinc-800 dark:text-zinc-200 font-medium leading-relaxed mb-6">
            {description ? (
              description
            ) : itemName ? (
              <>
                Вы действительно хотите удалить <strong className="text-zinc-950 dark:text-white font-bold">«{itemName}»</strong>? Это действие нельзя будет отменить.
              </>
            ) : (
              'Вы действительно хотите удалить этот элемент? Это действие нельзя будет отменить.'
            )}
          </p>

          {/* Action buttons */}
          <div className="flex items-center gap-3 justify-end pt-2 border-t border-stone-100 dark:border-zinc-800/80">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2.5 rounded-full text-xs sm:text-sm font-semibold text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-zinc-700 hover:bg-stone-100 dark:hover:bg-zinc-800 transition-all cursor-pointer"
            >
              {cancelText}
            </button>
            <button
              type="button"
              onClick={() => {
                onConfirm();
              }}
              className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold text-white shadow-md transition-all cursor-pointer ${
                isDangerous
                  ? 'bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-700 hover:to-red-800 shadow-rose-900/20'
                  : 'bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 shadow-amber-900/20'
              }`}
            >
              {confirmText}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
